const joi = require("joi");
const mongo = require("../../../../config/mongodb");
const {
  getStartEndDateTime,
  getDate,
} = require("../../../../utils/comman/date");
const { betsHistoryDataFiter } = require("../../../utils/filterData");
const { SPORT_TYPE } = require("../../../../constants");

const payload = {
  body: joi.object().keys({
    id: joi.string().required(), // user id
    bet: joi.string().valid("active", "history").required(),
    betStatus: joi.string().optional(),
    betType: joi
      .string()
      .valid("exchange", "sportsBook", "bookMark", "binary", "fancybet", "all")
      .required(),
    filter: joi
      .string()
      .valid("all", "date", "today", "yesterday", "isMatched", "UnMatched")
      .optional(),
    to: joi.string().optional(),
    from: joi.string().optional(),
  }),
};

async function handler({ body, user }) {
  const { userId } = user;
  const { id, bet, betStatus, betType, filter, to, from } = body;

  let query = {};
  if (bet === "active") {
    query = {
      userId: id,
      betStatus: { $in: ["running", "pending"] },
      deleted: false
    };
  } else {
    query = {
      userId: id,
      betStatus: "completed",
      deleted: false
    };
  }

  if (betType && betType === "bookMark") {
    query.betType = "bookMark";
  } else if (betType && betType === "exchange") {
    query.betType = "odds";
  } else if (betType && betType === "fancybet") {
    query.betType = "session";
  } else if (betType && betType === "sportsBook") {
    query.betType = "session";
  } else if (betType && betType === "binary") {
    query.betType = "premium";
  }

  if (filter && filter === "date" && to && from) {
    const { endDate, startDate } = getStartEndDateTime(to, from);
    query.createdAt = {
      $gte: startDate,
      $lte: endDate,
    };
  } else if ((filter && filter === "today") || filter === "yesterday") {
    const { endDate, startDate } = getDate(filter);
    query.createdAt = {
      $gte: startDate,
      $lte: endDate,
    };
  } else if (filter && filter === "isMatched") {
    query.isMatched = true;
  } else if (filter && filter === "UnMatched") {
    query.isMatched = false;
  }

  let betsHistory = await mongo.bettingApp
    .model(mongo.models.betsHistory)
    .find({
      query,
      select: {
        type: 1,
        matchId: 1,
        betType: 1,
        selection: 1,
        betSide: 1,
        betId: 1,
        createdAt: 1,
        stake: 1,
        oddsUp: 1,
        oddsDown: 1,
        tType: 1,
        profit: 1,
        exposure: 1,
        subSelection: 1,
        isMatched: 1,
      },
      sort: { createdAt: -1 },
      limit:100
    });

  betsHistory = await betsHistoryDataFiter(betsHistory);
  const bets = [];
  for await (const bet of betsHistory) {
    if (
      bet.type === SPORT_TYPE.CRICKET ||
      bet.type === SPORT_TYPE.SOCCER ||
      bet.type === SPORT_TYPE.TENNIS ||
      bet.type === SPORT_TYPE.ESOCCER ||
      bet.type === SPORT_TYPE.BASKETBALL
    ) {
      let sport = await mongo.bettingApp.model(mongo.models.sports).findOne({
        query: { _id: bet.matchId },
        select: {
          name: 1,
        },
      });
      bet.name = sport.name;
      bets.push(bet);
    } else if (bet.type === "Casino") {
    }
  }

  bets.msg = "bet history.";

  return bets;
}

module.exports = {
  payload,
  handler,
  auth: true,
};
