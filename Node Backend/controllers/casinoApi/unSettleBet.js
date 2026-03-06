const joi = require("joi");
const httpStatus = require("http-status");
const mongo = require("../../config/mongodb");
const { CASINO_NAME, GAME_STATUS, USER_LEVEL_NEW } = require("../../constants");
const { settleWinHelper } = require("./helpers/settleWinHelper");
const {
  casinoStateMentTrack,
  removeStatementTrack,
} = require("../utils/statementTrack");
const ApiError = require("../../utils/ApiError");
const CUSTOM_MESSAGE = require("../../utils/message");

const payload = {
  body: joi.object().keys({}),
};

async function handler(req, res) {
  let { key, message } = req.body;
  console.log("get re unsettle : message:: ", message);
  console.log("get re unsettle : key :: ", key);

  message = typeof message === "string" ? JSON.parse(message) : message;
  const { txns } = message;

  for (const transaction of txns) {
    let {
      platform,
      turnover,
      userId,
      betAmount,
      roundId,
      platformTxId,
      winAmount,
      refPlatformTxId,
      gameInfo: { status, winLoss },
    } = transaction;

    const query = {
      casinoUserName: { $regex: `^${userId}$`, $options: "i" },
    };
    const betQuery = {
      userId,
      roundId,
      platformTxId,
    };

    if (CASINO_NAME.KINGMAKER === platform) {
      betQuery.platformTxId = refPlatformTxId;
    } else {
      betQuery.platformTxId = platformTxId;
    }
    let userInfo = await mongo.bettingApp.model(mongo.models.users).findOne({
      query,
      select: {
        balance: 1,
        remaining_balance: 1,
        exposure: 1,
        _id: 1,
        whoAdd: 1,
      },
    });

    console.log("unsettle : userInfo ::: ", userInfo);
    if (!userInfo) {
      res.send({
        status: "1000",
        desc: "Invalid user Id",
      });
      // Check for above user data
      throw new ApiError(httpStatus.BAD_REQUEST, CUSTOM_MESSAGE.USER_NOT_FOUND);
    }

    let betInfo = await mongo.bettingApp
      .model(mongo.models.casinoMatchHistory)
      .findOne({
        query: betQuery,
        select: {
          isMatchComplete: 1,
          gameStatus: 1,
          winLostAmount: 1,
          betAmount: 1,
          _id: 1,
        },
      });
    console.log(" unsettle ::  betInfo ::: ", betInfo);
    if (betInfo && betInfo.isMatchComplete) {
      if (betInfo.gameStatus === GAME_STATUS.LOSE) {
        await mongo.bettingApp.model(mongo.models.users).updateOne({
          query,
          update: {
            $inc: {
              remaining_balance: betInfo.winLostAmount,
              cumulative_pl: betInfo.winLostAmount,
              ref_pl: betInfo.winLostAmount,
              exposure: betInfo.betAmount,
              // balance: betInfo.winLostAmount,
              casinoWinings: betInfo.winLostAmount, // casino win amount inc
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
              casinoWinings: betInfo.winLostAmount, // casino win amount inc
            },
          },
        });
      } else if (betInfo.gameStatus === GAME_STATUS.WIN) {
        await mongo.bettingApp.model(mongo.models.users).updateOne({
          query,
          update: {
            $inc: {
              balance: -(betInfo.winLostAmount + betInfo.betAmount),
              remaining_balance: -betInfo.winLostAmount,
              ref_pl: -betInfo.winLostAmount,
              cumulative_pl: -betInfo.winLostAmount,
              exposure: betInfo.betAmount,
              casinoWinings: -betInfo.winLostAmount, // casino win amount inc
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
              casinoWinings: -betInfo.winLostAmount, // casino win amount inc
            },
          },
        });
      } else if (betInfo.gameStatus === GAME_STATUS.TIE) {
        await mongo.bettingApp.model(mongo.models.users).updateOne({
          query,
          update: {
            $inc: {
              // remaining_balance: -betInfo.winLostAmount,
              balance: -betInfo.betAmount,
              exposure: betInfo.betAmount,
            },
          },
        });
      }

      await mongo.bettingApp.model(mongo.models.casinoMatchHistory).updateOne({
        query: betQuery,
        update: {
          $set: {
            isMatchComplete: false,
            gameInfo: transaction.gameInfo,
          },
        },
      });

      // if (CASINO_NAME.ESPORTS === platform) {
      //   turnover = Math.abs(winAmount - betAmount);
      //   winLoss = winAmount - betAmount;
      //   if (winLoss > 0) status = GAME_STATUS.WIN;
      //   else status = GAME_STATUS.LOSE;
      // }

      // console.log("resettle : turnover ::: ", turnover);
      // console.log("resettle : winLoss ::: ", winLoss);
      // console.log("resettle : status ::: ", status);

      // await settleWinHelper(
      //   betQuery,
      //   query,
      //   status,
      //   turnover,
      //   betAmount,
      //   winLoss ? winLoss : winAmount - betAmount
      // );

      // // add statement
      // if (status !== GAME_STATUS.TIE)
      //   await casinoStateMentTrack({
      //     userId: userInfo._id,
      //     win: winLoss ? winLoss : winAmount - betAmount,
      //     casinoMatchId: betInfo._id,
      //     betAmount,
      //   });
      // // remove satement on tie match
      // else
      await removeStatementTrack({
        userId: userInfo._id,
        casinoMatchId: betInfo._id,
        betAmount: betInfo.betAmount,
        betType: "casino",
      });
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
