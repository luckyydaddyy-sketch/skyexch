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
    console.log("get re resettle : message:: ", message);
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

    const platformTxIds = txns.map(t => t.settleType === "refPlatformTxId" ? t.refPlatformTxId : t.platformTxId);
    const existingHistory = await mongo.bettingApp.model(mongo.models.casinoMatchHistory).find({
      query: {
        userId: { $regex: `^${userId}$`, $options: "i" },
        platformTxId: { $in: platformTxIds },
      }
    });

    const historyMap = new Map();
    existingHistory.forEach(h => historyMap.set(h.platformTxId, h));

    // AWC Compliance: Duplicate Transaction Handling (1016)
    // Note: Resettle is tricky as it's an update. We return 1016 only if the hash/version matches.
    // However, AWC usually sends Resettle to OVERWRITE. If we already have the EXACT winAmount, it's 1016.
    const allProcessed = txns.every(t => {
      const lookupId = t.settleType === "refPlatformTxId" ? t.refPlatformTxId : t.platformTxId;
      const h = historyMap.get(lookupId);
      return h && h.isMatchComplete && h.winLostAmount === Math.abs(t.winAmount - t.betAmount);
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
    const matchesToUpdate = [];

    let totalUserBalanceInc = 0;
    let totalUserRemainingBalanceInc = 0;
    let totalUserExposureInc = 0;
    let totalAdminWiningsInc = 0;

    for (const transaction of txns) {
      let { platform, turnover, betAmount, winAmount, settleType, platformTxId, refPlatformTxId } = transaction;
      const targetTxId = (settleType === "refPlatformTxId") ? refPlatformTxId : platformTxId;
      const betInfo = historyMap.get(targetTxId);

      if (betInfo && betInfo.isMatchComplete) {
        // Idempotency check for individual transaction: skip update if amount hasn't changed
        const newWinLossAdjusted = winAmount - betAmount;
        if (betInfo.winLostAmount === Math.abs(newWinLossAdjusted) && betInfo.gameStatus === (newWinLossAdjusted > 0 ? GAME_STATUS.WIN : GAME_STATUS.LOSE)) {
           continue; 
        }

        // 1. Reverse original settlement
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

        // 2. Prepare for new settlement
        let status = transaction.gameInfo?.status || (winAmount - betAmount > 0 ? GAME_STATUS.WIN : GAME_STATUS.LOSE);
        let winLoss = transaction.gameInfo?.winLoss || (winAmount - betAmount);

        if ([CASINO_NAME.ESPORTS, CASINO_NAME.BG, CASINO_NAME.SABA, CASINO_NAME.PP, CASINO_NAME.VIACASINO].includes(platform)) {
          turnover = Math.abs(winAmount - betAmount);
          winLoss = winAmount - betAmount;
          status = winLoss > 0 ? GAME_STATUS.WIN : (winLoss < 0 ? GAME_STATUS.LOSE : GAME_STATUS.TIE);
        }

        bulkOpsHistory.push({
          updateOne: {
            filter: { _id: betInfo._id },
            update: {
              $set: {
                isMatchComplete: true,
                gameStatus: status,
                winLostAmount: turnover || Math.abs(winLoss),
                gameInfo: transaction.gameInfo,
              },
            },
          },
        });

        // 3. Aggregate User impact for new settlement
        totalUserBalanceInc += (betAmount + winLoss);
        totalUserRemainingBalanceInc += winLoss;
        totalUserExposureInc -= betAmount;
        totalAdminWiningsInc += winLoss;

        matchesToUpdate.push({
          matchId: betInfo._id,
          newWinLoss: winLoss,
          betAmount,
          status
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
          query: { _id: { $in: userInfo.whoAdd || [] }, agent_level: USER_LEVEL_NEW.WL },
          update: { $inc: { casinoWinings: totalAdminWiningsInc } }
        })
      ]);

      const { removeStatementTrack, casinoStateMentTrack } = require("../utils/statementTrack");
      for (const item of matchesToUpdate) {
        await removeStatementTrack({
          userId: userInfo._id,
          casinoMatchId: item.matchId,
          betAmount: item.betAmount,
          betType: "casino",
        });
        if (item.status !== GAME_STATUS.TIE) {
          await casinoStateMentTrack({
            userId: userInfo._id,
            win: item.newWinLoss,
            casinoMatchId: item.matchId,
            betAmount: item.betAmount,
          });
        }
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
    console.error("Critical Error in resettle Bulk Handler:", error);
    if (!res.headersSent) {
      res.status(500).send({ status: "9999", desc: "Internal Server Error" });
    }
  }
}

module.exports = {
  payload,
  handler,
};
