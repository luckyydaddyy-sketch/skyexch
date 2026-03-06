const joi = require("joi");
const moment = require("moment-timezone");
const mongo = require("../../../config/mongodb");
const CUSTOM_MESSAGE = require("../../../utils/message");
const { SPORT_TYPE } = require("../../../constants");

const payload = {
  body: joi.object().keys({
    id: joi.string().required(),
    type: joi.string().optional(),
  }),
};
const maxProfit = {
  odds: 2500,
  bookmaker: 5000,
  fancy: 3300,
  premium: 100,
};
async function handler({ body }) {
  const { id, type } = body;

  const findQuery = {
    status: false,
    type,
  };
  const query = { type };
  if (id !== "All") {
    query._id = mongo.ObjectId(id);
    findQuery._id = mongo.ObjectId(id);
  }
  console.log("sport-leage ::: findQuery : ", findQuery);
  console.log("sport-leage ::: query : ", query);
  const matchDetail = await mongo.bettingApp
    .model(mongo.models.sportsLeage)
    .find({
      query: findQuery,
    });

  console.log("sport-leage ::: matchDetail : ", matchDetail);

  if (matchDetail.length > 0) {
    await mongo.bettingApp.model(mongo.models.sportsLeage).updateMany({
      query,
      update: {
        status: true,
      },
    });
  }

  const sportDefaultLimit = await mongo.bettingApp
    .model(mongo.models.deafultSetting)
    .findOne({});

  const websitesInfo = await mongo.bettingApp
    .model(mongo.models.websites)
    .findOne({});
  console.log("sport-leage ::: matchDetail : ", matchDetail);
  for await (const sport of matchDetail) {
    const match = await mongo.bettingApp.model(mongo.models.sports).findOne({
      query: {
        _id: sport._id,
      },
    });

    const sportMinMax = Object.fromEntries(
      Object.entries(sportDefaultLimit[sport.type]).map(([key, value]) => [
        key,
        { min: value.min, max: value.max },
      ])
    );

    const newMaxProfit = {
      odds: sportDefaultLimit[sport.type].bet_odds_limit.maxProfit,
      bookmaker: sportDefaultLimit[sport.type].bet_bookmaker_limit.maxProfit,
      fancy: sportDefaultLimit[sport.type]?.bet_fancy_limit
        ? sportDefaultLimit[sport.type].bet_fancy_limit.maxProfit
        : 0,
      premium: sportDefaultLimit[sport.type].bet_premium_limit.maxProfit,
    };

    if (!match) {
      console.log("match fount");
      if (
        sport.type === SPORT_TYPE.CRICKET &&
        ((websitesInfo && websitesInfo.cricket.oddsLimit) || sportMinMax)
      ) {
        sport.oddsLimit = sportMinMax
          ? sportMinMax.oddsLimit
          : websitesInfo.cricket.oddsLimit;
        sport.bet_odds_limit = sportMinMax
          ? sportMinMax.bet_odds_limit
          : websitesInfo.cricket.bet_odds_limit;
        sport.bet_bookmaker_limit = sportMinMax
          ? sportMinMax.bet_bookmaker_limit
          : websitesInfo.cricket.bet_bookmaker_limit;
        sport.bet_fancy_limit = sportMinMax?.bet_fancy_limit
          ? sportMinMax.bet_fancy_limit
          : websitesInfo.cricket.bet_fancy_limit;
        sport.bet_premium_limit = sportMinMax
          ? sportMinMax.bet_premium_limit
          : websitesInfo.cricket.bet_premium_limit;
        sport.max_profit_limit = newMaxProfit ? newMaxProfit : maxProfit;
      } else if (
        sport.type === SPORT_TYPE.SOCCER &&
        ((websitesInfo && websitesInfo.soccer.oddsLimit) || sportMinMax)
      ) {
        sport.oddsLimit = sportMinMax
          ? sportMinMax.oddsLimit
          : websitesInfo.soccer.oddsLimit;
        sport.bet_odds_limit = sportMinMax
          ? sportMinMax.bet_odds_limit
          : websitesInfo.soccer.bet_odds_limit;
        sport.bet_bookmaker_limit = sportMinMax
          ? sportMinMax.bet_bookmaker_limit
          : websitesInfo.soccer.bet_bookmaker_limit;
        sport.bet_premium_limit = sportMinMax
          ? sportMinMax.bet_premium_limit
          : typeof websitesInfo.soccer.bet_premium_limit === "undefined"
          ? { min: 1, max: 10 }
          : websitesInfo.soccer.bet_premium_limit;
        sport.bet_fancy_limit = sportMinMax
          ? sportMinMax.bet_fancy_limit
          : { min: 1, max: 10 };
        sport.max_profit_limit = newMaxProfit ? newMaxProfit : maxProfit;
      } else if (
        sport.type === SPORT_TYPE.TENNIS &&
        ((websitesInfo && websitesInfo.tennis.oddsLimit) || sportMinMax)
      ) {
        sport.oddsLimit = sportMinMax
          ? sportMinMax.oddsLimit
          : websitesInfo.tennis.oddsLimit;
        sport.bet_odds_limit = sportMinMax
          ? sportMinMax.bet_odds_limit
          : websitesInfo.tennis.bet_odds_limit;
        sport.bet_bookmaker_limit = sportMinMax
          ? sportMinMax.bet_bookmaker_limit
          : websitesInfo.tennis.bet_bookmaker_limit;
        sport.bet_premium_limit = sportMinMax
          ? sportMinMax.bet_premium_limit
          : typeof websitesInfo.tennis.bet_premium_limit === "undefined"
          ? { min: 1, max: 10 }
          : websitesInfo.tennis.bet_premium_limit;
        sport.bet_fancy_limit = sportMinMax
          ? sportMinMax.bet_fancy_limit
          : { min: 1, max: 10 };
        sport.max_profit_limit = newMaxProfit ? newMaxProfit : maxProfit;
      } else if (
        sport.type === SPORT_TYPE.ESOCCER &&
        ((websitesInfo && websitesInfo?.esoccer?.oddsLimit) || sportMinMax)
      ) {
        sport.oddsLimit = sportMinMax
          ? sportMinMax.oddsLimit
          : websitesInfo?.esoccer?.oddsLimit;
        sport.bet_odds_limit = sportMinMax
          ? sportMinMax.bet_odds_limit
          : websitesInfo?.esoccer?.bet_odds_limit;
        sport.bet_bookmaker_limit = sportMinMax
          ? sportMinMax.bet_bookmaker_limit
          : websitesInfo?.esoccer?.bet_bookmaker_limit;
        sport.bet_premium_limit = sportMinMax
          ? sportMinMax.bet_premium_limit
          : typeof websitesInfo?.esoccer?.bet_premium_limit === "undefined"
          ? { min: 1, max: 10 }
          : websitesInfo?.esoccer?.bet_premium_limit;
        sport.bet_fancy_limit = sportMinMax
          ? sportMinMax.bet_fancy_limit
          : { min: 1, max: 10 };
        sport.max_profit_limit = newMaxProfit ? newMaxProfit : maxProfit;
      } else if (
        sport.type === SPORT_TYPE.BASKETBALL &&
        ((websitesInfo && websitesInfo?.basketball?.oddsLimit) || sportMinMax)
      ) {
        sport.oddsLimit = sportMinMax
          ? sportMinMax.oddsLimit
          : websitesInfo?.basketball?.oddsLimit;
        sport.bet_odds_limit = sportMinMax
          ? sportMinMax.bet_odds_limit
          : websitesInfo?.basketball?.bet_odds_limit;
        sport.bet_bookmaker_limit = sportMinMax
          ? sportMinMax.bet_bookmaker_limit
          : websitesInfo?.basketball?.bet_bookmaker_limit;
        sport.bet_premium_limit = sportMinMax
          ? sportMinMax.bet_premium_limit
          : typeof websitesInfo?.basketball?.bet_premium_limit === "undefined"
          ? { min: 1, max: 10 }
          : websitesInfo?.basketball?.bet_premium_limit;
        sport.bet_fancy_limit = sportMinMax
          ? sportMinMax.bet_fancy_limit
          : { min: 1, max: 10 };
        sport.max_profit_limit = newMaxProfit ? newMaxProfit : maxProfit;
      }
      sport.startDate = new Date(moment(sport.startDate).tz("Asia/Dhaka"));
      sport.status = true;
      await mongo.bettingApp.model(mongo.models.sports).insertOne({
        document: sport,
      });
    } else {
      console.log("match fount");
      const update = {
        status: true,
        name: sport.name,
        openDate: sport.openDate,
        startDate: new Date(moment(sport.startDate).tz("Asia/Dhaka")),
        // type: sport.type,
        // gameId: sport.gameId,
        // marketId: sport.marketId,
        // activeStatus: sport.activeStatus,
        // suspend: sport.suspend,
        // oddsLimit: sport.oddsLimit,
        // bet_odds_limit: sport.bet_odds_limit,
        // bet_bookmaker_limit: sport.bet_bookmaker_limit,
        // bet_fancy_limit: sport.bet_fancy_limit,
        // bet_premium_limit: sport.bet_premium_limit,
        winner: match.openDate === sport.openDate ? match.winner : "",
        winnerSelection:
          match.openDate === sport.openDate ? match.winnerSelection : [],
        gameStatus:
          match.openDate === sport.openDate ? match.gameStatus : "pending",
        max_profit_limit: maxProfit,
      };

      await mongo.bettingApp.model(mongo.models.sports).updateOne({
        query: {
          _id: match._id,
        },
        update,
      });
    }
  }

  const data = {
    msg: CUSTOM_MESSAGE.DATA_UPDATE_SUCESSFULLY,
  };

  return data;
}

module.exports = {
  payload,
  handler,
  auth: true,
};
