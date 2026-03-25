const joi = require("joi");
const mongo = require("../../config/mongodb");
const { addCasinoBonusStateMentTrack } = require("../utils/statementTrack");
const ApiError = require("../../utils/ApiError");
const httpStatus = require("http-status");
const CUSTOM_MESSAGE = require("../../utils/message");

const payload = {
  body: joi.object().keys({}),
};

async function handler(req, res) {
  let { key, message } = req.body;
  console.log("get bonus : message:: ", message);
  console.log("get bonus : key :: ", key);

  message = typeof message === "string" ? JSON.parse(message) : message;
  const { txns } = message;
  const { userId } = txns[0];
  const query = {
    $or: [
      { casinoUserName: { $regex: `^${userId}$`, $options: "i" } },
      { user_name: { $regex: `^${userId}$`, $options: "i" } },
    ],
  };

  for await (const transaction of txns) {
    const userInfo = await mongo.bettingApp.model(mongo.models.users).findOne({
      query,
      select: {
        _id: 1,
      },
    });

    const bonusInfo = await mongo.bettingApp
      .model(mongo.models.casinoBonus)
      .findOne({
        query: {
          promotionTxId: transaction.promotionTxId,
          userId: transaction.userId,
        },
      });

    if (!bonusInfo) {
      transaction.userObjectId = userInfo._id;
      const bonusInfo = await mongo.bettingApp
        .model(mongo.models.casinoBonus)
        .insertOne({ document: transaction });
      await mongo.bettingApp.model(mongo.models.users).updateOne({
        query: {
          $or: [
            { casinoUserName: { $regex: `^${transaction.userId}$`, $options: "i" } },
            { user_name: { $regex: `^${transaction.userId}$`, $options: "i" } },
          ],
        },
        update: {
          $inc: {
            remaining_balance: transaction.amount,
            balance: transaction.amount,
            ref_pl: transaction.amount,
            cumulative_pl: transaction.amount,
          },
        },
      });
      await addCasinoBonusStateMentTrack({
        userId: userInfo._id,
        win: transaction.amount,
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
