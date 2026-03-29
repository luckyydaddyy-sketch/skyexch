const joi = require("joi");
const mongo = require("../../config/mongodb");
const {
  GAME_STATUS,
  CASINO_NAME,
  GAME_CODE_FOR_ROUND_ID,
  USER_LEVEL_NEW,
} = require("../../constants");
const { getTotalExposure } = require("./helpers/getTotalExposure");
const { getRedLock } = require("../../config/redLock");

const payload = {
  body: joi.object().keys({}),
};

async function handler(req, res) {
  let lock = null;
  try {
    let { key, message } = req.body;
    console.log("get placeBet : message:: ", message);

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
      select: { balance: 1, exposure: 1, _id: 1, whoAdd: 1 },
    });

    if (!userInfo) {
      return res.send({ status: "1002", desc: "Invalid user Id" });
    }

    // AWC Compliance: Transaction Serialization (Distributed Lock)
    const getLock = getRedLock();
    const lockKeys = [...new Set(txns.map(t => t.platformTxId).filter(Boolean))].map(id => `casino_place_${id}`);
    if (getLock && lockKeys.length > 0) {
      try {
        lock = await getLock.acquire(lockKeys, 5000);
      } catch (e) {
        console.error("Redlock acquisition failed in placeBet:", e.message);
      }
    }

    // Senior Dev Optimization: Fetch Admin and Market limits once
    const [marketDetail, adminInfo] = await Promise.all([
      mongo.bettingApp.model(mongo.models.marketLists).findOne({ query: { name: "Casino" } }),
      mongo.bettingApp.model(mongo.models.admins).findOne({
        query: { _id: { $in: userInfo.whoAdd || [] }, agent_level: USER_LEVEL_NEW.WL },
        select: { casinoWinings: 1, casinoWinLimit: 1, casinoUserBalance: 1 },
      })
    ]);

    const blockMarketDetail = await mongo.bettingApp.model(mongo.models.blockMarketLists).findOne({
      query: { userId: { $in: userInfo.whoAdd }, marketId: mongo.ObjectId(marketDetail._id) },
      sort: { isBlock: -1, updatedAt: -1 },
    });

    if (blockMarketDetail && blockMarketDetail.isBlock) {
      return res.send({ status: "1018", balance: Number(userInfo.balance.toFixed(2)), balanceTs: new Date() });
    }

    const totalBatchExposure = await getTotalExposure(adminInfo?._id);
    const platformTxIds = txns.map(t => t.platformTxId);
    
    // Batch Fetch Existing Match History
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
      return h && h.gameStatus !== GAME_STATUS.CANCEL;
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
    let batchBetTotal = 0;

    for (const transaction of txns) {
      const betInfo = historyMap.get(transaction.platformTxId);
      
      if (!betInfo) {
        batchBetTotal += transaction.betAmount;
        transaction.userObjectId = userInfo._id;
        bulkOpsHistory.push({
          insertOne: { document: transaction }
        });
      } else if (betInfo.gameStatus !== GAME_STATUS.CANCEL && CASINO_NAME.HORSEBOOK !== transaction.platform) {
        batchBetTotal += transaction.betAmount;
        bulkOpsHistory.push({
          updateOne: {
            filter: { _id: betInfo._id },
            update: { $inc: { betAmount: transaction.betAmount } }
          }
        });
      }
    }

    // Aggregate Limit Validation
    const casinoWinings = adminInfo?.casinoWinings || 0;
    const casinoUserBalance = adminInfo?.casinoUserBalance || 0;
    
    // IF admin exists, check aggregate limits. IF root (no WL), bypass aggregate checks.
    const isOverAdminLimit = adminInfo && (
      -casinoWinings >= casinoUserBalance ||
      batchBetTotal > casinoUserBalance ||
      -casinoWinings + totalBatchExposure + batchBetTotal >= casinoUserBalance
    );

    if (Number(userInfo.balance.toFixed(4)) < batchBetTotal || isOverAdminLimit) {
      return res.send({ status: "1018", balance: Number(userInfo.balance.toFixed(4)), balanceTs: new Date() });
    }

    // Atomic Execution
    if (bulkOpsHistory.length > 0) {
      await Promise.all([
        mongo.bettingApp.model(mongo.models.casinoMatchHistory).bulkWrite({ operations: bulkOpsHistory }),
        mongo.bettingApp.model(mongo.models.users).updateOne({
          query: { _id: userInfo._id },
          update: {
            $inc: {
              balance: -batchBetTotal,
              exposure: batchBetTotal,
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
    console.error("Critical Error in placeBet Bulk Handler:", error);
    if (!res.headersSent) {
      res.status(500).send({ status: "9999", desc: "Internal Server Error" });
    }
  } finally {
    if (lock) {
      try {
        await lock.release();
      } catch (e) {
        console.error("Redlock release failed in placeBet:", e.message);
      }
    }
  }
}

module.exports = {
  payload,
  handler,
};

