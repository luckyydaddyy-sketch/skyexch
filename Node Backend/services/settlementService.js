const mongo = require("../config/mongodb");
const { distributAmount } = require("../controllers/admin/setting/utile/sports");
const { formentWinnerUserDetail } = require("../controllers/utils/sport/oddsWinning/winUserForment");
const { getRedLock } = require("../config/redLock");
const { fancyScheduler } = require("../utils/scheduler/fancyScheduler");

/**
 * Settles a match by winner name.
 * @param {string} matchId - The MongoDB ID of the match.
 * @param {string} winnerName - The name of the winner (team name or 'cancel').
 * @param {string} settlementType - 'auto' or 'manual'.
 * @param {string} settledBy - 'SYSTEM' or Admin ID.
 */
async function settleMatch(matchId, winnerName, settlementType, settledBy) {
  const query = {
    _id: mongo.ObjectId(matchId),
    gameStatus: { $ne: "completed" },
  };

  const getLock = getRedLock();
  if (!getLock) {
    console.error("Redlock not initialized. Settlement skipped.");
    return;
  }

  let matchLock;
  try {
    matchLock = await getLock.acquire([matchId.toString()], 10000);
  } catch (err) {
    console.log(`Redlock acquisition failed or lock already held for match ${matchId}:`, err.message);
    return;
  }

  try {
    const isOnGoing = await fancyScheduler.checkScheduler(matchId.toString());
    if (isOnGoing) return;

    await fancyScheduler.addToScheduler(matchId.toString());

    const sportsInfo = await mongo.bettingApp
      .model(mongo.models.sports)
      .findOne({
        query,
        select: { type: 1 },
      });

    if (!sportsInfo) return;

    // Settle Odds
    const oddsInfo = await formentWinnerUserDetail(winnerName, "odds", matchId, sportsInfo.type);
    await distributAmount(oddsInfo, matchId, "", "odds");

    // Settle Bookmaker
    const bookMarkInfo = await formentWinnerUserDetail(winnerName, "bookMark", matchId, sportsInfo.type);
    await distributAmount(bookMarkInfo, matchId, "", "bookMark");

    // Update Sports Status
    await mongo.bettingApp.model(mongo.models.sports).updateOne({
      query,
      update: {
        $set: {
          winner: winnerName,
          gameStatus: "completed",
          settledBy: settledBy,
          settledAt: new Date(),
          settlementType: settlementType
        },
      }
    });

    // Update Bets History
    await mongo.bettingApp.model(mongo.models.betsHistory).updateMany({
      query: {
        matchId: mongo.ObjectId(matchId),
        betStatus: { $ne: "completed" },
        betType: { $in: ["odds", "bookMark"] },
      },
      update: [
        {
          $set: {
            tType: {
              $switch: {
                branches: [
                  { case: { $eq: [winnerName, "cancel"] }, then: "cancel" },
                  { case: { $and: [{ $eq: ["$selection", winnerName] }, { $eq: ["$betSide", "back"] }] }, then: "win" },
                  { case: { $and: [{ $ne: ["$selection", winnerName] }, { $eq: ["$betSide", "lay"] }] }, then: "win" },
                ],
                default: "lost",
              },
            },
            betStatus: "completed",
            winner: winnerName,
            settlementType: settlementType,
          }
        },
      ]
    });

    await fancyScheduler.removeFromScheduler(matchId.toString());
    console.log(`Match ${matchId} settled successfully by ${settledBy}`);
  } catch (error) {
    console.error(`Error settling match ${matchId}:`, error);
  } finally {
    if (matchLock) await getLock.release(matchLock);
  }
}

module.exports = {
  settleMatch,
};
