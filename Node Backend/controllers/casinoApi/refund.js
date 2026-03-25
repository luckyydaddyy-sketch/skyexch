const joi = require("joi");
const httpStatus = require("http-status");
const mongo = require("../../config/mongodb");
const { CASINO_NAME, GAME_STATUS, USER_LEVEL_NEW } = require("../../constants");
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
  try {
    let { key, message } = req.body;
    console.log("get re refund : message:: ", message);
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

    const platformTxIds = txns.map(t => t.refundPlatformTxId);
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
      const h = historyMap.get(t.refundPlatformTxId);
      return h && h.isRefundComplete;
    });

    if (allProcessed && existingHistory.length > 0) {
      return res.send({
        status: "1016",
        balance: Number(userInfo.balance.toFixed(2)),
        balanceTs: new Date(),
        desc: "Duplicate Transaction"
      });
    }

    const bulkOpsHistory = [];
    const matchesToUpdate = [];

    let totalUserBalanceInc = 0;
    let totalUserRemainingBalanceInc = 0;
    let totalUserExposureInc = 0;
    let totalAdminWiningsInc = 0;

    const txnsProcessed = new Set();

    for (const transaction of txns) {
      const { refundPlatformTxId, winAmount, betAmount, platform } = transaction;
      if (txnsProcessed.has(refundPlatformTxId)) continue;
      txnsProcessed.add(refundPlatformTxId);

      const betInfo = historyMap.get(refundPlatformTxId);
      if (betInfo && betInfo.isMatchComplete && !betInfo.isRefundComplete) {
        // 1. Reverse original settlement
        let originalWinLoss = 0;
        if (betInfo.gameStatus === GAME_STATUS.WIN) {
          totalUserBalanceInc -= (betInfo.winLostAmount + betInfo.betAmount);
          totalUserRemainingBalanceInc -= betInfo.winLostAmount;
          totalAdminWiningsInc -= betInfo.winLostAmount;
          originalWinLoss = betInfo.winLostAmount;
        } else if (betInfo.gameStatus === GAME_STATUS.LOSE) {
          totalUserRemainingBalanceInc += betInfo.winLostAmount;
          totalAdminWiningsInc += betInfo.winLostAmount;
          originalWinLoss = -betInfo.winLostAmount;
        } else if (betInfo.gameStatus === GAME_STATUS.TIE) {
          totalUserBalanceInc -= betInfo.betAmount;
        }
        totalUserExposureInc += betInfo.betAmount;

        // 2. Prepare for new settlement
        let newStatus = (winAmount - betAmount > 0) ? GAME_STATUS.WIN : GAME_STATUS.LOSE;
        if (platform === CASINO_NAME.ESPORTS && transaction.gameInfo?.txnResult === "DRAW") newStatus = GAME_STATUS.TIE;
        
        const newWinLoss = winAmount - betAmount;
        const extraExposureReturn = betAmount - newWinLoss;

        totalUserExposureInc += extraExposureReturn;
        totalUserRemainingBalanceInc += extraExposureReturn;

        bulkOpsHistory.push({
          updateOne: {
            filter: { _id: betInfo._id },
            update: {
              $set: {
                isMatchComplete: true,
                gameStatus: newStatus,
                winLostAmount: Math.abs(newWinLoss),
                isRefundComplete: true,
                gameInfo: transaction.gameInfo,
              },
            },
          },
        });

        // 3. Statement aggregation (requires match ID)
        matchesToUpdate.push({
          matchId: betInfo._id,
          originalWinLoss,
          newWinLoss,
          betAmount
        });
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
          query: { _id: { $in: userInfo.whoAdd }, agent_level: USER_LEVEL_NEW.WL },
          update: { $inc: { casinoWinings: totalAdminWiningsInc } }
        })
      ]);

      // Statement Management (Batch)
      const { removeStatementTrack, casinoStateMentTrack } = require("../utils/statementTrack");
      for (const item of matchesToUpdate) {
        await removeStatementTrack({
          userId: userInfo._id,
          casinoMatchId: item.matchId,
          betAmount: item.betAmount,
          betType: "casino",
        });
        await casinoStateMentTrack({
          userId: userInfo._id,
          win: item.newWinLoss,
          casinoMatchId: item.matchId,
          betAmount: item.betAmount,
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
    console.error("Critical Error in refund Bulk Handler:", error);
    if (!res.headersSent) {
      res.status(500).send({ status: "9999", desc: "Internal Server Error" });
    }
  }
}

module.exports = {
  payload,
  handler,
};
