const joi = require("joi");
const mongo = require("../../config/mongodb");
const { USER_LEVEL_NEW, GAME_STATUS } = require("../../constants");

const payload = {
  body: joi.object().keys({}),
};

async function handler(req, res) {
  try {
    let { key, message } = req.body;
    console.log("get tip : message:: ", message);

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

    const [userInfo, adminInfo] = await Promise.all([
      mongo.bettingApp.model(mongo.models.users).findOne({
        query: userQuery,
        select: { balance: 1, remaining_balance: 1, _id: 1, whoAdd: 1 },
      }),
      mongo.bettingApp.model(mongo.models.marketLists).findOne({ query: { name: "Casino" } }) // Just for validation
    ]);

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
      return h && h.gameStatus === GAME_STATUS.TIP;
    });

    if (allProcessed && existingHistory.length > 0) {
      return res.send({
        status: "0000",
        balance: Number(userInfo.balance.toFixed(2)),
        balanceTs: new Date(),
        desc: "Duplicate Transaction (Idempotent)"
      });
    }

    const adminWL = await mongo.bettingApp.model(mongo.models.admins).findOne({
      query: { _id: { $in: userInfo.whoAdd }, agent_level: USER_LEVEL_NEW.WL },
      select: { casinoWinings: 1 },
    });

    const bulkOpsHistory = [];
    const bulkStatements = [];
    let totalTipAmount = 0;

    for (const transaction of txns) {
      const tipAmount = transaction.tip || 0;
      if (historyMap.has(transaction.platformTxId)) continue; // Skip existing in multi-batch logic

      totalTipAmount += tipAmount;

      transaction.userObjectId = userInfo._id;
      transaction.isMatchComplete = true;
      transaction.gameStatus = GAME_STATUS.TIP;
      
      bulkOpsHistory.push({
        insertOne: { document: transaction }
      });

      if (tipAmount > 0) {
        bulkStatements.push({
          userId: userInfo._id,
          credit: 0,
          debit: tipAmount,
          balance: userInfo.balance - totalTipAmount,
          Remark: `Tip: ${transaction.platform}/${transaction.gameName || 'Casino'}`,
          type: "casino",
          betType: "casino",
          amountOfBalance: userInfo.balance,
          casinoMatchId: transaction.platformTxId || "TIP_TX", // Link via platformTxId since we use bulkWrite insertOne
        });
      }
    }

    if (userInfo.balance < totalTipAmount) {
      return res.send({ status: "1018", balance: Number(userInfo.balance.toFixed(2)), balanceTs: new Date() });
    }

    if (bulkOpsHistory.length > 0) {
      const operations = [
        mongo.bettingApp.model(mongo.models.casinoMatchHistory).bulkWrite({ operations: bulkOpsHistory }),
        mongo.bettingApp.model(mongo.models.users).updateOne({
          query: { _id: userInfo._id },
          update: {
            $inc: {
              balance: -totalTipAmount,
              remaining_balance: -totalTipAmount,
              casinoWinings: -totalTipAmount,
            },
          },
        })
      ];

      if (adminWL?._id) {
        operations.push(
          mongo.bettingApp.model(mongo.models.admins).updateOne({
            query: { _id: adminWL._id },
            update: { $inc: { casinoWinings: -totalTipAmount } }
          })
        );
      }

      if (bulkStatements.length > 0) {
        operations.push(
          mongo.bettingApp.model(mongo.models.statements).insertMany({ documents: bulkStatements })
        );
      }

      await Promise.all(operations);
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
    console.error("Critical Error in tip Bulk Handler:", error);
    if (!res.headersSent) {
      res.status(500).send({ status: "9999", desc: "Internal Server Error" });
    }
  }
}

module.exports = {
  payload,
  handler,
};
