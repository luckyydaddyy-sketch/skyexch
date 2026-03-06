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
const { settleForAdjustBet } = require("./helpers/settleForAdjustBet");

const payload = {
  body: joi.object().keys({}),
};

async function handler(req, res) {
  let { key, message } = req.body;
  console.log(new Date(), " get adjust : message:: ", message);
  console.log(new Date(), " get adjust : key :: ", key);

  message = typeof message === "string" ? JSON.parse(message) : message;
  const { txns } = message;

  let query = {};
  // let isSend = false;
  for await (const transaction of txns) {
    const { userId, betAmount, roundId, platformTxId, adjustAmount } =
      transaction;
    query = {
      casinoUserName: { $regex: `^${userId}$`, $options: "i" },
    };

    const betQuery = {
      userId,
      roundId,
      platformTxId,
    };

    console.log(new Date(), "data :: adjust : adjustAmount : ", adjustAmount);
    console.log(new Date(), " betQuery :: ", betQuery);
    let userInfo = await mongo.bettingApp.model(mongo.models.users).findOne({
      query,
      select: {
        balance: 1,
        remaining_balance: 1,
        exposure: 1,
        _id: 1,
      },
    });

    console.log("adjust : userInfo ::: ", userInfo);
    if (!userInfo) {
      res.send({
        status: "1000",
        desc: "Invalid user Id",
      });
      // Check for above user data
      throw new ApiError(httpStatus.BAD_REQUEST, CUSTOM_MESSAGE.USER_NOT_FOUND);
    }

    // if (userInfo && userInfo.balance < betAmount) {
    //   isSend = true;
    //   const sendData = {
    //     status: userInfo.balance >= requireAmount ? "0000" : "1018",
    //     balance: userInfo.balance,
    //     balanceTs: new Date(),
    //   };

    //   res.send(sendData);
    //   break;
    // }

    let betInfo = await mongo.bettingApp
      .model(mongo.models.casinoMatchHistory)
      .findOne({
        query: betQuery,
        select: {
          isMatchComplete: 1,
          _id: 1,
        },
      });
    console.log(new Date(), " betInfo ::: settle win :: ", betInfo);

    if (betInfo && (!betInfo.isMatchComplete || betAmount === 0)) {
      await mongo.bettingApp.model(mongo.models.casinoMatchHistory).updateOne({
        query: betQuery,
        update: {
          $set: {
            gameInfo: transaction.gameInfo,
            betAmount: betAmount,
          },
        },
      });

      await mongo.bettingApp.model(mongo.models.users).updateOne({
        query,
        update: {
          $inc: {
            balance: adjustAmount,
            exposure: -adjustAmount,
          },
        },
      });
    }
  }

  const userInfoLast = await mongo.bettingApp
    .model(mongo.models.users)
    .findOne({
      query,
      select: {
        balance: 1,
        // remaining_balance: 1,
        // exposure: 1,
        // _id: 1,
      },
    });
  const sendData = {
    status: "0000",
    balance: Number(userInfoLast.balance.toFixed(2)),
    balanceTs: new Date(),
  };

  res.send(sendData);
}

module.exports = {
  payload,
  handler,
};
