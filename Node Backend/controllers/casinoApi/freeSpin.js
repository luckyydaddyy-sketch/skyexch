const joi = require("joi");
const mongo = require("../../config/mongodb");
const {
  addCasinoBonusStateMentTrack,
  addCasinoFreeSpinStateMentTrack,
} = require("../utils/statementTrack");
const ApiError = require("../../utils/ApiError");
const httpStatus = require("http-status");
const CUSTOM_MESSAGE = require("../../utils/message");
const { GAME_STATUS } = require("../../constants");

const payload = {
  body: joi.object().keys({}),
};

async function handler(req, res) {
  let { key, message } = req.body;
  console.log("get freeSpin : message:: ", message);
  console.log("get freeSpin : key :: ", key);

  message = typeof message === "string" ? JSON.parse(message) : message;
  const { txns } = message;
  const { userId } = txns[0];
  const query = {
    casinoUserName: { $regex: `^${userId}$`, $options: "i" },
  };

  for await (const transaction of txns) {
    const userInfo = await mongo.bettingApp.model(mongo.models.users).findOne({
      query,
      select: {
        _id: 1,
      },
    });

    const bonusInfo = await mongo.bettingApp
      .model(mongo.models.casinoMatchHistory)
      .findOne({
        query: {
          platformTxId: transaction.platformTxId,
          userId: transaction.userId,
        },
      });

    if (!bonusInfo) {
      transaction.userObjectId = userInfo._id;
      transaction.gameStatus =
        transaction.winAmount > 0 ? GAME_STATUS.WIN : GAME_STATUS.LOSE;
      transaction.isMatchComplete = true;
      transaction.winLostAmount = transaction.winAmount;

      const bonusInfo = await mongo.bettingApp
        .model(mongo.models.casinoMatchHistory)
        .insertOne({ document: transaction });
      await mongo.bettingApp.model(mongo.models.users).updateOne({
        query: {
          casinoUserName: { $regex: `^${transaction.userId}$`, $options: "i" },
        },
        update: {
          $inc: {
            remaining_balance: transaction.winAmount,
            balance: transaction.winAmount,
            ref_pl: transaction.winAmount,
            cumulative_pl: transaction.winAmount,
          },
        },
      });
      await addCasinoFreeSpinStateMentTrack({
        userId: userInfo._id,
        win: transaction.winAmount,
        casinoBonusId: bonusInfo._id,
      });
    }
  }

  const userInfo = await mongo.bettingApp.model(mongo.models.users).findOne({
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

  const sendData = {
    status: "0000",
    balance: Number(userInfo.balance.toFixed(2)),
    balanceTs: new Date(),
  };

  res.send(sendData);
}

module.exports = {
  payload,
  handler,
};
