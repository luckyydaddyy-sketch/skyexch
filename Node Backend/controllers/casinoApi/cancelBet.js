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
    console.log("get cancel_bet : key :: ", key);

    message = typeof message === "string" ? JSON.parse(message) : message;
    const { txns } = message;
    const { userId } = txns[0];
    const query = {
      $or: [
        { casinoUserName: { $regex: `^${userId}$`, $options: "i" } },
        { user_name: { $regex: `^${userId}$`, $options: "i" } },
      ],
    };

    const userInfo = await mongo.bettingApp.model(mongo.models.users).findOne({
      query,
      select: {
        balance: 1,
        remaining_balance: 1,
        exposure: 1,
        _id: 1,
      },
    });

    if (!userInfo) {
      return res.send({
        status: "1000",
        desc: "Invalid user Id",
      });
    }

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
          query: { _id: userInfo._id },
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

    // Refresh user balance for final response
    const finalUserInfo = await mongo.bettingApp.model(mongo.models.users).findOne({
      query: { _id: userInfo._id },
      select: { balance: 1 },
    });

    const sendData = {
      status: "0000",
      balance: Number(finalUserInfo.balance.toFixed(2)),
      balanceTs: new Date(),
    };

    res.send(sendData);
  } catch (error) {
    console.error("Error in cancelBet handler:", error);
    res.status(500).send({ status: "1000", desc: "Internal Server Error" });
  }
}

module.exports = {
  payload,
  handler,
};
