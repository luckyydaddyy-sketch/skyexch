const joi = require("joi");
const mongo = require("../../../../config/mongodb");
const {
  formentWinnerUserDetailForFancy,
} = require("../../../utils/sport/getWinnerUserDetail");
const { distributAmountRevert } = require("../utile/sports");
const { getRedLock } = require("../../../../config/redLock");
const {
  fancyScheduler,
} = require("../../../../utils/scheduler/fancyScheduler");
const ApiError = require("../../../../utils/ApiError");
const httpStatus = require("http-status");

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
    betType: "session",
    selection,
    betStatus: "completed",
  };
  const key = `${id}:${selection}`;
  const getLock = getRedLock();
  const matchLock = await getLock.acquire([`${id}:${selection}`], 6000);
  const isOnGoing = await fancyScheduler.checkScheduler(key);
  if (isOnGoing) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "fancy rollBack winner process is on going try after a min."
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
      console.log("bet winner session Already rollBack! : ", query);
      const dataNotFount = {
        msg: "fancy declare winner roll back!",
      };

      return dataNotFount;
    }

    const session = await formentWinnerUserDetailForFancy(
      sportInfo.winner === "cancel" ? -2 : sportInfo.winner,
      "session",
      id,
      sportInfo.type,
      selection
    );

    await distributAmountRevert(session, id, selection, "session");
    console.log("it's done : distributAmountRevert");

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
    console.log("it's return : distributAmountRevert");
    const data = {
      msg: "fancy declare winner roll back!",
    };
    await fancyScheduler.removeFromScheduler(key);
    return data;
  } catch (error) {
    console.error("rollback : fancy : error : ", error, body);
  } finally {
    await getLock.release(matchLock);
  }
}

module.exports = {
  payload,
  handler,
  auth: true,
};
