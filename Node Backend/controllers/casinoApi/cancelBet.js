const joi = require("joi");
const mongo = require("../../config/mongodb");
const { GAME_STATUS } = require("../../constants");
const { removeStatementTrack } = require("../utils/statementTrack");

const payload = {
  body: joi.object().keys({}),
};

async function handler(req, res) {
  let { key, message } = req.body;
  console.log("get cancel_bet : message:: ", message);
  console.log("get cancel_bet : key :: ", key);

  message = typeof message === "string" ? JSON.parse(message) : message;
  const { txns } = message;
  const { userId } = txns[0];
  const query = {
    casinoUserName: { $regex: `^${userId}$`, $options: "i" },
  };

  for await (const transaction of txns) {
    const { roundId, userId, platformTxId } = transaction;
    const betQuery = {
      roundId,
      userId,
      platformTxId,
    };
    let betInfo = await mongo.bettingApp
      .model(mongo.models.casinoMatchHistory)
      .findOne({
        query: betQuery,
        select: {
          isMatchComplete: 1,
          betAmount: 1,
          _id: 1,
        },
      });
    const newUserQuery = {
      casinoUserName: { $regex: `^${transaction.userId}$`, $options: "i" },
    };

    const userInfo = await mongo.bettingApp.model(mongo.models.users).findOne({
      query: newUserQuery,
      select: {
        // balance: 1,
        // remaining_balance: 1,
        // exposure: 1,
        _id: 1,
      },
    });
    if (betInfo && !betInfo.isMatchComplete) {
      await mongo.bettingApp.model(mongo.models.casinoMatchHistory).updateOne({
        query: betQuery,
        update: {
          $set: {
            gameInfo: transaction.gameInfo,
            isMatchComplete: true,
            gameStatus: GAME_STATUS.CANCEL,
          },
        },
      });

      await mongo.bettingApp.model(mongo.models.users).updateOne({
        query: newUserQuery,
        update: {
          $inc: {
            balance: betInfo.betAmount,
            exposure: -betInfo.betAmount,
          },
        },
      });

      // remove statement
      await removeStatementTrack({
        userId: userInfo._id,
        casinoMatchId: betInfo._id,
        betType: "casino",
      });
    } else if (!betInfo) {
      transaction.isMatchComplete = true;
      transaction.gameStatus = GAME_STATUS.CANCEL;
      transaction.userObjectId = userInfo._id;

      await mongo.bettingApp
        .model(mongo.models.casinoMatchHistory)
        .insertOne({ document: transaction });
    }
  }

  const userInfo = await mongo.bettingApp.model(mongo.models.users).findOne({
    // Find user information
    query,
    select: {
      balance: 1,
      remaining_balance: 1,
      exposure: 1,
      _id: 1,
    },
  });

  const sendData = {
    status: "0000",
    balance: Number(userInfo.balance.toFixed(2)),
    balanceTs: new Date(),
  };

  res.send(sendData);
}

module.exports = {
  payload,
  handler,
};
