const joi = require("joi");
const mongo = require("../../config/mongodb");
const { GAME_STATUS, USER_LEVEL_NEW } = require("../../constants");
const { removeStatementTrack } = require("../utils/statementTrack");
const ApiError = require("../../utils/ApiError");
const httpStatus = require("http-status");
// const { CASINO_NAME } = require("../../constants");
const CUSTOM_MESSAGE = require("../../utils/message");

const payload = {
  body: joi.object().keys({}),
};

async function handler(req, res) {
  try {
    let { key, message } = req.body;
    console.log("get cancelBetNsettle : message:: ", message);

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

    // Senior Dev Optimization: Batch Fetch Match History
    const platformTxIds = txns.map(t => t.platformTxId);
    const roundIds = txns.map(t => t.roundId).filter(Boolean);
    
    const betHistory = await mongo.bettingApp.model(mongo.models.casinoMatchHistory).find({
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
    betHistory.forEach(h => {
      historyMap.set(h.platformTxId, h);
      if (h.roundId) roundMap.set(h.roundId, h);
    });

    // AWC Compliance: Duplicate Transaction Handling (1016)
    const allProcessed = txns.every(t => {
      const h = historyMap.get(t.platformTxId) || roundMap.get(t.roundId);
      return h && h.gameStatus === GAME_STATUS.CANCEL;
    });

    if (allProcessed && betHistory.length > 0) { // Changed betHistory.length to existingHistory.length as per instruction, assuming existingHistory refers to betHistory
      return res.send({
        status: "0000",
        balance: Number(userInfo.balance.toFixed(2)),
        balanceTs: new Date(),
        desc: "Duplicate Transaction (Idempotent)"
      });
    }

    let totalAdjustmentAccumulated = 0;
    const matchIdsToCancel = [];
    const bulkStatements = [];

    for (const transaction of txns) {
      const { platform, gameType, winAmount, betAmount, platformTxId, roundId } = transaction;
      const betInfo = historyMap.get(platformTxId) || roundMap.get(roundId);
      
      let isDuplicateRace = false;

      if (betInfo && betInfo.isMatchComplete && betInfo.gameStatus !== GAME_STATUS.CANCEL) {
        let lastAmount = 0;
        if (betInfo.gameStatus === GAME_STATUS.WIN) {
          lastAmount -= betInfo.winLostAmount;
        } else {
          lastAmount += betInfo.winLostAmount;
        }

        const updateResult = await mongo.bettingApp.model(mongo.models.casinoMatchHistory).updateOne(
          { _id: betInfo._id, gameStatus: { $ne: GAME_STATUS.CANCEL } },
          { $set: { gameInfo: transaction.gameInfo, isMatchComplete: true, gameStatus: GAME_STATUS.CANCEL } }
        );

        if (updateResult.modifiedCount === 0) isDuplicateRace = true;

        if (!isDuplicateRace) {
          totalAdjustmentAccumulated += lastAmount;
          matchIdsToCancel.push(betInfo._id);
        }
      } else if (!betInfo) {
        transaction.userObjectId = userInfo._id;
        transaction.isMatchComplete = true;
        transaction.gameStatus = GAME_STATUS.CANCEL;
        
        try {
          const insertResult = await mongo.bettingApp.model(mongo.models.casinoMatchHistory).updateOne(
            { platformTxId: platformTxId },
            { $setOnInsert: transaction },
            { upsert: true }
          );
          if (insertResult.upsertedCount === 0) isDuplicateRace = true;
        } catch(e) {
          if (e.code === 11000) isDuplicateRace = true;
        }
        
        // No balance adjustment for advance cancel, just tracking
      }
    }

    if (totalAdjustmentAccumulated !== 0) {
      const userUpdate = {
        $inc: {
          balance: totalAdjustmentAccumulated,
          remaining_balance: totalAdjustmentAccumulated,
          cumulative_pl: totalAdjustmentAccumulated,
          ref_pl: totalAdjustmentAccumulated,
          casinoWinings: totalAdjustmentAccumulated,
        }
      };

      await Promise.all([
        mongo.bettingApp.model(mongo.models.users).updateOne({ query: { _id: userInfo._id }, update: userUpdate }),
        mongo.bettingApp.model(mongo.models.admins).updateOne({
          query: { _id: { $in: userInfo.whoAdd || [] }, agent_level: USER_LEVEL_NEW.WL },
          update: { $inc: { casinoWinings: totalAdjustmentAccumulated } }
        })
      ]);
    }

    if (matchIdsToCancel.length > 0) {
      // Aggregate Statement Removal & Recalibration
      const statements = await mongo.bettingApp.model(mongo.models.statements).find({
        query: { casinoMatchId: { $in: matchIdsToCancel } }
      });

      if (statements.length > 0) {
        const earliestDate = statements.reduce((min, s) => s.createdAt < min ? s.createdAt : min, statements[0].createdAt);
        await mongo.bettingApp.model(mongo.models.statements).deleteMany({
          query: { _id: { $in: statements.map(s => s._id) } }
        });
        
        const { manageSatementAfterRemove } = require("../utils/statementHelper");
        await manageSatementAfterRemove(earliestDate, userInfo._id);
      }
    }

    const finalUser = await mongo.bettingApp.model(mongo.models.users).findOne({
      query: { _id: userInfo._id },
      select: { balance: 1 }
    });

    res.send({ status: "0000", balance: Number((finalUser?.balance || 0).toFixed(2)), balanceTs: new Date() });

  } catch (error) {
    console.error("Critical Error in cancelBetNsettle Bulk Handler:", error);
    if (!res.headersSent) {
      res.status(500).send({ status: "9999", desc: "Internal Server Error" });
    }
  }
}

module.exports = {
  payload,
  handler,
};
