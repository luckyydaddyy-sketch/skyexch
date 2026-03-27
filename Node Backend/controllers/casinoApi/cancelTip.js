const joi = require("joi");
const mongo = require("../../config/mongodb");
const { USER_LEVEL_NEW, GAME_STATUS } = require("../../constants");

const payload = {
  body: joi.object().keys({}),
};

async function handler(req, res) {
  try {
    let { key, message } = req.body;
    console.log("get cancelTip : message:: ", message);

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
      select: { balance: 1, remaining_balance: 1, _id: 1, whoAdd: 1 },
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
      return h && h.gameStatus === GAME_STATUS.CANCEL_TIP;
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
    let totalReturnAmount = 0;
    const matchIdsToCancel = [];

    for (const transaction of txns) {
      const tipInfo = historyMap.get(transaction.platformTxId);
      if (tipInfo && tipInfo.gameStatus === GAME_STATUS.TIP) {
        totalReturnAmount += tipInfo.betAmount || 0;
        matchIdsToCancel.push(tipInfo._id);

        bulkOpsHistory.push({
          updateOne: {
            filter: { _id: tipInfo._id },
            update: {
              $set: {
                gameStatus: GAME_STATUS.CANCEL_TIP,
                gameInfo: transaction.gameInfo,
              },
            },
          },
        });
      } else if (!tipInfo) {
        // Advance Cancel Handling (CancelTip arrives before Tip)
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
          betAmount: 0,
          isMatchComplete: true,
          gameStatus: GAME_STATUS.CANCEL_TIP,
          gameInfo: transaction.cancelTipInfo || transaction.gameInfo || {}
        };
        bulkOpsHistory.push({ insertOne: { document: historyDoc } });
      }
    }

    if (bulkOpsHistory.length > 0) {
      const operations = [
        mongo.bettingApp.model(mongo.models.casinoMatchHistory).bulkWrite({ operations: bulkOpsHistory }),
        mongo.bettingApp.model(mongo.models.users).updateOne({
          query: { _id: userInfo._id },
          update: {
            $inc: {
              balance: totalReturnAmount,
              remaining_balance: totalReturnAmount,
              casinoWinings: totalReturnAmount,
            },
          },
        }),
        mongo.bettingApp.model(mongo.models.admins).updateOne({
          query: { _id: { $in: userInfo.whoAdd || [] }, agent_level: USER_LEVEL_NEW.WL },
          update: { $inc: { casinoWinings: totalReturnAmount } }
        })
      ];

      await Promise.all(operations);

      // Batch Statement Removal
      const { removeStatementTrack } = require("../utils/statementTrack");
      for (const matchId of matchIdsToCancel) {
        await removeStatementTrack({
          userId: userInfo._id,
          casinoMatchId: matchId,
          betAmount: 0,
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
    console.error("Critical Error in cancelTip Bulk Handler:", error);
    if (!res.headersSent) {
      res.status(500).send({ status: "9999", desc: "Internal Server Error" });
    }
  }
}

module.exports = {
  payload,
  handler,
};
