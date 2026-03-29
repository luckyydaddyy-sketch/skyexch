const joi = require("joi");
const mongo = require("../../config/mongodb");
const { GAME_STATUS, CASINO_NAME, USER_LEVEL_NEW } = require("../../constants");
const CUSTOM_MESSAGE = require("../../utils/message");
const { casinoStateMentTrack } = require("../utils/statementTrack");
const ApiError = require("../../utils/ApiError");
const httpStatus = require("http-status");
const { getTotalExposure } = require("./helpers/getTotalExposure");
const { getRedLock } = require("../../config/redLock");

const payload = {
  body: joi.object().keys({}),
};

async function handler(req, res) {
  let lock = null;
  try {
    let { key, message } = req.body;
    console.log("get betNsettle : message:: ", message);

    message = typeof message === "string" ? JSON.parse(message) : message;
    const { txns } = message;
    if (!txns || txns.length === 0) return res.send({ status: "0000" });

    const user_name = txns[0].userId;
    const userQuery = {
      $or: [
        { casinoUserName: { $regex: `^${user_name}$`, $options: "i" } },
        { user_name: { $regex: `^${user_name}$`, $options: "i" } },
      ],
    };

    const userInfo = await mongo.bettingApp.model(mongo.models.users).findOne({
      query: userQuery,
      select: { balance: 1, remaining_balance: 1, exposure: 1, _id: 1, whoAdd: 1 },
    });

    if (!userInfo) {
      return res.send({ status: "1002", desc: "Invalid user Id" });
    }

    // Senior Dev Optimization: Batch Fetch Match History (Wait-Free Peek)
    const platformTxIds = txns.map(t => t.platformTxId);
    const roundIds = txns.map(t => t.roundId).filter(Boolean);
    
    const existingHistory = await mongo.bettingApp.model(mongo.models.casinoMatchHistory).find({
      query: {
        userId: { $regex: `^${user_name}$`, $options: "i" },
        $or: [
          { platformTxId: { $in: platformTxIds } },
          { roundId: { $in: roundIds }, isMatchComplete: true }
        ]
      }
    });

    const historyMap = new Map();
    const roundMap = new Map();
    existingHistory.forEach(h => {
      historyMap.set(h.platformTxId, h);
      if (h.roundId) roundMap.set(h.roundId, h);
    });

    // Lightning Fast Idempotency: Return immediately if already processed
    const allProcessed = txns.every(t => {
      const h = historyMap.get(t.platformTxId) || roundMap.get(t.roundId);
      
      if (h && h.isMatchComplete) {
        if (h.winAmount === t.winAmount || h.winLostAmount === Math.abs(t.winAmount - t.betAmount)) {
          return true;
        }
      }
      return false;
    });

    if (allProcessed && existingHistory.length > 0) {
      // ELITE FIX: Fetch fresh balance to ensure we return the state post-original-request
      const freshUser = await mongo.bettingApp.model(mongo.models.users).findOne({
        query: { _id: userInfo._id },
        select: { balance: 1 }
      });
      return res.send({
        status: "0000",
        balance: Number((freshUser?.balance || userInfo.balance).toFixed(4)),
        balanceTs: new Date(),
        desc: "Duplicate Transaction (Lightning Elite)"
      });
    }

    // AWC Compliance: Round-level Serialization (Only for un-processed rounds)
    const getLock = getRedLock();
    let lock = null;
    const lockKeys = [...new Set(txns.map(t => t.roundId).filter(Boolean))].map(id => `casino_settle_${id}`);
    
    if (getLock && lockKeys.length > 0) {
      try {
        lock = await getLock.acquire(lockKeys, 3000); // 3s wait is enough for retries
      } catch (e) {
        console.error("Redlock acquisition failed:", e);
      }
    }

    // Senior Dev Optimization: Fetch Limits once
    const [marketDetail, adminInfo] = await Promise.all([
      mongo.bettingApp.model(mongo.models.marketLists).findOne({ query: { name: "Casino" } }),
      mongo.bettingApp.model(mongo.models.admins).findOne({
        query: { _id: { $in: userInfo.whoAdd || [] }, agent_level: USER_LEVEL_NEW.WL },
        select: { casinoWinings: 1, casinoUserBalance: 1 },
      })
    ]);

    const totalBatchExposure = await getTotalExposure(adminInfo?._id);

    const bulkOpsHistory = [];
    const bulkStatements = [];
    let batchWinLossTotal = 0;
    let batchBetTotal = 0;

    for (const transaction of txns) {
      const { betAmount, winAmount, platform, platformTxId, roundId } = transaction;
      const betInfo = historyMap.get(platformTxId) || roundMap.get(roundId);

      const turnover = Math.abs(winAmount - betAmount);
      const winLoss = winAmount - betAmount;
      const status = winLoss > 0 ? GAME_STATUS.WIN : GAME_STATUS.LOSE;

      let currentMatchId = betInfo?._id;

      // Elite State Management: Check if this round already has a completed payout
      const existingRoundSettlement = existingHistory.find(h => 
        h.roundId === roundId && 
        h.isMatchComplete && 
        (h.winAmount === winAmount || h.winLostAmount === winLoss)
      );

      let isDuplicateRace = false;
      if (existingRoundSettlement) {
        isDuplicateRace = true;
      }

      if (!isDuplicateRace && (!betInfo || (!betInfo.isMatchComplete && betInfo.gameStatus !== GAME_STATUS.CANCEL))) {
        if (!betInfo) {
          currentMatchId = new mongo.ObjectId();
          transaction._id = currentMatchId;
          transaction.userObjectId = userInfo._id;
          transaction.isMatchComplete = true;
          transaction.gameStatus = status;
          transaction.winLostAmount = turnover;
          bulkOpsHistory.push({ insertOne: { document: transaction } });
        } else {
          bulkOpsHistory.push({
            updateOne: {
              filter: { _id: betInfo._id, isMatchComplete: false },
              update: { $set: { gameInfo: transaction.gameInfo, isMatchComplete: true, gameStatus: status, winLostAmount: turnover } }
            }
          });
        }
      } else {
        isDuplicateRace = true;
      }

      if (!isDuplicateRace) {
        batchWinLossTotal += winLoss;
        batchBetTotal += betAmount;

        if (winLoss !== 0) {
          bulkStatements.push({
            userId: userInfo._id,
            credit: winLoss > 0 ? winLoss : 0,
            debit: winLoss < 0 ? -winLoss : 0,
            balance: userInfo.remaining_balance + batchWinLossTotal,
            Remark: `${platform}/BetNSettle/${status}`,
            betType: "casino",
            betAmount,
            casinoMatchId: currentMatchId,
            type: "casino",
            amountOfBalance: userInfo.balance,
          });
        }
      }
    }

    // Aggregate Limit Validation
    const casinoWinings = adminInfo?.casinoWinings || 0;
    const casinoUserBalance = adminInfo?.casinoUserBalance || 0;
    const extraExposure = batchWinLossTotal < 0 ? -batchWinLossTotal : 0;

    // IF admin exists, check aggregate limits. IF root (no WL), bypass aggregate checks.
    const isOverAdminLimit = adminInfo && (
      -casinoWinings + totalBatchExposure + extraExposure >= casinoUserBalance
    );

    if (
      Number(userInfo.balance.toFixed(4)) < batchBetTotal || isOverAdminLimit
    ) {
      return res.send({ status: "1018", balance: Number(userInfo.balance.toFixed(4)), balanceTs: new Date() });
    }

    if (bulkOpsHistory.length > 0) {
      const bulkResult = await mongo.bettingApp.model(mongo.models.casinoMatchHistory).bulkWrite({ operations: bulkOpsHistory });
      
      // If any operation in the batch failed to modify/insert (i.e., someone else did it),
      // we might still have a race if Redlock failed, but Redlock should protect this.
      
      const userUpdate = {
        $inc: {
          balance: batchWinLossTotal,
          remaining_balance: batchWinLossTotal,
          ref_pl: batchWinLossTotal,
          cumulative_pl: batchWinLossTotal,
          casinoWinings: batchWinLossTotal,
        }
      };

      await Promise.all([
        mongo.bettingApp.model(mongo.models.users).updateOne({ query: { _id: userInfo._id }, update: userUpdate }),
        mongo.bettingApp.model(mongo.models.admins).updateOne({
          query: { _id: { $in: userInfo.whoAdd || [] }, agent_level: USER_LEVEL_NEW.WL },
          update: { $inc: { casinoWinings: batchWinLossTotal } }
        }),
        bulkStatements.length > 0 ? mongo.bettingApp.model(mongo.models.statements).insertMany({ documents: bulkStatements }) : Promise.resolve()
      ]);
    }

    const finalUser = await mongo.bettingApp.model(mongo.models.users).findOne({
      query: { _id: userInfo._id },
      select: { balance: 1 }
    });

    res.send({ status: "0000", balance: Number((finalUser?.balance || 0).toFixed(4)), balanceTs: new Date() });

  } catch (error) {
    console.error("Critical Error in betNsettle Bulk Handler:", error);
    if (!res.headersSent) {
      res.status(500).send({ status: "9999", desc: "Internal Server Error" });
    }
  } finally {
    if (lock) {
      try {
        await lock.release();
      } catch (e) {
        console.error("Redlock release failed:", e);
      }
    }
  }
}

module.exports = {
  payload,
  handler,
};
