const joi = require("joi");
const httpStatus = require("http-status");
const mongo = require("../../config/mongodb");
const {
  CASINO_NAME,
  GAME_STATUS,
  SUB_CASINO_NAME,
} = require("../../constants");
const { settleWinHelper } = require("./helpers/settleWinHelper");
const { casinoStateMentTrack } = require("../utils/statementTrack");
const ApiError = require("../../utils/ApiError");
const CUSTOM_MESSAGE = require("../../utils/message");

const payload = {
  body: joi.object().keys({}),
};

async function handler(req, res) {
  try {
    let { key, message } = req.body;
    console.log(new Date(), " get settle_win : message:: ", message);

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
      select: { balance: 1, remaining_balance: 1, exposure: 1, whoAdd: 1, _id: 1, user_name: 1 },
    });

    if (!userInfo) {
      return res.send({ status: "1002", desc: "Invalid user Id" });
    }

    // Senior Dev Optimization: Batch Fetch Match History
    const platformTxIds = txns.map(t => t.settleType === "refPlatformTxId" ? t.refPlatformTxId : t.platformTxId);
    
    const betHistory = await mongo.bettingApp.model(mongo.models.casinoMatchHistory).find({
      query: {
        userId: { $regex: `^${userId}$`, $options: "i" },
        platformTxId: { $in: platformTxIds },
      }
    });

    const historyMap = new Map();
    betHistory.forEach(h => historyMap.set(h.platformTxId, h));

    // AWC Compliance: Duplicate Transaction Handling (1016)
    // If all platformTxIds match precisely what we already have (isMatchComplete is true), return 1016.
    const allProcessed = txns.every(t => {
      const lookupId = t.settleType === "refPlatformTxId" ? t.refPlatformTxId : t.platformTxId;
      const h = historyMap.get(lookupId);
      return h && h.isMatchComplete;
    });

    if (allProcessed && betHistory.length > 0) {
      return res.send({
        status: "1016",
        balance: Number(userInfo.balance.toFixed(2)),
        balanceTs: new Date(),
        desc: "Duplicate Transaction"
      });
    }

    const bulkOpsHistory = [];
    const bulkStatements = [];
    let totalWinLossAccumulated = 0;
    let totalBetAmountReturnAccumulated = 0;
    let totalExposureDecAccumulated = 0;

    for (const transaction of txns) {
      const { platform, gameType, winAmount, betAmount, settleType, platformTxId, refPlatformTxId } = transaction;
      const lookupId = settleType === "refPlatformTxId" ? refPlatformTxId : platformTxId;
      const betInfo = historyMap.get(lookupId);

      let turnover = 0;
      let status = "";
      let winLoss = 0;

      // Platform Logic
      if (Object.values(CASINO_NAME).includes(platform)) {
        turnover = Math.abs(winAmount - betAmount);
        winLoss = winAmount - betAmount;
        if (winLoss > 0) status = GAME_STATUS.WIN;
        else if (winLoss === 0) status = [CASINO_NAME.BG, CASINO_NAME.SABA].includes(platform) ? GAME_STATUS.TIE : GAME_STATUS.LOSE;
        else status = GAME_STATUS.LOSE;

        if (CASINO_NAME.ESPORTS === platform && transaction.gameInfo?.txnResult === "DRAW") status = GAME_STATUS.TIE;
      } else {
        turnover = transaction.turnover;
        status = transaction.gameInfo?.status;
        winLoss = transaction.gameInfo?.winLoss;
      }

      if (betInfo && (!betInfo.isMatchComplete || betAmount === 0)) {
        bulkOpsHistory.push({
          updateOne: {
            filter: { _id: betInfo._id },
            update: {
              $set: {
                isMatchComplete: true,
                gameStatus: status,
                winLostAmount: turnover,
                gameInfo: transaction.gameInfo,
              },
            },
          },
        });

        totalWinLossAccumulated += winLoss;
        totalBetAmountReturnAccumulated += betAmount;
        totalExposureDecAccumulated += betAmount;

        // Statement Preparation
        if (winLoss !== 0) {
          const remark = `${platform}/${transaction.gameName || 'Casino'}/${status}/${gameType}`;
          bulkStatements.push({
            document: {
              userId: userInfo._id,
              credit: winLoss > 0 ? winLoss : 0,
              debit: winLoss < 0 ? -winLoss : 0,
              balance: userInfo.remaining_balance, // Approx
              Remark: remark,
              betType: "casino",
              betAmount,
              casinoMatchId: betInfo._id,
              type: "casino",
              amountOfBalance: userInfo.balance,
            }
          });
        }
      }
    }

    // Atomic Execution
    if (bulkOpsHistory.length > 0) {
      await mongo.bettingApp.model(mongo.models.casinoMatchHistory).bulkWrite({ operations: bulkOpsHistory });
      
      const userUpdate = {
        $inc: {
          balance: totalWinLossAccumulated + totalBetAmountReturnAccumulated,
          remaining_balance: totalWinLossAccumulated,
          cumulative_pl: totalWinLossAccumulated,
          ref_pl: totalWinLossAccumulated,
          casinoWinings: totalWinLossAccumulated,
          exposure: -totalExposureDecAccumulated,
        }
      };

      await Promise.all([
        mongo.bettingApp.model(mongo.models.users).updateOne({ query: { _id: userInfo._id }, update: userUpdate }),
        mongo.bettingApp.model(mongo.models.admins).updateOne({
          query: { _id: { $in: userInfo.whoAdd }, agent_level: USER_LEVEL_NEW.WL },
          update: { $inc: { casinoWinings: totalWinLossAccumulated } }
        })
      ]);

      if (bulkStatements.length > 0) {
        await mongo.bettingApp.model(mongo.models.statements).insertMany(bulkStatements);
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
    console.error("Critical Error in settleWin Bulk Handler:", error);
    if (!res.headersSent) {
      res.status(500).send({ status: "9999", desc: "Internal Server Error" });
    }
  }
}

module.exports = {
  payload,
  handler,
};
