const joi = require("joi");
const mongo = require("../../../../config/mongodb");
const {
  formentWinnerUserDetailforPremium,
} = require("../../../utils/sport/getWinnerUserDetail");
const { distributAmount } = require("../utile/sports");
const { getRedLock } = require("../../../../config/redLock");
const {
  fancyScheduler,
} = require("../../../../utils/scheduler/fancyScheduler");
const ApiError = require("../../../../utils/ApiError");
const httpStatus = require("http-status");

const payload = {
  body: joi.object().keys({
    id: joi.string().required(),
    selection: joi.string().required(),
    winner: joi.array().required(), // name of team
  }),
};

// this winner declare handle odds and bookmaker
async function handler({ body }) {
  const { id, winner, selection } = body;

  const query = {
    matchId: mongo.ObjectId(id),
    betType: "premium",
    selection,
    betStatus: { $ne: "completed" },
  };
  const getLock = getRedLock();
  const key = `${id}:${selection}`;
  const matchLock = await getLock.acquire([key], 3000);
  const isOnGoing = await fancyScheduler.checkScheduler(key);
  if (isOnGoing) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "premium winner process is on going try after a min."
    );
  }
  try {
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
      console.log("bet winner premium Already declear! : ", query);
      const dataNotFount = {
        msg: "premium declare winner!",
      };

      return dataNotFount;
    }

    const premium = await formentWinnerUserDetailforPremium(
      winner,
      id,
      sportInfo.type,
      selection
    );

    await distributAmount(premium, id, selection, "premium");

    // await mongo.bettingApp.model(mongo.models.betsHistory).updateMany({
    //   query,
    //   update: {
    //     winner,
    //     betStatus: "completed",
    //   },
    // });
    await mongo.bettingApp.model(mongo.models.betsHistory).updateMany({
      query,
      update: [
        {
          $set: {
            tType: {
              $switch: {
                branches: [
                  {
                    case: { $in: ["cancel", winner] },
                    then: "cancel",
                  },
                  {
                    case: {
                      $and: [
                        { $in: ["$subSelection", winner] },
                        { $eq: ["$betSide", "back"] },
                      ],
                    },
                    then: "win",
                  },
                ],
                default: "lost",
              },
            },
            betStatus: "completed",
            winner: winner.join("#"),
          },
        },
      ],
    });

    const data = {
      msg: "premium declare winner!",
    };
    await fancyScheduler.removeFromScheduler(key);
    return data;
  } catch (error) {
    console.error("winner : premium : error : ", error, body);
  } finally {
    await getLock.release(matchLock);
  }
}

module.exports = {
  payload,
  handler,
  auth: true,
};
