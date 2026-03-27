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
      select: { balance: 1, remaining_balance: 1, exposure: 1, whoAdd: 1, _id: 1, user_name: 1, casinoUserName: 1 },
    });

    if (!usersInfo || usersInfo.length === 0) {
      return res.send({ status: "1002", desc: "Invalid user Id" });
    }

    const userMap = new Map();
    usersInfo.forEach(u => {
      userMap.set(u.user_name.toLowerCase(), u);
      if (u.casinoUserName) userMap.set(u.casinoUserName.toLowerCase(), u);
    });

    const platformTxIds = txns.map(t => t.settleType === "refPlatformTxId" ? t.refPlatformTxId : t.platformTxId);
    const existingHistory = await mongo.bettingApp.model(mongo.models.casinoMatchHistory).find({
      query: {
        platformTxId: { $in: platformTxIds },
      }
    });

    const historyMap = new Map();
    existingHistory.forEach(h => historyMap.set(h.platformTxId, h));

    // AWC Compliance: Duplicate Transaction Handling (1016)
    const allProcessed = txns.every(t => {
      const lookupId = t.settleType === "refPlatformTxId" ? t.refPlatformTxId : t.platformTxId;
      const h = historyMap.get(lookupId);
      return h && h.isMatchComplete && h.winLostAmount === Math.abs(t.winAmount - t.betAmount);
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
          totalUserBalanceInc: 0,
          totalUserRemainingBalanceInc: 0,
          totalUserExposureInc: 0,
          totalAdminWiningsInc: 0,
          matchesToUpdate: [],
          userInfo: userInfo
        };
      }
      const acc = userAccumulators[lookupUserId];

      let { platform, turnover, betAmount, winAmount, settleType, platformTxId, refPlatformTxId } = transaction;
      const targetTxId = (settleType === "refPlatformTxId") ? refPlatformTxId : platformTxId;
      const betInfo = historyMap.get(targetTxId);

      if (betInfo && betInfo.isMatchComplete) {
        const newWinLossAdjusted = winAmount - betAmount;
        if (betInfo.winLostAmount === Math.abs(newWinLossAdjusted) && betInfo.gameStatus === (newWinLossAdjusted > 0 ? GAME_STATUS.WIN : GAME_STATUS.LOSE)) {
           continue; 
        }

        // 1. Reverse original settlement
        if (betInfo.gameStatus === GAME_STATUS.LOSE) {
          acc.totalUserRemainingBalanceInc += betInfo.winLostAmount;
          acc.totalAdminWiningsInc += betInfo.winLostAmount;
        } else if (betInfo.gameStatus === GAME_STATUS.WIN) {
          acc.totalUserBalanceInc -= (betInfo.winLostAmount + betInfo.betAmount);
          acc.totalUserRemainingBalanceInc -= betInfo.winLostAmount;
          acc.totalAdminWiningsInc -= betInfo.winLostAmount;
        } else if (betInfo.gameStatus === GAME_STATUS.TIE) {
          acc.totalUserBalanceInc -= betInfo.betAmount;
        }
        acc.totalUserExposureInc += betInfo.betAmount;

        // 2. Prepare for new settlement
        let rawStatus = transaction.gameInfo?.status;
        let winLoss = transaction.gameInfo?.winLoss !== undefined ? transaction.gameInfo.winLoss : (winAmount - betAmount);
        let status = rawStatus;

        if (!rawStatus || !Object.values(GAME_STATUS).includes(rawStatus)) {
           status = winLoss > 0 ? GAME_STATUS.WIN : (winLoss < 0 ? GAME_STATUS.LOSE : GAME_STATUS.TIE);
        }

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
        acc.totalUserBalanceInc += (betAmount + winLoss);
        acc.totalUserRemainingBalanceInc += winLoss;
        acc.totalUserExposureInc -= betAmount;
        acc.totalAdminWiningsInc += winLoss;

        acc.matchesToUpdate.push({
          matchId: betInfo._id,
          newWinLoss: winLoss,
          betAmount,
          status
        });
      }
    }

    if (bulkOpsHistory.length > 0) {
      const promises = [
        mongo.bettingApp.model(mongo.models.casinoMatchHistory).bulkWrite({ operations: bulkOpsHistory })
      ];

      Object.values(userAccumulators).forEach(acc => {
        promises.push(mongo.bettingApp.model(mongo.models.users).updateOne({
          query: { _id: acc.userInfo._id },
          update: {
            $inc: {
              balance: acc.totalUserBalanceInc,
              remaining_balance: acc.totalUserRemainingBalanceInc,
              exposure: acc.totalUserExposureInc,
              casinoWinings: acc.totalAdminWiningsInc,
            },
          },
        }));

        if (acc.userInfo.whoAdd && acc.userInfo.whoAdd.length > 0) {
          promises.push(mongo.bettingApp.model(mongo.models.admins).updateOne({
            query: { _id: { $in: acc.userInfo.whoAdd }, agent_level: USER_LEVEL_NEW.WL },
            update: { $inc: { casinoWinings: acc.totalAdminWiningsInc } }
          }));
        }
      });

      await Promise.all(promises);

      const { removeStatementTrack, casinoStateMentTrack } = require("../utils/statementTrack");
      for (const acc of Object.values(userAccumulators)) {
        for (const item of acc.matchesToUpdate) {
            await removeStatementTrack({
              userId: acc.userInfo._id,
              casinoMatchId: item.matchId,
              betAmount: item.betAmount,
              betType: "casino",
            });
            if (item.status !== GAME_STATUS.TIE) {
              await casinoStateMentTrack({
                userId: acc.userInfo._id,
                win: item.newWinLoss,
                casinoMatchId: item.matchId,
                betAmount: item.betAmount,
              });
            }
          }
      }
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
