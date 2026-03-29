const joi = require("joi");
const httpStatus = require("http-status");
const mongo = require("../../config/mongodb");
const {
  CASINO_NAME,
  GAME_STATUS,
  SUB_CASINO_NAME,
} = require("../../constants");
const { getRedLock } = require("../../config/redLock");
const { settleWinHelper } = require("./helpers/settleWinHelper");
const { casinoStateMentTrack } = require("../utils/statementTrack");
const ApiError = require("../../utils/ApiError");
const CUSTOM_MESSAGE = require("../../utils/message");
const { settleForAdjustBet } = require("./helpers/settleForAdjustBet");

const payload = {
  body: joi.object().keys({}),
};

async function handler(req, res) {
  let lock = null;
  try {
    let { key, message } = req.body;
    console.log(new Date(), " get adjust : message:: ", message);
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
      select: { balance: 1, remaining_balance: 1, exposure: 1, _id: 1 },
    });

    if (!userInfo) {
      return res.send({ status: "1002", desc: "Invalid user Id" });
    }

    // AWC Compliance: Transaction Serialization (Distributed Lock)
    const getLock = getRedLock();
    const lockKeys = [...new Set(txns.map(t => t.platformTxId).filter(Boolean))].map(id => `casino_adjust_${id}`);
    if (getLock && lockKeys.length > 0) {
      try {
        lock = await getLock.acquire(lockKeys, 5000);
      } catch (e) {
        console.error("Redlock acquisition failed in adjustBet:", e.message);
      }
    }

    const platformTxIds = txns.map(t => t.platformTxId);
    const existingHistory = await mongo.bettingApp.model(mongo.models.casinoMatchHistory).find({
      query: {
        userId: { $regex: `^${userId}$`, $options: "i" },
        platformTxId: { $in: platformTxIds },
      }
    });

    const historyMap = new Map();
    existingHistory.forEach(h => historyMap.set(h.platformTxId, h));

    // AWC Compliance: Duplicate Transaction Handling (1016)
    const allProcessed = txns.every(t => {
      const h = historyMap.get(t.platformTxId);
      return h && h.betAmount === t.betAmount; // If amount is already adjusted
    });

    if (allProcessed && existingHistory.length > 0) {
      // ELITE FIX: Fetch fresh balance AFTER lock to ensure we return the state post-original-request
      const freshUser = await mongo.bettingApp.model(mongo.models.users).findOne({
        query: { _id: userInfo._id },
        select: { balance: 1 }
      });
      return res.send({
        status: "0000",
        balance: Number((freshUser?.balance || userInfo.balance).toFixed(4)),
        balanceTs: new Date(),
        desc: "Duplicate Transaction (Idempotent)"
      });
    }

    const bulkOpsHistory = [];
    let totalAdjustAmount = 0;

    for (const transaction of txns) {
      const { platformTxId, betAmount, adjustAmount } = transaction;
      const betInfo = historyMap.get(platformTxId);

      if (betInfo && (!betInfo.isMatchComplete || betAmount === 0)) {
        bulkOpsHistory.push({
          updateOne: {
            filter: { _id: betInfo._id },
            update: {
              $set: {
                gameInfo: transaction.gameInfo,
                betAmount: betAmount,
              },
            },
          },
        });
        totalAdjustAmount += adjustAmount;
      }
    }

    if (bulkOpsHistory.length > 0) {
      await Promise.all([
        mongo.bettingApp.model(mongo.models.casinoMatchHistory).bulkWrite({ operations: bulkOpsHistory }),
        mongo.bettingApp.model(mongo.models.users).updateOne({
          query: { _id: userInfo._id },
          update: {
            $inc: {
              balance: totalAdjustAmount,
              exposure: -totalAdjustAmount,
            },
          },
        })
      ]);
    }

    const finalUser = await mongo.bettingApp.model(mongo.models.users).findOne({
      query: { _id: userInfo._id },
      select: { balance: 1 }
    });

    res.send({
      status: "0000",
      balance: Number((finalUser?.balance || 0).toFixed(4)),
      balanceTs: new Date(),
    });

  } catch (error) {
    console.error("Critical Error in adjustBet Bulk Handler:", error);
    if (!res.headersSent) {
      res.status(500).send({ status: "9999", desc: "Internal Server Error" });
    }
  } finally {
    if (lock) {
      try {
        await lock.release();
      } catch (e) {
        console.error("Redlock release failed in adjustBet:", e.message);
      }
    }
  }
}

module.exports = {
  payload,
  handler,
};

