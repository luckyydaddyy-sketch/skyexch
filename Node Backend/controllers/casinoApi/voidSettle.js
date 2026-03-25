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
  let { key, message } = req.body;
  console.log("get void_settle  : message:: ", message);
  console.log("get void_settle : key :: ", key);
  message = typeof message === "string" ? JSON.parse(message) : message;
  const { txns } = message;

  for await (const transaction of txns) {
    const { userId, betAmount, roundId, platformTxId, voidType } = transaction;
    const query = {
      $or: [
        { casinoUserName: { $regex: `^${userId}$`, $options: "i" } },
        { user_name: { $regex: `^${userId}$`, $options: "i" } },
      ],
    };
    let userInfo = await mongo.bettingApp.model(mongo.models.users).findOne({
      // Find user information
      query,
      select: {
        balance: 1,
        remaining_balance: 1,
        cumulative_pl: 1,
        ref_pl: 1,
        exposure: 1,
        _id: 1,
        whoAdd: 1,
      },
    });

    console.log("void_settle ::: userInfo : ", userInfo);
    if (!userInfo) {
      res.send({
        status: "1000",
        desc: "Invalid user Id",
      });
      // Check for above user data
      throw new ApiError(httpStatus.BAD_REQUEST, CUSTOM_MESSAGE.USER_NOT_FOUND);
    }

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
          gameStatus: 1,
          isMatchComplete: 1,
          winLostAmount: 1,
          betAmount: 1,
          gameStatus: 1,
          _id: 1,
        },
      });
    console.log("void_settle ::: betInfo : ", betInfo);
    if (betInfo && betInfo.isMatchComplete) {
      let winLostAmount = 0;
      if (betInfo.gameStatus === GAME_STATUS.WIN) {
        winLostAmount -= betInfo.winLostAmount;
      } else if (betInfo.gameStatus === GAME_STATUS.LOSE) {
        winLostAmount += betInfo.winLostAmount;
      }

      await mongo.bettingApp.model(mongo.models.casinoMatchHistory).updateOne({
        query: betQuery,
        update: {
          $set: {
            gameInfo: transaction.gameInfo,
            isMatchComplete: false,
            gameStatus: GAME_STATUS.VOID,
            winLostAmount: 0,
            winLostAmountForVoidSettel: -winLostAmount,
          },
        },
      });

      console.log("void_settle ::: winLostAmount : ", winLostAmount);
      await mongo.bettingApp.model(mongo.models.users).updateOne({
        query,
        update: {
          $inc: {
            remaining_balance: winLostAmount,
            balance: winLostAmount,
            ref_pl: winLostAmount,
            cumulative_pl: winLostAmount,
            casinoWinings: winLostAmount, // casino win amount inc
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
            casinoWinings: winLostAmount, // casino win amount inc
          },
        },
      });
      // add statement
      // await casinoStateMentTrack({
      //   userId: userInfo._id,
      //   win: winLostAmount,
      //   casinoMatchId: betInfo._id,
      //   betAmount: betInfo.betAmount,
      // });
      console.log("void_settle :: betInfo :: remove :: ");
      // remove satement
      await removeStatementTrack({
        userId: userInfo._id,
        casinoMatchId: betInfo._id,
        betAmount: betInfo.betAmount,
        betType: "casino",
      });
      // await mongo.bettingApp.model(mongo.models.users).updateOne({
      //   query,
      //   update: {
      //     $inc: {
      //       remaining_balance: -betInfo.betAmount,
      //       exposure: betInfo.betAmount,
      //     },
      //   },
      // });
    }
  }

  const sendData = {
    status: "0000",
  };

  res.send(sendData);
}

module.exports = {
  payload,
  handler,
};
