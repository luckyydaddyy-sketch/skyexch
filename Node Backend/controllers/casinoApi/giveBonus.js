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
  try {
    let { key, message } = req.body;
    console.log("get bonus : message:: ", message);
    message = typeof message === "string" ? JSON.parse(message) : message;
    const { txns } = message;
    if (!txns || txns.length === 0) return res.send({ status: "0000" });

    const { userId } = txns[0];
    const userQuery = {
      $or: [
        { casinoUserName: { $regex: `^${userId}$`, $options: "i" } },
        { user_name: { $regex: `^${userId}$`, $options: "i" } },
      ],
    };

    const userInfo = await mongo.bettingApp.model(mongo.models.users).findOne({
      query: userQuery,
      select: { _id: 1, balance: 1 },
    });

    if (!userInfo) {
      return res.send({ status: "1002", desc: "Invalid user Id" });
    }

    const promotionTxIds = txns.map(t => t.promotionTxId);
    const existingBonuses = await mongo.bettingApp.model(mongo.models.casinoBonus).find({
      query: { promotionTxId: { $in: promotionTxIds }, userId: { $regex: `^${userId}$`, $options: "i" } }
    });

    const bonusMap = new Set(existingBonuses.map(b => b.promotionTxId));

    // AWC Compliance: Duplicate Transaction Handling (1016)
    if (txns.length > 0 && txns.every(t => bonusMap.has(t.promotionTxId))) {
      return res.send({
        status: "0000",
        balance: Number(userInfo.balance.toFixed(2)),
        balanceTs: new Date(),
        desc: "Duplicate Transaction (Idempotent)"
      });
    }

    const bulkOpsBonus = [];
    const statementItems = [];
    let totalBonusAmount = 0;

    for (const transaction of txns) {
      if (!bonusMap.has(transaction.promotionTxId)) {
        transaction.userObjectId = userInfo._id;
        bulkOpsBonus.push({ insertOne: { document: transaction } });
        totalBonusAmount += transaction.amount;
        statementItems.push({ amount: transaction.amount, promotionTxId: transaction.promotionTxId });
      }
    }

    if (bulkOpsBonus.length > 0) {
      const results = await mongo.bettingApp.model(mongo.models.casinoBonus).bulkWrite({ operations: bulkOpsBonus });
      
      await mongo.bettingApp.model(mongo.models.users).updateOne({
        query: { _id: userInfo._id },
        update: {
          $inc: {
            remaining_balance: totalBonusAmount,
            balance: totalBonusAmount,
            ref_pl: totalBonusAmount,
            cumulative_pl: totalBonusAmount,
          },
        },
      });

      const { addCasinoBonusStateMentTrack } = require("../utils/statementTrack");
      const insertedIds = Object.values(results.insertedIds);
      for (let i = 0; i < statementItems.length; i++) {
        await addCasinoBonusStateMentTrack({
          userId: userInfo._id,
          win: statementItems[i].amount,
          casinoBonusId: insertedIds[i],
        });
      }
    }

    const finalUser = await mongo.bettingApp.model(mongo.models.users).findOne({
      query: { _id: userInfo._id },
      select: { balance: 1 }
    });

    res.send({
      status: "0000",
      balance: Number((finalUser?.balance || 0).toFixed(2)),
      balanceTs: new Date(),
    });

  } catch (error) {
    console.error("Critical Error in giveBonus Bulk Handler:", error);
    if (!res.headersSent) {
      res.status(500).send({ status: "9999", desc: "Internal Server Error" });
    }
  }
}

module.exports = {
  payload,
  handler,
};
