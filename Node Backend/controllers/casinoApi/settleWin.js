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
  console.log(new Date(), " get settle_win : message:: ", message);
  console.log(new Date(), " get settle_win : key :: ", key);

  message = typeof message === "string" ? JSON.parse(message) : message;
  const { txns } = message;

  for await (const transaction of txns) {
    const {
      platform,
      gameType,
      // turnover,
      userId,
      betAmount,
      roundId,
      platformTxId,
      winAmount,
      refPlatformTxId,
      settleType,
    } = transaction;
    const query = {
      $or: [
        { casinoUserName: { $regex: `^${userId}$`, $options: "i" } },
        { user_name: { $regex: `^${userId}$`, $options: "i" } },
      ],
    };

    let turnover = 0;
    let status = "";
    let winLoss = 0;

    const betQuery = {
      userId,
      // roundId,
      // platformTxId,
    };
    if (CASINO_NAME.FASTSPIN !== platform) {
      betQuery.roundId = roundId;
    }

    if (settleType === "platformTxId") {
      betQuery.platformTxId = platformTxId;
    } else if (settleType === "refPlatformTxId") {
      betQuery.platformTxId = refPlatformTxId;
    }

    if (
      CASINO_NAME.KINGMAKER === platform ||
      (CASINO_NAME.JILI === platform &&
        SUB_CASINO_NAME.JILI_TABLE === gameType) ||
      CASINO_NAME.LUDO === platform ||
      CASINO_NAME.YL === platform ||
      CASINO_NAME.ESPORTS === platform ||
      CASINO_NAME.DRAGOONSOFT === platform ||
      CASINO_NAME.SV388 === platform ||
      CASINO_NAME.BG === platform ||
      CASINO_NAME.SABA === platform ||
      CASINO_NAME.FASTSPIN === platform ||
      CASINO_NAME.HORSEBOOK === platform ||
      CASINO_NAME.PRAGMATIC === platform ||
      CASINO_NAME.PP === platform ||
      CASINO_NAME.SPADE === platform ||
      CASINO_NAME.YESBINGO === platform ||
      // CASINO_NAME.JDB === platform ||
      CASINO_NAME.EVOLUTION === platform ||
      CASINO_NAME.BTG === platform ||
      CASINO_NAME.NETENT === platform ||
      CASINO_NAME.HOTROAD === platform ||
      CASINO_NAME.RT === platform ||
      CASINO_NAME.NLC === platform ||
      CASINO_NAME.SPRIBE === platform ||
      Object.keys(CASINO_NAME)
        .map((key) => CASINO_NAME[key])
        .includes(platform)
    ) {
      turnover = Math.abs(winAmount - betAmount);
      winLoss = winAmount - betAmount;
      if (winLoss > 0) status = GAME_STATUS.WIN;
      else status = GAME_STATUS.LOSE;

      if (
        (CASINO_NAME.BG === platform || CASINO_NAME.SABA === platform) &&
        winLoss === 0
      ) {
        status = GAME_STATUS.TIE;
      }

      if (
        CASINO_NAME.ESPORTS === platform &&
        transaction.gameInfo.txnResult === "DRAW"
      ) {
        status = GAME_STATUS.TIE;
      }
    }
    // else if (CASINO_NAME.LUDO === platform) {
    //   turnover = Math.abs(winAmount - betAmount);
    //   winLoss = winAmount - betAmount;
    // }
    // if () {
    //   turnover = transaction.turnover;
    //   status = transaction.gameInfo.txnResult;
    //   winLoss = transaction.winAmount;
    // } else
    else {
      turnover = transaction.turnover;
      status = transaction.gameInfo.status;
      winLoss = transaction.gameInfo.winLoss;
    }

    console.log(
      new Date(),
      "data :: turnover : ",
      turnover,
      "winLoss :: ",
      winLoss,
      status
    );
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

    if (!userInfo) {
      res.send({
        status: "1000",
        desc: "Invalid user Id",
      });
      // Check for above user data
      throw new ApiError(httpStatus.BAD_REQUEST, CUSTOM_MESSAGE.USER_NOT_FOUND);
    }

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
    // kingmaker same bet win 2 times and add difference amount
    if (betInfo && (!betInfo.isMatchComplete || betAmount === 0)) {
      await mongo.bettingApp.model(mongo.models.casinoMatchHistory).updateOne({
        query: betQuery,
        update: {
          $set: {
            gameInfo: transaction.gameInfo,
          },
        },
      });
      await settleWinHelper(
        betQuery,
        query,
        status,
        turnover,
        betAmount,
        winLoss
      );

      // add statement
      await casinoStateMentTrack({
        userId: userInfo._id,
        win: winLoss,
        casinoMatchId: betInfo._id,
        betAmount,
      });
    } else if (
      !betInfo &&
      CASINO_NAME.JILI === platform &&
      SUB_CASINO_NAME.JILI_TABLE === gameType
    ) {
      transaction.userObjectId = userInfo._id;

      const inserBet = await mongo.bettingApp
        .model(mongo.models.casinoMatchHistory)
        .insertOne({ document: transaction });
      console.log(new Date(), " settleWin ::  inserBet ::: ", inserBet);
      let newBetAmount = betAmount;
      if (
        CASINO_NAME.JILI === platform &&
        SUB_CASINO_NAME.JILI_TABLE === gameType
      ) {
        winLoss = transaction.winAmount;
        newBetAmount = 0;
      }

      await mongo.bettingApp.model(mongo.models.casinoMatchHistory).updateOne({
        query: betQuery,
        update: {
          $set: {
            gameInfo: transaction.gameInfo,
          },
        },
      });
      await settleWinHelper(
        betQuery,
        query,
        status,
        turnover,
        newBetAmount,
        winLoss
      );

      // add statement
      await casinoStateMentTrack({
        userId: userInfo._id,
        win: winLoss,
        casinoMatchId: inserBet._id,
        betAmount,
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
};
