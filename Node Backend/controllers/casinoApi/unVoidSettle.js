const joi = require("joi");
const httpStatus = require("http-status");
const mongo = require("../../config/mongodb");
const {
  CASINO_NAME,
  GAME_STATUS,
  SUB_CASINO_NAME,
} = require("../../constants");
const { settleWinHelper } = require("./helpers/settleWinHelper");
const { casinoStateMentTrack } = require("../utils/statementTrack");
const ApiError = require("../../utils/ApiError");
const CUSTOM_MESSAGE = require("../../utils/message");

const payload = {
  body: joi.object().keys({}),
};

async function handler(req, res) {
  let { key, message } = req.body;
  console.log("get unVoidSettle  : message:: ", message);
  console.log("get unVoidSettle : key :: ", key);
  message = typeof message === "string" ? JSON.parse(message) : message;
  const { txns } = message;

  for await (const transaction of txns) {
    const { userId, roundId, platformTxId, voidType } = transaction;
    const query = {
      $or: [
        { casinoUserName: { $regex: `^${userId}$`, $options: "i" } },
        { user_name: { $regex: `^${userId}$`, $options: "i" } },
      ],
    };
    let userInfo = await mongo.bettingApp.model(mongo.models.users).findOne({
      // Find user information
      query,
      select: {
        balance: 1,
        remaining_balance: 1,
        cumulative_pl: 1,
        ref_pl: 1,
        exposure: 1,
        _id: 1,
      },
    });

    console.log("unVoidSettle ::: userInfo : ", userInfo);
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
          winLostAmount: 1,
          betAmount: 1,
          gameStatus: 1,
          winLostAmountForVoidSettel: 1,
          _id: 1,
        },
      });
    console.log("unVoidSettle ::: betInfo : ", betInfo);
    if (
      betInfo &&
      !betInfo.isMatchComplete &&
      betInfo.gameStatus === GAME_STATUS.VOID
    ) {
      // let winLostAmount = 0;
      const betAmount = betInfo.betAmount;
      const winLostAmount = betInfo.winLostAmountForVoidSettel;
      // if (betInfo.gameStatus === GAME_STATUS.WIN) {
      // winLostAmount -= betInfo.winLostAmountForVoidSettel;
      // } else if (betInfo.gameStatus === GAME_STATUS.LOSE) {
      //   winLostAmount += betInfo.winLostAmountForVoidSettel;
      // }

      let status = GAME_STATUS.VOID;

      if (winLostAmount > 0) {
        status = GAME_STATUS.WIN;
      } else {
        status = GAME_STATUS.LOSE;
      }

      await mongo.bettingApp.model(mongo.models.users).updateOne({
        query,
        update: {
          $inc: {
            balance: -betAmount,
            exposure: betAmount,
          },
        },
      });

      await settleWinHelper(
        betQuery,
        query,
        status,
        winLostAmount,
        betAmount,
        winLostAmount
      );

      // add statement
      await casinoStateMentTrack({
        userId: userInfo._id,
        win: winLostAmount,
        casinoMatchId: betInfo._id,
        betAmount,
      });

      console.log("unVoidSettle :: betInfo :: remove :: ");
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
};
