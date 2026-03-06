const joi = require("joi");
const mongo = require("../../../../config/mongodb");
const { distributAmount } = require("../utile/sports");
const {
  formentWinnerUserDetailForFancy,
} = require("../../../utils/sport/getWinnerUserDetail");
const { getRedLock } = require("../../../../config/redLock");
const config = require("../../../../config/config");
const redisData = require("../../../../config/redis");
const {
  fancyScheduler,
} = require("../../../../utils/scheduler/fancyScheduler");
const ApiError = require("../../../../utils/ApiError");
const httpStatus = require("http-status");

const payload = {
  body: joi.object().keys({
    id: joi.string().required(),
    selection: joi.string().required(),
    winner: joi.number().required(), // team score // -2 is cancel
  }),
};

// this winner declare handle odds and bookmaker
async function handler({ body }) {
  const { id, winner, selection } = body;
  const { FANCY_WINNER_SELECTION } = config;

  // const data1 = {
  //   msg: "fancy declare winner!",
  // };

  // return data1;

  const query = {
    matchId: mongo.ObjectId(id),
    betType: "session",
    selection,
    betStatus: { $ne: "completed" },
  };

  const getLock = getRedLock();
  const key = `${id}:${selection}`;
  const matchLock = await getLock.acquire([`${id}:${selection}`], 6000);
  const isOnGoing = await fancyScheduler.checkScheduler(key);
  if (isOnGoing) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "fancy winner process is on going try after a min."
    );
  }
  try {
    let newWinner = 0;
    if (winner === -2) {
      newWinner = "cancel";
    } else {
      newWinner = winner;
    }
    await fancyScheduler.addToScheduler(key);
    const sportInfo = await mongo.bettingApp
      .model(mongo.models.sports)
      .findOne({
        query: {
          _id: mongo.ObjectId(id),
        },
        select: {
          type: 1,
        },
      });

    const betInfo = await mongo.bettingApp
      .model(mongo.models.betsHistory)
      .findOne({
        query,
        select: {
          type: 1,
        },
      });

    if (!betInfo) {
      console.log("bet winner session Already declear! : ", query);
      const dataNotFount = {
        msg: "fancy declare winner!",
      };

      return dataNotFount;
    }

    const session = await formentWinnerUserDetailForFancy(
      winner,
      "session",
      id,
      sportInfo.type,
      selection
    );

    console.log("declear winner of fancy session ::: ");
    console.log(session);

    await distributAmount(session, id, selection, "session");

    // if (newWinner === "cancel") {
    //   await mongo.bettingApp.model(mongo.models.betsHistory).updateMany({
    //     query,
    //     update: {
    //       winner: newWinner,
    //       betStatus: "completed",
    //     },
    //   });
    // } else {

    console.log("newWinner ::: ", newWinner);
    console.log("newWinner ::: ", typeof newWinner);
    const dataTest = await mongo.bettingApp
      .model(mongo.models.betsHistory)
      .updateMany({
        query,
        update: [
          {
            $set: {
              tType: {
                $switch: {
                  branches: [
                    {
                      case: { $eq: [newWinner, "cancel"] },
                      then: "cancel",
                    },
                    {
                      case: {
                        // >=
                        // <=
                        $and: [
                          { $lte: ["$fancyYes", Number(newWinner)] },
                          { $eq: ["$betSide", "yes"] },
                        ],
                      },
                      then: "win",
                    },
                    {
                      case: {
                        // >
                        $and: [
                          { $gt: ["$fancyNo", Number(newWinner)] },
                          { $eq: ["$betSide", "no"] },
                        ],
                      },
                      then: "win",
                    },
                  ],
                  default: "lost",
                },
              },
              betStatus: "completed",
              winner: newWinner,
            },
          },
        ],
        // options: {
        //   multi: true,
        // },
      });
    // }
    console.log("dataTest :: ", dataTest);
    const data = {
      msg: "fancy declare winner!",
    };
    await fancyScheduler.removeFromScheduler(key);
    return data;
  } catch (error) {
    console.error("winner : fancy : error : ", error, body);
  } finally {
    await getLock.release(matchLock);
  }
}

module.exports = {
  payload,
  handler,
  auth: true,
};
