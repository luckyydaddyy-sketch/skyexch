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
  console.log("get re refund : message:: ", message);
  console.log("get re refund : key :: ", key);

  message = typeof message === "string" ? JSON.parse(message) : message;
  const { txns } = message;

  const txnsIds = [];

  for await (const transaction of txns) {
    let {
      platform,
      userId,
      betAmount,
      roundId,
      winAmount,
      refundPlatformTxId,
      gameInfo: { status },
    } = transaction;

    const query = {
      casinoUserName: { $regex: `^${userId}$`, $options: "i" },
    };

    const betQuery = {
      userId,
      roundId,
      platformTxId: refundPlatformTxId,
    };

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

    console.log("refund : userInfo ::: ", userInfo);
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
          isRefundComplete: 1,
        },
      });
    console.log(" refund ::  betInfo ::: ", betInfo);
    console.log(
      " refund ::  !txnsIds.includes(refundPlatformTxId) ::: ",
      !txnsIds.includes(refundPlatformTxId)
    );
    if (
      betInfo &&
      betInfo.isMatchComplete &&
      !betInfo.isRefundComplete &&
      !txnsIds.includes(refundPlatformTxId)
    ) {
      txnsIds.push(refundPlatformTxId);
      if (betInfo.gameStatus === GAME_STATUS.LOSE) {
        await mongo.bettingApp.model(mongo.models.users).updateOne({
          query,
          update: {
            $inc: {
              remaining_balance: betInfo.winLostAmount,
              cumulative_pl: betInfo.winLostAmount,
              ref_pl: betInfo.winLostAmount,
              exposure: betInfo.betAmount,
              casinoWinings: betInfo.betAmount, // casino win amount inc
              // balance: betInfo.winLostAmount,
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
              casinoWinings: betInfo.betAmount, // casino win amount inc
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

      const updateData = {
        isMatchComplete: false,
        gameInfo: transaction.gameInfo,
        isRefundComplete: true,
      };

      // if (txnsIds.length === 2) {
      //   updateData.isRefundComplete = true;
      // }

      await mongo.bettingApp.model(mongo.models.casinoMatchHistory).updateOne({
        query: betQuery,
        update: {
          $set: updateData,
        },
      });
      let winLoss = 0;
      let turnover = 0;

      // if (CASINO_NAME.ESPORTS === platform) {
      turnover = Math.abs(winAmount - betAmount);
      // turnover = winAmount;
      winLoss = winAmount - betAmount;
      // winLoss = winAmount;
      if (winLoss > 0) status = GAME_STATUS.WIN;
      else status = GAME_STATUS.LOSE;

      if (
        CASINO_NAME.ESPORTS === platform &&
        transaction.gameInfo.txnResult === "DRAW"
      ) {
        status = GAME_STATUS.TIE;
      }
      // }
      console.log("refund : turnover ::: ", turnover);
      console.log("refund : winLoss ::: ", winLoss);
      console.log("refund : status ::: ", status);
      console.log("refund : betInfo.betAmount ::: ", betInfo.betAmount);

      // first remove entery
      await removeStatementTrack({
        userId: userInfo._id,
        casinoMatchId: betInfo._id,
        betAmount: betInfo.betAmount,
        betType: "casino",
      });

      const myExtraAmount = Number((betAmount - winLoss).toFixed(2));

      await mongo.bettingApp.model(mongo.models.users).updateOne({
        query,
        update: {
          $inc: {
            exposure: myExtraAmount,
            remaining_balance: myExtraAmount,
            // casinoWinings: myExtraAmount, // casino win amount inc
          },
        },
      });

      await settleWinHelper(
        betQuery,
        query,
        status,
        turnover,
        betAmount,
        winLoss ? winLoss : winAmount - betAmount
      );

      // add statement

      await casinoStateMentTrack({
        userId: userInfo._id,
        win: winLoss ? winLoss : winAmount - betAmount,
        casinoMatchId: betInfo._id,
        betAmount,
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
