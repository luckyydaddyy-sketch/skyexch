const httpStatus = require("http-status");
const joi = require("joi");
const mongo = require("../../../config/mongodb");
const ApiError = require("../../../utils/ApiError");
const { replaceString } = require("../../../utils/comman/replaceString");
const {
  sendUpdateBalanceEvent,
} = require("../../../utils/comman/updateBalance");
const CUSTOM_MESSAGE = require("../../../utils/message");
const {
  currantBet,
  currantBetOdds,
  currantBetPremium,
} = require("../../utils/sport/getUserBets");
const {
  handleBetPlaceError,
  handleBetPlaceErrorOnOddsValue,
  checkOddsIsMatchOrNot,
} = require("./handleBetPlaceError");
const { getRedLock } = require("../../../config/redLock");
const { SPORT_TYPE } = require("../../../constants");
const redis = require("../../../config/redis");
const config = require("../../../config/config");
const getMytotalProfit = require("../utils/getMyTotalProfit");

const payload = {
  body: joi.object().keys({
    matchId: joi.alternatives().try(joi.string(), joi.number()).required(),
    type: joi
      .string()
      .valid(
        SPORT_TYPE.CRICKET,
        SPORT_TYPE.SOCCER,
        SPORT_TYPE.TENNIS,
        SPORT_TYPE.ESOCCER,
        SPORT_TYPE.BASKETBALL
      )
      .required(),
    betType: joi
      .string()
      .valid("odds", "bookMark", "session", "premium")
      .required(),
    betSide: joi.string().required(), // like back, lay, yes, no
    selection: joi.string().required(), // get team name or score text
    betPlaced: joi.number().required(), // back = bet amount , lay = win amount
    stake: joi.number().required(), //
    oddsUp: joi.number().required(), //
    oddsDown: joi.number().required(), //
    profit: joi.number().required(), // back = profit and lay = lost
    exposure: joi.number().required(), //
    winnerSelection: joi.array().items(joi.string().optional()).required(), // list of selection
    fancyYes: joi.number().optional(), //
    fancyNo: joi.number().optional(), //
    subSelection: joi.string().allow("").optional(), // use only for premium
    sId: joi.number().optional(), // page api id
    pId: joi.number().allow("").optional(), // page api id for premium
    position: joi.string().allow("").optional(), // page id not for premium
    domain: joi.string().optional(), // domain name
  }),
};

