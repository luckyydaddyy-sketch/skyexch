const httpStatus = require("http-status");
const joi = require("joi");
const mongo = require("../../../../config/mongodb");
const ApiError = require("../../../../utils/ApiError");
const { distributAmountRevert } = require("../utile/sports");
const CUSTOM_MESSAGE = require("../../../../utils/message");
const {
  formentWinnerUserDetail,
} = require("../../../utils/sport/oddsWinning/winUserForment");
const { getRedLock } = require("../../../../config/redLock");
const {
  fancyScheduler,
} = require("../../../../utils/scheduler/fancyScheduler");

const payload = {
  body: joi.object().keys({
    id: joi.string().required(),
  }),
};

async function rollBackWinner(id) {
  const query = {
    matchId: id,
    betType: { $in: ["odds", "bookMark"] },
    betStatus: "completed",
    deleted: false,
  };

  const betList = await mongo.bettingApp.model(mongo.models.betsHistory).find({
    query,
    select: {
      betSide: 1,
      userId: 1,
      betPlaced: 1,
      profit: 1,
      exposure: 1,
      selection: 1,
      winner: 1,
    },
  });

  for await (const bet of betList) {
    let update = {};
    let status = "";
    const { _id, userId, betPlaced, profit, exposure, winner } = bet;
    if (winner === "cancel") {
      update = {
        $inc: {
          remaining_balance: -betPlaced,
          exposure: exposure,
        },
      };
      // status = 'cancel';
    } else if (betSide === "back") {
      if (bet.selection === winner) {
        const remaining_balance = betPlaced + profit;

        update = {
          $inc: {
            balance: -profit,
            remaining_balance: -remaining_balance,
            exposure: exposure,
          },
        };
      } else if (winner !== "") {
        update = {
          $inc: {
            balance: betPlaced,
            exposure: exposure,
          },
        };
      }
    } else if (betSide === "lay") {
      if (bet.selection === winner) {
        const remaining_balance = betPlaced + profit;

        update = {
          $inc: {
            balance: -profit,
            remaining_balance: -remaining_balance,
            exposure: exposure,
          },
        };
      } else if (winner !== "") {
        update = {
          $inc: {
            balance: betPlaced,
            exposure: exposure,
          },
        };
      }
    }

    await mongo.bettingApp.model(mongo.models.users).updateOne({
      query: {
        _id: userId,
      },
      update,
    });

    await mongo.bettingApp.model(mongo.models.betsHistory).updateOne({
      query: {
        _id,
      },
      update: {
        winner: "",
        betStatus: "running",
        tType: status,
      },
    });
  }

  return true;
}

async function handler({ body }) {
  const { id } = body;

  const query = {
    _id: mongo.ObjectId(id),
    gameStatus: "completed",
  };

  const getLock = getRedLock();
  const matchLock = await getLock.acquire([id], 3000);
  const isOnGoing = await fancyScheduler.checkScheduler(id);
  if (isOnGoing) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "sports rollBack winner process is on going try after a min."
    );
  }

  try {
    await fancyScheduler.addToScheduler(id);
    const sportsInfo = await mongo.bettingApp
      .model(mongo.models.sports)
      .findOne({
        query,
        select: {
          type: 1,
          winner: 1,
        },
      });

    if (!sportsInfo)
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        CUSTOM_MESSAGE.MATCH_NOT_FOUND
      );

    const oddsInfo = await formentWinnerUserDetail(
      sportsInfo.winner,
      "odds",
      id,
      sportsInfo.type
    );

    await distributAmountRevert(oddsInfo, id, "", "odds");

    const bookMarkInfo = await formentWinnerUserDetail(
      sportsInfo.winner,
      "bookMark",
      id,
      sportsInfo.type
    );

    await distributAmountRevert(bookMarkInfo, id, "", "bookMark");

    await mongo.bettingApp.model(mongo.models.sports).updateOne({
      query,
      update: {
        winner: "",
        gameStatus: "running",
      },
    });

    await mongo.bettingApp.model(mongo.models.betsHistory).updateMany({
      query: {
        matchId: mongo.ObjectId(id),
        betStatus: "completed",
        betType: { $in: ["odds", "bookMark"] },
      },
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
      msg: "declare winner rollBack!",
    };
    await fancyScheduler.removeFromScheduler(id);
    return data;
  } catch (error) {
    console.error("rollback : odds : error : ", error, body);
  } finally {
    await getLock.release(matchLock);
  }
}

module.exports = {
  payload,
  handler,
  auth: true,
};
