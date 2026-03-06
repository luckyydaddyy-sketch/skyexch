const joi = require("joi");
const mongo = require("../../../../config/mongodb");
const {
  formentWinnerUserDetailforPremium,
} = require("../../../utils/sport/getWinnerUserDetail");
const { distributAmountRevert } = require("../utile/sports");
const { getRedLock } = require("../../../../config/redLock");
const {
  fancyScheduler,
} = require("../../../../utils/scheduler/fancyScheduler");
const httpStatus = require("http-status");
const ApiError = require("../../../../utils/ApiError");

const payload = {
  body: joi.object().keys({
    id: joi.string().required(), // sport id
    selection: joi.string().required(),
  }),
};

// this winner declare handle odds and bookmaker
async function handler({ body }) {
  const { id, selection } = body;

  const query = {
    matchId: mongo.ObjectId(id),
    betType: "premium",
    selection,
    betStatus: "completed",
  };
  const getLock = getRedLock();
  const key = `${id}:${selection}`;
  const matchLock = await getLock.acquire([`${id}:${selection}`], 3000);
  const isOnGoing = await fancyScheduler.checkScheduler(key);
  if (isOnGoing) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "premium rollback winner process is on going try after a min."
    );
  }
  try {
    await fancyScheduler.addToScheduler(key);
    const sportInfo = await mongo.bettingApp
      .model(mongo.models.betsHistory)
      .findOne({
        query,
        select: {
          type: 1,
          winner: 1,
        },
      });

    if (!sportInfo) {
      console.log("bet winner premium Already declear! : ", query);
      const dataNotFount = {
        msg: "premium declare winner roll back!",
      };

      return dataNotFount;
    }

    const premium = await formentWinnerUserDetailforPremium(
      sportInfo.winner.split("#"),
      id,
      sportInfo.type,
      selection
    );

    await distributAmountRevert(premium, id, selection, "premium");

    await mongo.bettingApp.model(mongo.models.betsHistory).updateMany({
      query,
      update: {
        $set: {
          winner: "",
          tType: "",
          betStatus: "running",
        },
        $inc: {
          rollBackCount: 1,
        },
      },
    });

    const data = {
      msg: "premium declare winner roll back!",
    };
    await fancyScheduler.removeFromScheduler(key);
    return data;
  } catch (error) {
    console.error("rollback : premium : error : ", error, body);
  } finally {
    await getLock.release(matchLock);
  }
}

module.exports = {
  payload,
  handler,
  auth: true,
};
