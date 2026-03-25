const joi = require("joi");
const mongo = require("../../config/mongodb");
const { GAME_STATUS, CASINO_NAME, USER_LEVEL_NEW } = require("../../constants");
const CUSTOM_MESSAGE = require("../../utils/message");
const { casinoStateMentTrack } = require("../utils/statementTrack");
const ApiError = require("../../utils/ApiError");
const httpStatus = require("http-status");
const { getTotalExposure } = require("./helpers/getTotalExposure");

const payload = {
  body: joi.object().keys({}),
};

async function handler(req, res) {
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

    // Senior Dev Optimization: Fetch Limits once
    const [marketDetail, adminInfo] = await Promise.all([
      mongo.bettingApp.model(mongo.models.marketLists).findOne({ query: { name: "Casino" } }),
      mongo.bettingApp.model(mongo.models.admins).findOne({
        query: { _id: { $in: userInfo.whoAdd }, agent_level: USER_LEVEL_NEW.WL },
        select: { casinoWinings: 1, casinoUserBalance: 1 },
      })
    ]);

    const totalBatchExposure = await getTotalExposure(adminInfo?._id);
    const platformTxIds = txns.map(t => t.platformTxId);
    
    const existingHistory = await mongo.bettingApp.model(mongo.models.casinoMatchHistory).find({
      query: {
        userId: { $regex: `^${user_name}$`, $options: "i" },
        platformTxId: { $in: platformTxIds },
      }
    });

    const historyMap = new Map();
    existingHistory.forEach(h => historyMap.set(h.platformTxId, h));

    // AWC Compliance: Duplicate Transaction Handling (1016)
    const allProcessed = txns.every(t => {
      const h = historyMap.get(t.platformTxId);
      return h && h.isMatchComplete;
    });

    if (allProcessed && existingHistory.length > 0) {
      return res.send({
        status: "0000",
        balance: Number(userInfo.balance.toFixed(2)),
        balanceTs: new Date(),
        desc: "Duplicate Transaction (Idempotent)"
      });
    }

    const bulkOpsHistory = [];
    const bulkStatements = [];
    let batchWinLossTotal = 0;
    let batchBetTotal = 0;

    for (const transaction of txns) {
      const { betAmount, winAmount, platform, platformTxId, roundId } = transaction;
      const betInfo = historyMap.get(platformTxId);

      const turnover = Math.abs(winAmount - betAmount);
      const winLoss = winAmount - betAmount;
      const status = winLoss > 0 ? GAME_STATUS.WIN : GAME_STATUS.LOSE;

      if (!betInfo || (!betInfo.isMatchComplete && betInfo.gameStatus !== GAME_STATUS.CANCEL)) {
        if (!betInfo) {
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

        batchWinLossTotal += winLoss;
        batchBetTotal += betAmount;

        if (winLoss !== 0) {
          bulkStatements.push({
            userId: userInfo._id,
            credit: winLoss > 0 ? winLoss : 0,
            debit: winLoss < 0 ? -winLoss : 0,
            balance: userInfo.remaining_balance,
            Remark: `${platform}/BetNSettle/${status}`,
            betType: "casino",
            betAmount,
            casinoMatchId: betInfo?._id || "NEW_TX",
            type: "casino",
            amountOfBalance: userInfo.balance,
          });
        }
      }
    }

    // Limit Check
    if (userInfo.balance < batchBetTotal || -adminInfo?.casinoWinings + totalBatchExposure + (batchWinLossTotal < 0 ? -batchWinLossTotal : 0) >= adminInfo?.casinoUserBalance) {
      return res.send({ status: "1018", balance: Number(userInfo.balance.toFixed(2)), balanceTs: new Date() });
    }

    if (bulkOpsHistory.length > 0) {
      await mongo.bettingApp.model(mongo.models.casinoMatchHistory).bulkWrite({ operations: bulkOpsHistory });
      
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
          query: { _id: { $in: userInfo.whoAdd }, agent_level: USER_LEVEL_NEW.WL },
          update: { $inc: { casinoWinings: batchWinLossTotal } }
        }),
        bulkStatements.length > 0 ? mongo.bettingApp.model(mongo.models.statements).insertMany({ documents: bulkStatements }) : Promise.resolve()
      ]);
    }

    const finalUser = await mongo.bettingApp.model(mongo.models.users).findOne({
      query: { _id: userInfo._id },
      select: { balance: 1 }
    });

    res.send({ status: "0000", balance: Number((finalUser?.balance || 0).toFixed(2)), balanceTs: new Date() });

  } catch (error) {
    console.error("Critical Error in betNsettle Bulk Handler:", error);
    if (!res.headersSent) {
      res.status(500).send({ status: "9999", desc: "Internal Server Error" });
    }
  }
}

module.exports = {
  payload,
  handler,
};
