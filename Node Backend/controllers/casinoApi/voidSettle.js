const joi = require("joi");
const httpStatus = require("http-status");
const mongo = require("../../config/mongodb");
const { GAME_STATUS, USER_LEVEL_NEW } = require("../../constants");
const {
  removeStatementTrack,
  casinoStateMentTrack,
} = require("../utils/statementTrack");
const ApiError = require("../../utils/ApiError");
const CUSTOM_MESSAGE = require("../../utils/message");

const payload = {
  body: joi.object().keys({}),
};

// return winnerAmount and lostAmount ( it call match is cancel )
async function handler(req, res) {
  try {
    let { key, message } = req.body;
    console.log("get void_settle : message:: ", message);
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
      select: { balance: 1, remaining_balance: 1, cumulative_pl: 1, ref_pl: 1, exposure: 1, _id: 1, whoAdd: 1 },
    });

    if (!userInfo) {
      return res.send({ status: "1002", desc: "Invalid user Id" });
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
      return h && h.gameStatus === GAME_STATUS.VOID && !h.isMatchComplete;
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
    let batchWinLostAccumulated = 0;
    const matchIdsToVoid = [];

    for (const transaction of txns) {
      const betInfo = historyMap.get(transaction.platformTxId);
      if (betInfo && betInfo.isMatchComplete) {
        let winLostChange = 0;
        if (betInfo.gameStatus === GAME_STATUS.WIN) {
          winLostChange -= betInfo.winLostAmount;
        } else if (betInfo.gameStatus === GAME_STATUS.LOSE) {
          winLostChange += betInfo.winLostAmount;
        }

        bulkOpsHistory.push({
          updateOne: {
            filter: { _id: betInfo._id },
            update: {
              $set: {
                gameInfo: transaction.gameInfo,
                isMatchComplete: false,
                gameStatus: GAME_STATUS.VOID,
                winLostAmount: 0,
                winLostAmountForVoidSettel: -winLostChange,
              },
            },
          },
        });

        batchWinLostAccumulated += winLostChange;
        matchIdsToVoid.push(betInfo._id);
      }
    }

    if (bulkOpsHistory.length > 0) {
      await Promise.all([
        mongo.bettingApp.model(mongo.models.casinoMatchHistory).bulkWrite({ operations: bulkOpsHistory }),
        mongo.bettingApp.model(mongo.models.users).updateOne({
          query: { _id: userInfo._id },
          update: {
            $inc: {
              remaining_balance: batchWinLostAccumulated,
              balance: batchWinLostAccumulated,
              ref_pl: batchWinLostAccumulated,
              cumulative_pl: batchWinLostAccumulated,
              casinoWinings: batchWinLostAccumulated,
            },
          },
        }),
        mongo.bettingApp.model(mongo.models.admins).updateOne({
          query: { _id: { $in: userInfo.whoAdd }, agent_level: USER_LEVEL_NEW.WL },
          update: { $inc: { casinoWinings: batchWinLostAccumulated } }
        })
      ]);

      // Batch Statement Removal
      const { removeStatementTrack } = require("../utils/statementTrack");
      for (const matchId of matchIdsToVoid) {
        const betInfo = historyMap.get(txns.find(t => t.platformTxId === existingHistory.find(h => h._id.toString() === matchId.toString())?.platformTxId)?.platformTxId);
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
      balance: Number((finalUser?.balance || 0).toFixed(2)),
      balanceTs: new Date(),
    });

  } catch (error) {
    console.error("Critical Error in voidSettle Bulk Handler:", error);
    if (!res.headersSent) {
      res.status(500).send({ status: "9999", desc: "Internal Server Error" });
    }
  }
}

module.exports = {
  payload,
  handler,
};
