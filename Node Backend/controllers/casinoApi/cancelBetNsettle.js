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
    console.log("get cancelBetNsettle : key :: ", key);

    message = typeof message === "string" ? JSON.parse(message) : message;
    const { txns } = message;

    const user_name = txns[0].userId;
    const query = {
      $or: [
        { casinoUserName: { $regex: `^${user_name}$`, $options: "i" } },
        { user_name: { $regex: `^${user_name}$`, $options: "i" } },
      ],
    };

    const userInfo = await mongo.bettingApp.model(mongo.models.users).findOne({
      query,
      select: {
        balance: 1,
        remaining_balance: 1,
        exposure: 1,
        _id: 1,
        whoAdd: 1,
      },
    });

    if (!userInfo) {
      return res.send({
        status: "1000",
        desc: "Invalid user Id",
      });
    }

    for await (const transaction of txns) {
      const { platform, userId, betAmount, roundId, platformTxId } = transaction;

      const betQuery = {
        userId,
        roundId,
        platformTxId,
      };

      console.log("cancelBetNsettle : betQuery :: ", betQuery);
      
      let betInfo = await mongo.bettingApp
        .model(mongo.models.casinoMatchHistory)
        .findOne({
          query: betQuery,
          select: {
            winLostAmount: 1,
            isMatchComplete: 1,
            gameStatus: 1,
            _id: 1,
          },
        });

      console.log("cancelBetNsettle : betInfo :: ", betInfo);
      if (
        betInfo &&
        betInfo.isMatchComplete &&
        betInfo.gameStatus !== GAME_STATUS.CANCEL
      ) {
        let lastAmount = 0;
        if (betInfo.gameStatus === GAME_STATUS.WIN) {
          lastAmount -= betInfo.winLostAmount;
        } else {
          lastAmount += betInfo.winLostAmount;
        }

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
              remaining_balance: lastAmount,
              balance: lastAmount,
              cumulative_pl: lastAmount,
              ref_pl: lastAmount,
              casinoWinings: lastAmount,
            },
          },
        });

        // update casino amount in admin
        await mongo.bettingApp.model(mongo.models.admins).updateOne({
          query: {
            _id: { $in: userInfo.whoAdd },
            agent_level: USER_LEVEL_NEW.WL,
          },
          update: {
            $inc: {
              casinoWinings: lastAmount,
            },
          },
        });

        // remove statement
        await removeStatementTrack({
          userId: userInfo._id,
          casinoMatchId: betInfo._id,
          betAmount,
          betType: "casino",
        });
      } else if (!betInfo) {
        transaction.userObjectId = userInfo._id;
        transaction.isMatchComplete = true;
        transaction.gameStatus = GAME_STATUS.CANCEL;
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
    console.error("Error in cancelBetNsettle handler:", error);
    if (!res.headersSent) {
      res.status(500).send({ status: "1000", desc: "Internal Server Error" });
    }
  }
}

module.exports = {
  payload,
  handler,
};
