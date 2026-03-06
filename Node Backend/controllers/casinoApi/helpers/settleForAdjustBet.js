const mongo = require("../../../config/mongodb");
const settleForAdjustBet = async (
  betQuery,
  query,
  status,
  turnover,
  betAmount,
  winLoss
) => {
  betQuery.isMatchComplete = false;
  const modificationObject = await mongo.bettingApp
    .model(mongo.models.casinoMatchHistory)
    .updateOne({
      query: betQuery,
      update: {
        $set: {
          isMatchComplete: true,
          gameStatus: status,
          winLostAmount: turnover,
        },
      },
    });

  console.log(
    new Date(),
    " settleWinHelper :: modificationObject ::: ",
    modificationObject
  );

  if (modificationObject.modifiedCount || betAmount === 0) {
    if (betAmount > 0)
      await mongo.bettingApp.model(mongo.models.users).updateOne({
        query,
        update: {
          $inc: {
            balance: betAmount,
            exposure: -betAmount,
          },
        },
      });

    // const tempWinLoss = winLoss ? winLoss : winAmount - betAmount;
    await mongo.bettingApp.model(mongo.models.users).updateOne({
      query,
      update: {
        $inc: {
          remaining_balance: winLoss,
          balance: winLoss,
          cumulative_pl: winLoss,
          ref_pl: winLoss,
        },
      },
    });
    await mongo.bettingApp.model(mongo.models.users).updateOne({
      query,
      update: {
        $inc: {
          remaining_balance: -betAmount,
          balance: -betAmount,
        },
      },
    });
  }
  return true;
};

module.exports = {
  settleForAdjustBet,
};
