const httpStatus = require("http-status");
const joi = require("joi");
const mongo = require("../../../../config/mongodb");
const ApiError = require("../../../../utils/ApiError");
// const {
//   winnerUserDetailforOddsAndBook,
//   formentWinnerUserDetail,
// } = require("../../../utils/sport/getWinnerUserDetail");
const { distributAmount } = require("../utile/sports");
const CUSTOM_MESSAGE = require("../../../../utils/message");
const {
  formentWinnerUserDetail,
} = require("../../../utils/sport/oddsWinning/winUserForment");
const { getRedLock } = require("../../../../config/redLock");
const { fancyScheduler } = require("../../../../utils/scheduler/fancyScheduler");

const payload = {
  body: joi.object().keys({
    id: joi.string().required(),
    winner: joi.string().required(), // name of team
  }),
};
/*
winner value like : teamName1, teamName2, cancel, draw
type : cricket
betType : odds, bookMark
*/

// this winner declare handle odds and bookmaker
async function handler({ body }) {
  const { id, winner } = body;

  const query = {
    _id: mongo.ObjectId(id),
    gameStatus: { $ne: "completed" },
  };

  const getLock = getRedLock();
  const matchLock = await getLock.acquire([id], 10000);
  const isOnGoing = await fancyScheduler.checkScheduler(id);
  if (isOnGoing) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "sports winner process is on going try after a min."
    );
  }
  try {
    // declareWinner(winner, id);
    await fancyScheduler.addToScheduler(id);
    const sportsInfo = await mongo.bettingApp
      .model(mongo.models.sports)
      .findOne({
        query,
        select: {
          type: 1,
        },
      });

    if (!sportsInfo)
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        CUSTOM_MESSAGE.MATCH_NOT_FOUND
      );

    const oddsInfo = await formentWinnerUserDetail(
      winner,
      "odds",
      id,
      sportsInfo.type
    );

    await distributAmount(oddsInfo, id, "", "odds");
    console.log("pass the distributAmount : odds");
    const bookMarkInfo = await formentWinnerUserDetail(
      winner,
      "bookMark",
      id,
      sportsInfo.type
    );

    await distributAmount(bookMarkInfo, id, "", "bookMark");
    console.log("pass the distributAmount : bookMark");
    
    await mongo.bettingApp.model(mongo.models.sports).updateOne({
      query,
      update: {
        winner,
        gameStatus: "completed",
      },
    });

    // await mongo.bettingApp.model(mongo.models.betsHistory).updateMany({
    //   query: {
    //     matchId: mongo.ObjectId(id),
    //     betStatus: { $ne: "completed" },
    //     betType: { $in: ["odds", "bookMark"] },
    //   },
    //   update: {
    //     winner,
    //     betStatus: "completed",
    //   },
    // });
    await mongo.bettingApp.model(mongo.models.betsHistory).updateMany({
      query: {
        matchId: mongo.ObjectId(id),
        betStatus: { $ne: "completed" },
        betType: { $in: ["odds", "bookMark"] },
      },
      update: [
        {
          $set: {
            tType: {
              $switch: {
                branches: [
                  {
                    case: { $eq: [winner, "cancel"] },
                    then: "cancel",
                  },
                  {
                    case: {
                      $and: [
                        { $eq: ["$selection", winner] },
                        { $eq: ["$betSide", "back"] },
                      ],
                    },
                    then: "win",
                  },
                  {
                    case: {
                      $and: [
                        { $ne: ["$selection", winner] },
                        { $eq: ["$betSide", "lay"] },
                      ],
                    },
                    then: "win",
                  },
                ],
                default: "lost",
              },
            },
            betStatus: "completed",
            winner,
          }
        },
      ],
    });

    console.log("pass the distributAmount : update query");

    const data = {
      msg: "declare winner!",
    };
    await fancyScheduler.removeFromScheduler(id);
    console.log("pass the distributAmount : remove id in scheduler and return");
    return data;
  } catch (error) {
    console.error("winner : odds : error : ", error, body);
  } finally {
    await getLock.release(matchLock);
  }
}

module.exports = {
  payload,
  handler,
  auth: true,
};
