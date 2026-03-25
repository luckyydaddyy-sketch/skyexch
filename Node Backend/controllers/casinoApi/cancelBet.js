const joi = require("joi");
const mongo = require("../../config/mongodb");
const { GAME_STATUS } = require("../../constants");
const { removeStatementTrack } = require("../utils/statementTrack");

const payload = {
  body: joi.object().keys({}),
};

async function handler(req, res) {
  try {
    let { key, message } = req.body;
    console.log("get cancel_bet : message:: ", message);

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
      select: { balance: 1, exposure: 1, _id: 1 },
    });

    if (!userInfo) {
      return res.send({ status: "1002", desc: "Invalid user Id" });
    }

    // Senior Dev Optimization: Batch Fetch Match History
    const platformTxIds = txns.map(t => t.platformTxId);
    
    const betHistory = await mongo.bettingApp.model(mongo.models.casinoMatchHistory).find({
      query: {
        userId: { $regex: `^${userId}$`, $options: "i" },
        platformTxId: { $in: platformTxIds },
      }
    });

    const historyMap = new Map();
    betHistory.forEach(h => historyMap.set(h.platformTxId, h));

    // AWC Compliance: Duplicate Transaction Handling (1016)
    const allProcessed = txns.every(t => {
      const h = historyMap.get(t.platformTxId);
      return h && h.gameStatus === GAME_STATUS.CANCEL;
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
    let totalBalanceInc = 0;
    let totalExposureDec = 0;
    const matchIdsToCancel = [];

    for (const transaction of txns) {
      const betInfo = historyMap.get(transaction.platformTxId);

      if (betInfo && !betInfo.isMatchComplete) {
        bulkOpsHistory.push({
          updateOne: {
            filter: { _id: betInfo._id },
            update: {
              $set: {
                gameInfo: transaction.gameInfo,
                isMatchComplete: true,
                gameStatus: GAME_STATUS.CANCEL,
              },
            },
          },
        });
        totalBalanceInc += betInfo.betAmount;
        totalExposureDec += betInfo.betAmount;
        matchIdsToCancel.push(betInfo._id);
      } else if (!betInfo) {
        // Handle missing bet history as immediate cancel (safe for idempotency)
        transaction.isMatchComplete = true;
        transaction.gameStatus = GAME_STATUS.CANCEL;
        transaction.userObjectId = userInfo._id;
        bulkOpsHistory.push({
          insertOne: { document: transaction }
        });
      }
    }

    if (bulkOpsHistory.length > 0) {
      await mongo.bettingApp.model(mongo.models.casinoMatchHistory).bulkWrite({
        operations: bulkOpsHistory
      });
    }

    if (matchIdsToCancel.length > 0) {
      // Aggregate Statement Removal & Admin Balance Recovery
      const statements = await mongo.bettingApp.model(mongo.models.statements).find({
        query: { casinoMatchId: { $in: matchIdsToCancel } }
      });

      if (statements.length > 0) {
        const earliestDate = statements.reduce((min, s) => s.createdAt < min ? s.createdAt : min, statements[0].createdAt);
        
        // Remove statements in one go
        await mongo.bettingApp.model(mongo.models.statements).deleteMany({
          query: { _id: { $in: statements.map(s => s._id) } }
        });

        // Recalibrate user balance once
        const { manageSatementAfterRemove } = require("../utils/statementHelper");
        await manageSatementAfterRemove(earliestDate, userInfo._id);

        // Batch update user balance/exposure
        await mongo.bettingApp.model(mongo.models.users).updateOne({
          query: { _id: userInfo._id },
          update: {
            $inc: {
              balance: totalBalanceInc,
              exposure: -totalExposureDec,
            },
          },
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
    console.error("Critical Error in cancelBet Bulk Handler:", error);
    if (!res.headersSent) {
      res.status(500).send({ status: "9999", desc: "Internal Server Error" });
    }
  }
}

module.exports = {
  payload,
  handler,
};
