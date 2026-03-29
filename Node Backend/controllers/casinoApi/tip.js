const joi = require("joi");
const mongo = require("../../config/mongodb");
const { USER_LEVEL_NEW, GAME_STATUS } = require("../../constants");
const { getRedLock } = require("../../config/redLock");

const payload = {
  body: joi.object().keys({}),
};

async function handler(req, res) {
  let lock = null;
  try {
    let { key, message } = req.body;
    console.log("get tip : message:: ", message);

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

    const [userInfo, marketDetail] = await Promise.all([
      mongo.bettingApp.model(mongo.models.users).findOne({
        query: userQuery,
        select: { balance: 1, remaining_balance: 1, _id: 1, whoAdd: 1, casinoWinings: 1 },
      }),
      mongo.bettingApp.model(mongo.models.marketLists).findOne({ query: { name: "Casino" } })
    ]);

    if (!userInfo) {
      return res.send({ status: "1002", desc: "Invalid user Id" });
    }

    // AWC Compliance: Transaction Serialization (Distributed Lock)
    const getLock = getRedLock();
    const lockKeys = [...new Set(txns.map(t => t.platformTxId).filter(Boolean))].map(id => `casino_tip_${id}`);
    if (getLock && lockKeys.length > 0) {
      try {
        lock = await getLock.acquire(lockKeys, 5000);
      } catch (e) {
        console.error("Redlock acquisition failed in tip:", e.message);
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
      return h && h.gameStatus === GAME_STATUS.TIP;
    });

    if (allProcessed && existingHistory.length > 0) {
      // ELITE FIX: Fetch fresh balance AFTER lock to ensure we return the state post-original-request
      const freshUser = await mongo.bettingApp.model(mongo.models.users).findOne({
        query: { _id: userInfo._id },
        select: { balance: 1 }
      });
      return res.send({
        status: "0000",
        balance: Number((freshUser?.balance || userInfo.balance || 0).toFixed(4)),
        balanceTs: new Date(),
        desc: "Duplicate Transaction (Idempotent)"
      });
    }

    const adminWL = await mongo.bettingApp.model(mongo.models.admins).findOne({
      query: { _id: { $in: userInfo.whoAdd || [] }, agent_level: USER_LEVEL_NEW.WL },
      select: { casinoWinings: 1 },
    });

    const bulkOpsHistory = [];
    const bulkStatements = [];
    let totalTipAmount = 0;

    for (const transaction of txns) {
      const tipAmount = Number(transaction.tip) || 0;
      if (historyMap.has(transaction.platformTxId)) continue; 

      totalTipAmount += tipAmount;

      // Senior Dev: Map fields explicitly to Match History Schema
      const historyId = new mongo.ObjectId();
      const historyDoc = {
        _id: historyId,
        userObjectId: userInfo._id,
        gameType: transaction.gameType,
        gameCode: transaction.gameCode,
        platform: transaction.platform,
        gameName: transaction.gameName,
        userId: transaction.userId,
        platformTxId: transaction.platformTxId,
        currency: transaction.currency,
        betTime: transaction.txTime,
        betAmount: tipAmount,
        isMatchComplete: true,
        gameStatus: GAME_STATUS.TIP,
        gameInfo: transaction.tipInfo || {}
      };
      
      bulkOpsHistory.push({
        insertOne: { document: historyDoc }
      });

      if (tipAmount > 0) {
        bulkStatements.push({
          userId: userInfo._id,
          credit: 0,
          debit: tipAmount,
          balance: Number((userInfo.balance - totalTipAmount).toFixed(4)),
          Remark: `Tip: ${transaction.platform}/${transaction.gameName || 'Casino'}`,
          type: "casino",
          betType: "casino",
          amountOfBalance: Number(userInfo.balance.toFixed(4)),
          casinoMatchId: historyId,
        });
      }
    }

    if (userInfo.balance < totalTipAmount) {
      return res.send({ status: "1018", balance: Number((userInfo.balance || 0).toFixed(4)), balanceTs: new Date() });
    }

    if (bulkOpsHistory.length > 0) {
      const operations = [
        mongo.bettingApp.model(mongo.models.casinoMatchHistory).bulkWrite({ operations: bulkOpsHistory }),
        mongo.bettingApp.model(mongo.models.users).updateOne({
          query: { _id: userInfo._id },
          update: {
            $inc: {
              balance: -totalTipAmount,
              remaining_balance: -totalTipAmount,
              casinoWinings: -totalTipAmount,
            },
          },
        })
      ];

      if (adminWL?._id) {
        operations.push(
          mongo.bettingApp.model(mongo.models.admins).updateOne({
            query: { _id: adminWL._id },
            update: { $inc: { casinoWinings: -totalTipAmount } }
          })
        );
      }

      if (bulkStatements.length > 0) {
        operations.push(
          mongo.bettingApp.model(mongo.models.statements).insertMany({ documents: bulkStatements })
        );
      }

      await Promise.all(operations);
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
    console.error("Critical Error in tip Bulk Handler:", error);
    if (!res.headersSent) {
      res.status(500).send({ status: "9999", desc: "Internal Server Error" });
    }
  } finally {
    if (lock) {
      try {
        await lock.release();
      } catch (e) {
        console.error("Redlock release failed in tip:", e.message);
      }
    }
  }
}

module.exports = {
  payload,
  handler,
};