async function handler({ body, user }) {
  let {
    matchId,
    type,
    betType,
    betSide,
    selection,
    betPlaced,
    stake,
    oddsUp,
    oddsDown,
    profit,
    exposure,
    winnerSelection,
    fancyYes,
    fancyNo,
    subSelection,
    domain,
  } = body;
  const { userId } = user;
  const { FANCY_WINNER, FANCY_WINNER_SELECTION } = config;
  const getLock = getRedLock();
  let userLock = null;
  if (getLock) {
    userLock = await getLock.acquire([userId], 3000);
  }

  try {
    if (betPlaced === 0 || stake === 0) {
      // Check for user are have bet amount or not
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        CUSTOM_MESSAGE.INVALID_BET_AMOUNT
      );
    }
    const query = {
      _id: userId,
    };

    const userInfo = await mongo.bettingApp.model(mongo.models.users).findOne({
      query,
      select: {
        remaining_balance: 1,
        balance: 1,
        status: 1,
        sportWinLimit: 1,
        sportWinings: 1,
        whoAdd: 1,
      },
    });
    let sportInfoQuery = { _id: matchId };
    if (mongo.isValidObjectId(matchId)) {
      sportInfoQuery = { _id: mongo.ObjectId(matchId) };
    } else {
      // If it's a FastOdds number ID and not an ObjectId, it's not in the DB's _id.
      // We can search by gameId to see if it's there.
      const matchIdNumber = Number(matchId);
      if (!isNaN(matchIdNumber)) {
        sportInfoQuery = { gameId: matchIdNumber };
      }
    }

    const sportInfo = await mongo.bettingApp
      .model(mongo.models.sports)
      .findOne({
        query: sportInfoQuery,
        // select: {
        //   remaining_balance: 1,
        //   balance: 1,
        //   status: 1,
        // },
      });

    // Query the global deafultSetting to apply dynamic limits from Admin panel
    const defaultSettings = await mongo.bettingApp
      .model(mongo.models.deafultSetting)
      .findOne({});

    if (defaultSettings && defaultSettings[sportInfo.type]) {
      const typeSettings = defaultSettings[sportInfo.type];
      sportInfo.oddsLimit = typeSettings.oddsLimit;
      sportInfo.bet_odds_limit = typeSettings.bet_odds_limit;
      sportInfo.bet_bookmaker_limit = typeSettings.bet_bookmaker_limit;
      sportInfo.bet_premium_limit = typeSettings.bet_premium_limit;
      if (sportInfo.type === SPORT_TYPE.CRICKET) {
        sportInfo.bet_fancy_limit = typeSettings.bet_fancy_limit;
      }
    }

    if (!userInfo) {
      // Check for user are have bet amount or not
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        CUSTOM_MESSAGE.USER_ACCOUNT_NOT_EXIST
      );
    }
    if (userInfo.status !== "active")
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        CUSTOM_MESSAGE.YOU_ARE_BLOCKED
      );
    if (
      userInfo.sportWinLimit !== 0 &&
      userInfo.sportWinLimit <= userInfo.sportWinings
    )
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        CUSTOM_MESSAGE.REACH_SPORT_LIMIT
      );

    if (!sportInfo) {
      // FastOdds event not yet synced to DB — create virtual sportInfo with default limits
      // so users can still place bets on live events.
      console.log(`[placeBet] sportInfo not found for matchId=${matchId}. Creating virtual sportInfo for FastOdds event.`);
      sportInfo = {
        _id: String(matchId),   // keep as string; guarded below
        gameId: Number(matchId) || matchId,
        marketId: body.position || "",
        type: type,
        status: true,
        winnerSelection: [],
        activeStatus: { bookmaker: true, fancy: true, premium: true, status: true },
        max_profit_limit: { odds: 0, bookmaker: 0, fancy: 0, premium: 0 }, // 0 = no limit
        oddsLimit: 0,
        bet_odds_limit: { min: 0, max: 0 },
        bet_bookmaker_limit: { min: 0, max: 0 },
        bet_fancy_limit: { min: 0, max: 0 },
        bet_premium_limit: { min: 0, max: 0 },
      };
    }

    // Overwrite matchId with the DB _id (or virtual string id for unsynced events)
    matchId = sportInfo._id;

    if (sportInfo && !sportInfo.status)
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        CUSTOM_MESSAGE.MATCH_IS_DISABLED_BY_ADMIN
      );

    let marketQuery = {};
    if (type === SPORT_TYPE.CRICKET) {
      marketQuery = {
        name: "Cricket",
      };
    } else if (type === SPORT_TYPE.SOCCER) {
      marketQuery = {
        name: "Soccer",
      };
    } else if (type === SPORT_TYPE.TENNIS) {
      marketQuery = {
        name: "Tennis",
      };
    }
    const marketDetail = await mongo.bettingApp
      .model(mongo.models.marketLists)
      .findOne({
        query: marketQuery,
      });
    const blockMarketDetail = await mongo.bettingApp
      .model(mongo.models.blockMarketLists)
      .findOne({
        query: {
          userId: { $in: userInfo.whoAdd },
          marketId: mongo.ObjectId(marketDetail._id),
          // isBlock: true,
        },
        sort: { isBlock: -1, updatedAt: -1 },
      });

    if (blockMarketDetail && blockMarketDetail.isBlock) {
      if (type === SPORT_TYPE.CRICKET) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          CUSTOM_MESSAGE.YOUR_CRICKET_BLOCKED
        );
      } else if (type === SPORT_TYPE.SOCCER) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          CUSTOM_MESSAGE.YOUR_SOCCER_BLOCKED
        );
      } else if (type === SPORT_TYPE.TENNIS) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          CUSTOM_MESSAGE.YOUR_TENNIS_BLOCKED
        );
      }
    }

    await handleBetPlaceError(sportInfo, body);
    console.log(" conttinued :: 1 : ");
    let isMatched = true;
    const oldOdds = oddsUp;
    if (betType === "odds") {
      const newOddsUpValue = await checkOddsIsMatchOrNot(sportInfo, body);
      console.log(" conttinued :: 2 : ");
      console.log("place bet : newOddsUpValue :: ", newOddsUpValue);
      if (newOddsUpValue !== oddsUp) {
        const calculatOdds = newOddsUpValue - 1;
        const newProfit = calculatOdds * betPlaced;
        oddsUp = newOddsUpValue;
        body.oddsUp = newOddsUpValue;
        profit = Number(newProfit.toFixed(2));
        body.profit = Number(newProfit.toFixed(2));
        if (betSide === "lay") {
          exposure = Number(newProfit.toFixed(2));
          body.exposure = Number(newProfit.toFixed(2));
        }
        isMatched = false;
      }
    }
    await handleBetPlaceErrorOnOddsValue(sportInfo, body);
    await handleBetPlaceError(sportInfo, body);

    const document = {
      userId,
      matchId,
      type,
      betType,
      betSide,
      selection,
      betPlaced,
      stake,
      oddsUp,
      oddsDown,
      profit,
      exposure,
      subSelection,
      winnerSelection,
      fancyYes,
      fancyNo,
      isMatched,
      oldOdds,
      isCheat: false,
    };
    // let newExp = 0;
    // let oldExp = 0;
    let betExp = {
      newExp: 0,
      oldExp: 0,
      profit: 0,
    };
    if (betType === "odds" || betType === "bookMark") {
      betExp = await currantBetOdds(body, userId);
      if (
        sportInfo?.max_profit_limit?.odds !== 0 &&
        sportInfo?.max_profit_limit?.odds <= betExp.profit &&
        betType === "odds"
      ) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          CUSTOM_MESSAGE.YOUR_PROFIT_LIMIT_EXPIRE
        );
      } else if (
        sportInfo?.max_profit_limit?.bookmaker !== 0 &&
        sportInfo?.max_profit_limit?.bookmaker <= betExp.profit &&
        betType === "bookMark"
      ) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          CUSTOM_MESSAGE.YOUR_PROFIT_LIMIT_EXPIRE
        );
      }
    } else if (betType === "session") {
      betExp = await currantBet(body, userId);
      const lastProfit = await getMytotalProfit(matchId, betType, selection);

      if (
        sportInfo?.max_profit_limit?.fancy !== 0 &&
        sportInfo?.max_profit_limit?.fancy <= betExp.profit + lastProfit
      ) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          CUSTOM_MESSAGE.YOUR_PROFIT_LIMIT_EXPIRE
        );
      }
      console.log("goining to set key in redis : setValueInKey");
      await redis.setValueInKey(
        `${FANCY_WINNER}:${sportInfo.gameId}:${sportInfo.marketId}`,
        { date: new Date() }
      );

      // console.log("placeBet : FANCY_WINNER_SELECTION : ", FANCY_WINNER_SELECTION, selection);
      // const isAvailableKey = await redis.checkKeyIsVailable(
      //   FANCY_WINNER_SELECTION,
      //   selection
      // );
      // console.log("placeBet : isAvailableKey : ", isAvailableKey);

      // if (!isAvailableKey) {
      //   await redis.lPush(FANCY_WINNER_SELECTION, selection);
      // }
    } else {
      betExp = await currantBetPremium(body, userId);
      const lastProfit = await getMytotalProfit(matchId, betType, selection);

      if (
        sportInfo?.max_profit_limit?.premium !== 0 &&
        sportInfo?.max_profit_limit?.premium <= betExp.profit + lastProfit
      ) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          CUSTOM_MESSAGE.YOUR_PROFIT_LIMIT_EXPIRE
        );
      }
    }

    console.log("place bet ::  userInfo.balance :::: ", userInfo.balance);
    console.log("place bet ::  betExp :::: ", betExp);
    const { newExp, oldExp } = betExp;
    console.log("place bet ::  newExp :::: ", newExp);
    console.log("place bet ::  oldExp :::: ", oldExp);
    const userNewBalance = userInfo.balance + oldExp - newExp;
    if (userNewBalance < 0) {
      // Check for user are have bet amount or not
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        CUSTOM_MESSAGE.YOU_DONT_HAVE_BALANCE
      );
    }
    // Guard: only convert matchId to ObjectId if it is a valid ObjectId string
    const matchIdQuery = mongo.isValidObjectId(matchId)
      ? mongo.ObjectId(matchId)
      : matchId;

    const findLastBet = await mongo.bettingApp
      .model(mongo.models.betsHistory)
      .findOne({
        query: { userId, matchId: matchIdQuery },
        sort: {
          createdAt: -1,
        },
        select: {
          createdAt: 1,
        },
      });
    // logic for cheat bet
    if (findLastBet) {
      const betDate = new Date(findLastBet.createdAt);
      const currantDate = new Date();

      const differenceInMilliseconds = currantDate - betDate;
      const isLessThanOneMinute = differenceInMilliseconds < 60 * 1000;
      if (isLessThanOneMinute) {
        document.isCheat = true;
      }
    }
    console.log("place bet ::  userNewBalance :::: ", userNewBalance);
    const betsHistory = await mongo.bettingApp
      .model(mongo.models.betsHistory)
      .insertOne({
        document,
      });

    console.log("place bet ::  betsHistory :::: ", betsHistory);
    await mongo.bettingApp.model(mongo.models.users).updateOne({
      query,
      update: {
        $inc: {
          balance: oldExp,
          exposure: -oldExp,
        },
      },
    });
    await mongo.bettingApp.model(mongo.models.users).updateOne({
      query,
      update: {
        $inc: {
          balance: -newExp,
          exposure: newExp,
        },
      },
    });
    console.log("place bet ::  user update done :::: ");
    sendUpdateBalanceEvent(userId, "");
    console.log("place bet ::  send update balance :::: ");

    if (
      (betType === "odds" || betType === "bookMark") &&
      sportInfo.winnerSelection.length === 0
    ) {
      console.log(
        "place bet ::  update winnerSelection :::: ",
        winnerSelection
      );
      // Guard: only update if it's a real DB doc (ObjectId), not a virtual FastOdds event
      if (mongo.isValidObjectId(matchId)) {
        await mongo.bettingApp.model(mongo.models.sports).updateOne({
          query: { _id: mongo.ObjectId(matchId) },
          update: {
            $set: {
              winnerSelection,
            },
          },
        });
      }
    }
    console.log("place bet ::  send response :::: ", betsHistory);

    betsHistory.msg = "bet place successfully!";

    return betsHistory;
  } catch (error) {
    console.log("placeBet : user : error : ", error, body, userId);
    throw error;
    // throw new ApiError(
    //   httpStatus.BAD_REQUEST,
    //   CUSTOM_MESSAGE.YOUR_TENNIS_BLOCKED
    // );
  } finally {
    console.log("place bet ::  release lock :::: ");
    if (getLock && userLock) {
      await getLock.release(userLock);
    }
  }
}

module.exports = {
  payload,
  handler,
  auth: true,
};
