const joi = require("joi");
const httpStatus = require("http-status");
const mongo = require("../../config/mongodb");
const { CASINO_NAME, GAME_STATUS, USER_LEVEL_NEW } = require("../../constants");
const { getRedLock } = require("../../config/redLock");
const { settleWinHelper } = require("./helpers/settleWinHelper");
const {
  casinoStateMentTrack,
  removeStatementTrack,
} = require("../utils/statementTrack");
const ApiError = require("../../utils/ApiError");
const CUSTOM_MESSAGE = require("../../utils/message");

const payload = {
  body: joi.object().keys({}),
};

async function handler(req, res) {
  let lock = null;
  try {
    let { key, message } = req.body;
    console.log("get re unsettle : message:: ", message);
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
      select: { balance: 1, remaining_balance: 1, exposure: 1, _id: 1, whoAdd: 1 },
    });

    if (!userInfo) {
      return res.send({ status: "1002", desc: "Invalid user Id" });
    }

    // AWC Compliance: Transaction Serialization (Distributed Lock)
    const getLock = getRedLock();
    const lockKeys = [...new Set(txns.map(t => (t.platform === CASINO_NAME.KINGMAKER ? t.refPlatformTxId : t.platformTxId)).filter(Boolean))].map(id => `casino_unsettle_${id}`);
    if (getLock && lockKeys.length > 0) {
      try {
        lock = await getLock.acquire(lockKeys, 5000);
      } catch (e) {
        console.error("Redlock acquisition failed in unSettleBet:", e.message);
      }
    }

    const platformTxIds = txns.map(t => t.platform === CASINO_NAME.KINGMAKER ? t.refPlatformTxId : t.platformTxId);
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
      const targetTxId = (t.platform === CASINO_NAME.KINGMAKER) ? t.refPlatformTxId : t.platformTxId;
      const h = historyMap.get(targetTxId);
      return h && !h.isMatchComplete;
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
    const matchIdsToUnsettle = [];
    let totalUserBalanceInc = 0;
    let totalUserRemainingBalanceInc = 0;
    let totalUserExposureInc = 0;
    let totalAdminWiningsInc = 0;

    for (const transaction of txns) {
      const targetTxId = (transaction.platform === CASINO_NAME.KINGMAKER) ? transaction.refPlatformTxId : transaction.platformTxId;
      const betInfo = historyMap.get(targetTxId);

      if (betInfo && betInfo.isMatchComplete) {
        // 1. Reverse settlement
        if (betInfo.gameStatus === GAME_STATUS.LOSE) {
          totalUserRemainingBalanceInc += betInfo.winLostAmount;
          totalAdminWiningsInc += betInfo.winLostAmount;
        } else if (betInfo.gameStatus === GAME_STATUS.WIN) {
          totalUserBalanceInc -= (betInfo.winLostAmount + betInfo.betAmount);
          totalUserRemainingBalanceInc -= betInfo.winLostAmount;
          totalAdminWiningsInc -= betInfo.winLostAmount;
        } else if (betInfo.gameStatus === GAME_STATUS.TIE) {
          totalUserBalanceInc -= betInfo.betAmount;
        }
        totalUserExposureInc += betInfo.betAmount;

        bulkOpsHistory.push({
          updateOne: {
            filter: { _id: betInfo._id, isMatchComplete: true },
            update: {
              $set: {
                isMatchComplete: false,
                gameInfo: transaction.gameInfo,
              },
            },
          },
        });
        matchIdsToUnsettle.push(betInfo._id);
      }
    }

    if (bulkOpsHistory.length > 0) {
      await Promise.all([
        mongo.bettingApp.model(mongo.models.casinoMatchHistory).bulkWrite({ operations: bulkOpsHistory }),
        mongo.bettingApp.model(mongo.models.users).updateOne({
          query: { _id: userInfo._id },
          update: {
            $inc: {
              balance: totalUserBalanceInc,
              remaining_balance: totalUserRemainingBalanceInc,
              exposure: totalUserExposureInc,
              casinoWinings: totalAdminWiningsInc,
            },
          },
        }),
        mongo.bettingApp.model(mongo.models.admins).updateOne({
          query: { _id: { $in: userInfo.whoAdd || [] }, agent_level: USER_LEVEL_NEW.WL },
          update: { $inc: { casinoWinings: totalAdminWiningsInc } }
        })
      ]);

      const { removeStatementTrack } = require("../utils/statementTrack");
      for (const matchId of matchIdsToUnsettle) {
        const betInfo = existingHistory.find(h => h._id.toString() === matchId.toString());
        await removeStatementTrack({
          userId: userInfo._id,
          casinoMatchId: matchId,
          betAmount: betInfo?.betAmount || 0,
          betType: "casino",
        });
      }
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
    console.error("Critical Error in unSettleBet Bulk Handler:", error);
    if (!res.headersSent) {
      res.status(500).send({ status: "9999", desc: "Internal Server Error" });
    }
  } finally {
    if (lock) {
      try {
        await lock.release();
      } catch (e) {
        console.error("Redlock release failed in unSettleBet:", e.message);
      }
    }
  }
}

module.exports = {
  payload,
  handler,
};

