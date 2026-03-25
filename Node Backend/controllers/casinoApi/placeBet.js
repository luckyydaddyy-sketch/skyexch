const joi = require("joi");
const mongo = require("../../config/mongodb");
const {
  GAME_STATUS,
  CASINO_NAME,
  GAME_CODE_FOR_ROUND_ID,
  USER_LEVEL_NEW,
} = require("../../constants");
const { getTotalExposure } = require("./helpers/getTotalExposure");

const payload = {
  body: joi.object().keys({}),
};

async function handler(req, res) {
  let { key, message } = req.body;
  console.log("get placeBet : message:: ", message);
  console.log("get placeBet : key :: ", key);

  message = typeof message === "string" ? JSON.parse(message) : message;
  const { txns } = message;
  let userId = "";
  let isSend = false;
  let updateUserInfo;

  const {
    AK47,
    Andar_Bahar,
    Jackpot_Bingo,
    TeenPatti_Joker,
    Bingo_Carnaval,
    TeenPatti,
  } = GAME_CODE_FOR_ROUND_ID;
  for await (const transaction of txns) {
    // set user id
    console.log("transaction.userId :: ", transaction.userId);

    userId = transaction.userId;
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
        casinoWinings: 1,
        whoAdd: 1,
      },
    });

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
    console.log("totalExposure :: ", totalExposure);
    console.log("adminInfo :: ", adminInfo);
    console.log("blockMarketDetail :: ", blockMarketDetail);
    console.log("betAmount :: ", transaction.betAmount);
    console.log(
      "userInfo if ",
      userInfo &&
        (Number(userInfo.balance.toFixed(2)) < transaction.betAmount ||
          -adminInfo?.casinoWinings >= adminInfo?.casinoUserBalance || 
          transaction.betAmount > adminInfo?.casinoUserBalance ||
          (-adminInfo?.casinoWinings)+totalExposure >= adminInfo?.casinoUserBalance ||
          ((-adminInfo?.casinoWinings)+totalExposure + transaction.betAmount) >= adminInfo?.casinoUserBalance ||
          (blockMarketDetail && blockMarketDetail.isBlock))
    );
// let ff = adminInfo?.casinoWinings > 0 ? -adminInfo?.casinoWinings : 
/*
casinoUserBalance = 10
casinoWinings = -8 // user win
totalExposure = 2
bet = 5
*/
    if (
      userInfo &&
      (Number(userInfo.balance.toFixed(2)) < transaction.betAmount ||
        -adminInfo?.casinoWinings >= adminInfo?.casinoUserBalance ||
        transaction.betAmount > adminInfo?.casinoUserBalance ||
        (-adminInfo?.casinoWinings)+totalExposure >= adminInfo?.casinoUserBalance ||
        ((-adminInfo?.casinoWinings)+totalExposure + transaction.betAmount) >= adminInfo?.casinoUserBalance ||
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

    const betQuery = {
      userId: transaction.userId,
      roundId: transaction.roundId,
    };
    if (
      ![
        AK47,
        Andar_Bahar,
        Jackpot_Bingo,
        TeenPatti_Joker,
        Bingo_Carnaval,
        TeenPatti,
      ].includes(transaction.gameCode)
    ) {
      betQuery.platformTxId = transaction.platformTxId;
    }
    const betInfo = await mongo.bettingApp
      .model(mongo.models.casinoMatchHistory)
      .findOne({
        query: betQuery,
        //         {
        //   userId: transaction.userId,
        //   roundId: transaction.roundId,
        //   platformTxId: transaction.platformTxId,
        // },
        select: {
          gameStatus: 1,
          isMatchComplete: 1,
          winLostAmount: 1,
          betAmount: 1,
          gameStatus: 1,
          _id: 1,
        },
      });
    console.log("transaction.userId :: betInfo :: ", betInfo);
    if (!betInfo) {
      console.log(" log place bet betInfo ::");
      transaction.userObjectId = userInfo._id;

      await mongo.bettingApp
        .model(mongo.models.casinoMatchHistory)
        .insertOne({ document: transaction });

      updateUserInfo = await mongo.bettingApp
        .model(mongo.models.users)
        .findOneAndUpdate({
          query,
          update: {
            $inc: {
              balance: -transaction.betAmount,
              exposure: transaction.betAmount,
            },
          },
          options: {
            new: true,
            returnNewDocument: true,
          },
        });
    } else if (
      betInfo &&
      betInfo.gameStatus !== GAME_STATUS.CANCEL &&
      CASINO_NAME.HORSEBOOK !== transaction.platform
    ) {
      console.log(" log place bet betInfo :: 11 :: ");
      updateUserInfo = await mongo.bettingApp
        .model(mongo.models.users)
        .findOneAndUpdate({
          query,
          update: {
            $inc: {
              balance: -transaction.betAmount,
              exposure: transaction.betAmount,
            },
          },
          options: {
            new: true,
            returnNewDocument: true,
          },
        });

      await mongo.bettingApp.model(mongo.models.casinoMatchHistory).updateOne({
        query: { _id: betInfo._id },
        update: {
          $inc: {
            betAmount: transaction.betAmount,
          },
        },
      });
    }
  }

  const tempUserInfo = await mongo.bettingApp
    .model(mongo.models.users)
    .findOne({
      query: {
        $or: [
          { casinoUserName: { $regex: `^${userId}$`, $options: "i" } },
          { user_name: { $regex: `^${userId}$`, $options: "i" } },
        ],
      },
      select: {
        balance: 1,
        remaining_balance: 1,
        exposure: 1,
        _id: 1,
      },
    });

  console.log("tempUserInfo ::: ");
  console.log(tempUserInfo);
  console.log("updateUserInfo ::: ");
  console.log(updateUserInfo);
  const sendData = {
    status: "0000",
    balance: updateUserInfo
      ? Number(updateUserInfo.balance.toFixed(2))
      : tempUserInfo
      ? Number(tempUserInfo.balance.toFixed(2))
      : 0,
    balanceTs: new Date(),
  };
  if (!isSend) res.send(sendData);
}

module.exports = {
  payload,
  handler,
};
