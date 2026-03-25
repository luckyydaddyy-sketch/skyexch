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
  try {
    let { key, message } = req.body;
    console.log("get freeSpin : message:: ", message);
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

    const platformTxIds = txns.map(t => t.platformTxId);
    const existingSpins = await mongo.bettingApp.model(mongo.models.casinoMatchHistory).find({
      query: { platformTxId: { $in: platformTxIds }, userId: { $regex: `^${userId}$`, $options: "i" } }
    });

    const spinMap = new Set(existingSpins.map(s => s.platformTxId));

    // AWC Compliance: Duplicate Transaction Handling (1016)
    if (txns.length > 0 && txns.every(t => spinMap.has(t.platformTxId))) {
      return res.send({
        status: "1016",
        balance: Number(userInfo.balance.toFixed(2)),
        balanceTs: new Date(),
        desc: "Duplicate Transaction"
      });
    }

    const bulkOpsMatch = [];
    const statementItems = [];
    let totalWinAmount = 0;

    for (const transaction of txns) {
      if (!spinMap.has(transaction.platformTxId)) {
        transaction.userObjectId = userInfo._id;
        transaction.gameStatus = transaction.winAmount > 0 ? GAME_STATUS.WIN : GAME_STATUS.LOSE;
        transaction.isMatchComplete = true;
        transaction.winLostAmount = transaction.winAmount;

        bulkOpsMatch.push({ insertOne: { document: transaction } });
        totalWinAmount += transaction.winAmount;
        statementItems.push({ win: transaction.winAmount });
      }
    }

    if (bulkOpsMatch.length > 0) {
      const results = await mongo.bettingApp.model(mongo.models.casinoMatchHistory).bulkWrite({ operations: bulkOpsMatch });
      
      await mongo.bettingApp.model(mongo.models.users).updateOne({
        query: { _id: userInfo._id },
        update: {
          $inc: {
            remaining_balance: totalWinAmount,
            balance: totalWinAmount,
            ref_pl: totalWinAmount,
            cumulative_pl: totalWinAmount,
          },
        },
      });

      const { addCasinoFreeSpinStateMentTrack } = require("../utils/statementTrack");
      const insertedIds = Object.values(results.insertedIds);
      for (let i = 0; i < statementItems.length; i++) {
        await addCasinoFreeSpinStateMentTrack({
          userId: userInfo._id,
          win: statementItems[i].win,
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
    console.error("Critical Error in freeSpin Bulk Handler:", error);
    if (!res.headersSent) {
      res.status(500).send({ status: "9999", desc: "Internal Server Error" });
    }
  }
}

module.exports = {
  payload,
  handler,
};
