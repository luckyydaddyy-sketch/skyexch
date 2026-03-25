const joi = require("joi");
const mongo = require("../../config/mongodb");
const { GAME_STATUS, CASINO_NAME, USER_LEVEL_NEW } = require("../../constants");
const CUSTOM_MESSAGE = require("../../utils/message");
const { casinoStateMentTrack } = require("../utils/statementTrack");
const ApiError = require("../../utils/ApiError");
const httpStatus = require("http-status");
const { getTotalExposure } = require("./helpers/getTotalExposure");

const payload = {
  body: joi.object().keys({}),
};

async function handler(req, res) {
  try {
    let { key, message } = req.body;
    console.log("get betNsettle : message:: ", message);
    console.log("get betNsettle : key :: ", key);

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

    let isSend = false;
    for await (const transaction of txns) {
      const {
        platform,
        userId,
        betAmount,
        roundId,
        platformTxId,
        winAmount,
        requireAmount,
      } = transaction;

      const betQuery = {
        userId,
        roundId,
        platformTxId,
      };
      let status = "";

      const turnover = Math.abs(winAmount - betAmount);
      const winLoss = winAmount - betAmount;
      if (winLoss > 0) status = GAME_STATUS.WIN;
      else status = GAME_STATUS.LOSE;

      console.log(
        new Date(),
        "betNsettle : data :: turnover : ",
        turnover,
        "winLoss :: ",
        winLoss
      );

      if (userInfo.balance < betAmount) {
        isSend = true;
        const sendData = {
          status: userInfo.balance >= requireAmount ? "0000" : "1018",
          balance: Number(userInfo.balance.toFixed(2)),
          balanceTs: new Date(),
        };

        res.send(sendData);
        break;
      }

      const marketDetail = await mongo.bettingApp
        .model(mongo.models.marketLists)
        .findOne({
          query: {
            name: "Casino",
          },
        });
      const blockMarketDetail = await mongo.bettingApp
        .model(mongo.models.blockMarketLists)
        .findOne({
          query: {
            userId: { $in: userInfo.whoAdd },
            marketId: mongo.ObjectId(marketDetail._id),
          },
          sort: { isBlock: -1, updatedAt: -1 },
        });
      const adminInfo = await mongo.bettingApp
        .model(mongo.models.admins)
        .findOne({
          query: {
            _id: { $in: userInfo.whoAdd },
            agent_level: USER_LEVEL_NEW.WL,
          },
          select: {
            casinoWinings: 1,
            casinoWinLimit: 1,
            casinoUserBalance: 1,
          },
        });

      const totalExposure = await getTotalExposure(adminInfo._id);

      if (
        status === GAME_STATUS.LOSE &&
        (Number(userInfo.balance.toFixed(2)) < betAmount ||
          -adminInfo?.casinoWinings >= adminInfo?.casinoUserBalance ||
          betAmount > adminInfo?.casinoUserBalance ||
          -adminInfo?.casinoWinings + totalExposure >= adminInfo?.casinoUserBalance ||
          -adminInfo?.casinoWinings + totalExposure + betAmount >=
            adminInfo?.casinoUserBalance ||
          (blockMarketDetail && blockMarketDetail.isBlock))
      ) {
        isSend = true;
        const sendData = {
          status: "1018",
          balance: Number(userInfo.balance.toFixed(2)),
          balanceTs: new Date(),
        };

        res.send(sendData);
        break;
      }

      let betInfo = await mongo.bettingApp
        .model(mongo.models.casinoMatchHistory)
        .findOne({
          query: betQuery,
          select: {
            isMatchComplete: 1,
            gameStatus: 1,
            _id: 1,
          },
        });

      if (!betInfo) {
        transaction.userObjectId = userInfo._id;

        betInfo = await mongo.bettingApp
          .model(mongo.models.casinoMatchHistory)
          .insertOne({ document: transaction });
      }
      if (
        !betInfo ||
        (betInfo &&
          !betInfo.isMatchComplete &&
          betInfo.gameStatus !== GAME_STATUS.CANCEL)
      ) {
        const newBetQuery = {
          userId,
          roundId,
          platformTxId,
          isMatchComplete: false,
        };
        const modificationObject = await mongo.bettingApp
          .model(mongo.models.casinoMatchHistory)
          .updateOne({
            query: newBetQuery,
            update: {
              $set: {
                gameInfo: transaction.gameInfo,
                isMatchComplete: true,
                gameStatus: status,
                winLostAmount: turnover,
              },
            },
          });

        if (modificationObject.modifiedCount) {
          const updateResult = await mongo.bettingApp.model(mongo.models.users).findOneAndUpdate({
            query: { _id: userInfo._id },
            update: {
              $inc: {
                remaining_balance: winLoss,
                balance: winLoss,
                ref_pl: winLoss,
                cumulative_pl: winLoss,
                casinoWinings: winLoss,
              },
            },
            options: { new: true }
          });
          userInfo.balance = updateResult.balance;

          // update casino amount in admin
          await mongo.bettingApp.model(mongo.models.admins).updateOne({
            query: {
              _id: { $in: userInfo.whoAdd },
              agent_level: USER_LEVEL_NEW.WL,
            },
            update: {
              $inc: {
                casinoWinings: winLoss,
              },
            },
          });

          // add statement
          await casinoStateMentTrack({
            userId: userInfo._id,
            win: winLoss,
            casinoMatchId: betInfo._id,
            betAmount,
          });
        }
      }
    }

    if (!isSend) {
      const sendData = {
        status: "0000",
        balance: Number(userInfo.balance.toFixed(2)),
        balanceTs: new Date(),
      };
      res.send(sendData);
    }
  } catch (error) {
    console.error("Error in betNsettle handler:", error);
    if (!res.headersSent) {
      res.status(500).send({ status: "1000", desc: "Internal Server Error" });
    }
  }
}

module.exports = {
  payload,
  handler,
};
