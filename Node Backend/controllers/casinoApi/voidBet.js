const joi = require("joi");
const httpStatus = require("http-status");
const mongo = require("../../config/mongodb");
const { GAME_STATUS } = require("../../constants");
const ApiError = require("../../utils/ApiError");
const CUSTOM_MESSAGE = require("../../utils/message");

const payload = {
  body: joi.object().keys({}),
};

// hold bet for some time
async function handler(req, res) {
  try {
    let { key, message } = req.body;
    console.log("get void_bet : message:: ", message);
    message = typeof message === "string" ? JSON.parse(message) : message;
    const { txns } = message;
    if (!txns || txns.length === 0) return res.send({ status: "0000" });

    // Senior Dev Optimization: Multi-User Batching
    const userIds = [...new Set(txns.map(t => t.userId))];
    const userQuery = {
      $or: [
        { casinoUserName: { $in: userIds.map(id => new RegExp(`^${id}$`, "i")) } },
        { user_name: { $in: userIds.map(id => new RegExp(`^${id}$`, "i")) } },
      ],
    };

    const usersInfo = await mongo.bettingApp.model(mongo.models.users).find({
      query: userQuery,
      select: { balance: 1, exposure: 1, _id: 1, user_name: 1, casinoUserName: 1 },
    });

    if (!usersInfo || usersInfo.length === 0) {
      return res.send({ status: "1002", desc: "Invalid user Id" });
    }

    const userMap = new Map();
    usersInfo.forEach(u => {
      userMap.set(u.user_name.toLowerCase(), u);
      if (u.casinoUserName) userMap.set(u.casinoUserName.toLowerCase(), u);
    });

    const platformTxIds = txns.map(t => t.platformTxId);
    const existingHistory = await mongo.bettingApp.model(mongo.models.casinoMatchHistory).find({
      query: {
        platformTxId: { $in: platformTxIds },
      }
    });

    const historyMap = new Map();
    existingHistory.forEach(h => historyMap.set(h.platformTxId, h));

    // AWC Compliance: Duplicate Transaction Handling (1016)
    const allProcessed = txns.every(t => {
      const h = historyMap.get(t.platformTxId);
      return h && h.gameStatus === GAME_STATUS.VOID;
    });

    const firstUser = userMap.get(txns[0].userId.toLowerCase());

    if (allProcessed && existingHistory.length > 0) {
      return res.send({
        status: "0000",
        balance: Number((firstUser?.balance || 0).toFixed(2)),
        balanceTs: new Date(),
        desc: "Duplicate Transaction (Idempotent)"
      });
    }

    const bulkOpsHistory = [];
    const userAccumulators = {};

    for (const transaction of txns) {
      const lookupUserId = transaction.userId.toLowerCase();
      const userInfo = userMap.get(lookupUserId);
      if (!userInfo) continue;

      if (!userAccumulators[lookupUserId]) {
        userAccumulators[lookupUserId] = {
          totalBalanceInc: 0,
          totalExposureDec: 0,
          userInfo: userInfo
        };
      }
      const acc = userAccumulators[lookupUserId];

      const betInfo = historyMap.get(transaction.platformTxId);
      if (betInfo && betInfo.gameStatus !== GAME_STATUS.VOID && !betInfo.isMatchComplete) {
        bulkOpsHistory.push({
          updateOne: {
            filter: { _id: betInfo._id },
            update: {
              $set: {
                gameStatus: GAME_STATUS.VOID,
                gameInfo: transaction.gameInfo,
              },
            },
          },
        });
        const amount = transaction.betAmount || betInfo.betAmount;
        acc.totalBalanceInc += amount;
        acc.totalExposureDec += amount;
      }
    }

    if (bulkOpsHistory.length > 0) {
      const promises = [
        mongo.bettingApp.model(mongo.models.casinoMatchHistory).bulkWrite({ operations: bulkOpsHistory })
      ];

      Object.values(userAccumulators).forEach(acc => {
        if (acc.totalBalanceInc === 0 && acc.totalExposureDec === 0) return;
        
        promises.push(mongo.bettingApp.model(mongo.models.users).updateOne({
          query: { _id: acc.userInfo._id },
          update: {
            $inc: {
              balance: acc.totalBalanceInc,
              exposure: -acc.totalExposureDec,
            },
          }
        }));
      });

      await Promise.all(promises);
    }

    const finalUser = await mongo.bettingApp.model(mongo.models.users).findOne({
      query: { _id: firstUser._id },
      select: { balance: 1 }
    });

    res.send({
      status: "0000",
      balance: Number((finalUser?.balance || 0).toFixed(2)),
      balanceTs: new Date(),
    });

  } catch (error) {
    console.error("Critical Error in voidBet Bulk Handler:", error);
    if (!res.headersSent) {
      res.status(500).send({ status: "9999", desc: "Internal Server Error" });
    }
  }
}

module.exports = {
  payload,
  handler,
};
