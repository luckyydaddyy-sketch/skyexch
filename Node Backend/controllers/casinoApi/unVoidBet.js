const joi = require("joi");
const httpStatus = require("http-status");
const mongo = require("../../config/mongodb");
const { GAME_STATUS } = require("../../constants");
const ApiError = require("../../utils/ApiError");
const CUSTOM_MESSAGE = require("../../utils/message");

const payload = {
  body: joi.object().keys({}),
};

async function handler(req, res) {
  let { key, message } = req.body;
  console.log("get unVoidBet  : message:: ", message);
  console.log("get unVoidBet  : key :: ", key);
  message = typeof message === "string" ? JSON.parse(message) : message;
  const { txns } = message;

  for await (const transaction of txns) {
    const { userId, betAmount, roundId, voidType, platformTxId } = transaction;
    const query = {
      casinoUserName: { $regex: `^${userId}$`, $options: "i" },
    };

    let userInfo = await mongo.bettingApp.model(mongo.models.users).findOne({
      // Find user information
      query,
      select: {
        balance: 1,
        remaining_balance: 1,
        exposure: 1,
        _id: 1,
      },
    });

    if (!userInfo) {
      res.send({
        status: "1000",
        desc: "Invalid user Id",
      });
      // Check for above user data
      throw new ApiError(httpStatus.BAD_REQUEST, CUSTOM_MESSAGE.USER_NOT_FOUND);
    }

    const betQuery = {
      roundId,
      userId,
      platformTxId,
    };

    let betInfo = await mongo.bettingApp
      .model(mongo.models.casinoMatchHistory)
      .findOne({
        query: betQuery,
        select: {
          gameStatus: 1,
          isMatchComplete: 1,
          _id: 1,
          betAmount: 1,
        },
      });
    if (
      betInfo &&
      betInfo.gameStatus === GAME_STATUS.VOID &&
      !betInfo.isMatchComplete
    ) {
      await mongo.bettingApp.model(mongo.models.casinoMatchHistory).updateOne({
        query: betQuery,
        update: {
          $set: {
            gameStatus: GAME_STATUS.START,
          },
        },
      });

      await mongo.bettingApp.model(mongo.models.users).updateOne({
        query,
        update: {
          $inc: {
            balance: -betInfo.betAmount,
            exposure: betInfo.betAmount,
          },
        },
      });
    }
  }
  const sendData = {
    status: "0000",
  };
  res.send(sendData);
}

module.exports = {
  payload,
  handler,
  auth: true,
};
