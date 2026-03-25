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
  let { key, message } = req.body;
  console.log("get betNsettle : message:: ", message);
  console.log("get betNsettle : key :: ", key);

  message = typeof message === "string" ? JSON.parse(message) : message;
  const { txns } = message;

  let user_name = "";

  let isSend = false;
  for await (const transaction of txns) {
    const {
      platform,
      // turnover,
      userId,
      betAmount,
      roundId,
      platformTxId,
      winAmount,
      refPlatformTxId,
      requireAmount,
    } = transaction;
    user_name = userId;
    const query = {
      $or: [
        { casinoUserName: { $regex: `^${user_name}$`, $options: "i" } },
        { user_name: { $regex: `^${user_name}$`, $options: "i" } },
      ],
    };
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
    console.log(new Date(), "betQuery :: ", betQuery);
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

    if (!userInfo) {
      res.send({
        status: "1000",
        desc: "Invalid user Id",
      });
      // Check for above user data
      throw new ApiError(httpStatus.BAD_REQUEST, CUSTOM_MESSAGE.USER_NOT_FOUND);
    }

    if (userInfo && userInfo.balance < betAmount) {
      isSend = true;
      const sendData = {
        status: userInfo.balance >= requireAmount ? "0000" : "1018",
        balance: userInfo.balance,
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
          // isBlock: true,
        },
        sort: { isBlock:-1, updatedAt: -1 },
      });
    const adminInfo = await mongo.bettingApp
      .model(mongo.models.admins)
      .findOne({
        query: {
          _id: { $in: userInfo.whoAdd },
          agent_level: USER_LEVEL_NEW.WL,
        },
        select: {
          casinoWinings: 1, // player winning
          casinoWinLimit: 1,
          casinoUserBalance: 1 // casino limit
        },
      });

    const totalExposure = await getTotalExposure(adminInfo._id)
    console.log("betNsettle : totalExposure :: ", totalExposure);
    console.log("betNsettle : adminInfo :: ", adminInfo);
    console.log("betNsettle : blockMarketDetail :: ", blockMarketDetail);
    console.log("betNsettle : blockMarketDetail :: ", betAmount);
    console.log(
      "betNsettle : userInfo if ",
      userInfo && status === GAME_STATUS.LOSE &&
        (Number(userInfo.balance.toFixed(2)) < betAmount ||
          -adminInfo?.casinoWinings >= adminInfo?.casinoUserBalance || 
          betAmount > adminInfo?.casinoUserBalance ||
          (-adminInfo?.casinoWinings)+totalExposure >= adminInfo?.casinoUserBalance ||
          ((-adminInfo?.casinoWinings)+totalExposure + betAmount) >= adminInfo?.casinoUserBalance ||
          (blockMarketDetail && blockMarketDetail.isBlock))
    );

    if (userInfo && status === GAME_STATUS.LOSE &&
      (Number(userInfo.balance.toFixed(2)) < betAmount ||
        -adminInfo?.casinoWinings >= adminInfo?.casinoUserBalance ||
        betAmount > adminInfo?.casinoUserBalance ||
        (-adminInfo?.casinoWinings)+totalExposure >= adminInfo?.casinoUserBalance ||
        ((-adminInfo?.casinoWinings)+totalExposure + betAmount) >= adminInfo?.casinoUserBalance ||
        (blockMarketDetail && blockMarketDetail.isBlock))
    ) {
      isSend = true;
      const sendData = {
        status: "1018",
        balance: userInfo.balance,
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

      // if there any issue just remove it assign value key
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
      console.log(
        new Date(),
        " betNsettle :: modificationObject ::: ",
        modificationObject
      );

      if (modificationObject.modifiedCount) {
        // const tempWinLoss = winLoss ? winLoss : winAmount - betAmount;
        await mongo.bettingApp.model(mongo.models.users).updateOne({
          query,
          update: {
            $inc: {
              remaining_balance: winLoss,
              balance: winLoss,
              ref_pl: winLoss,
              cumulative_pl: winLoss,
              casinoWinings: winLoss, // casinoWinAmount
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
              casinoWinings: winLoss, // casino win amount inc
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

  const lastQuery = {
    $or: [
      { casinoUserName: { $regex: `^${user_name}$`, $options: "i" } },
      { user_name: { $regex: `^${user_name}$`, $options: "i" } },
    ],
  };

  const userInfoLast = await mongo.bettingApp
    .model(mongo.models.users)
    .findOne({
      query: lastQuery,
      select: {
        balance: 1,
        remaining_balance: 1,
        exposure: 1,
        _id: 1,
      },
    });
  const sendData = {
    status: "0000",
    balance: Number(userInfoLast.balance.toFixed(2)),
    balanceTs: new Date(),
  };
  if (!isSend) res.send(sendData);
}

module.exports = {
  payload,
  handler,
};
