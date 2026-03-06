const joi = require("joi");
const mongo = require("../../../config/mongodb");
const { getStartEndDateTime, getDate } = require("../../../utils/comman/date");
const { betsHistoryDataFiter } = require("../../utils/filterData");
const { SPORT_TYPE } = require("../../../constants");

const payload = {
  body: joi.object().keys({
    betType: joi
      .string()
      .valid("exchange", "sportsBook", "bookMaker", "fancybet")
      .required(),
    filter: joi
      .string()
      .valid("all", "date", "today", "yesterday", "7")
      .optional(),
    to: joi.string().optional(),
    from: joi.string().optional(),
  }),
};

async function handler({ body, user }) {
  const { userId } = user;
  const { betType, filter, to, from } = body;

  let query = {
    userId,
    betStatus: "completed",
    type: {
      $in: [
        SPORT_TYPE.CRICKET,
        SPORT_TYPE.SOCCER,
        SPORT_TYPE.TENNIS,
        SPORT_TYPE.ESOCCER,
        SPORT_TYPE.BASKETBALL,
      ],
    },
  };

  if (betType && betType === "bookMaker") {
    query.betType = "bookMark";
  } else if (betType && betType === "exchange") {
    query.betType = "odds";
  } else if (betType && betType === "fancybet") {
    query.betType = "session";
  } else {
    query.betType = "session";
  }

  if (filter && filter === "date" && to && from) {
    const { endDate, startDate } = getStartEndDateTime(to, from);
    query.createdAt = {
      $gte: startDate,
      $lte: endDate,
    };
  } else if (
    (filter && filter === "today") ||
    filter === "yesterday" ||
    filter === "7"
  ) {
    const { endDate, startDate } = getDate(filter);
    query.createdAt = {
      $gte: startDate,
      $lte: endDate,
    };
  }

  const userDetail = await mongo.bettingApp.model(mongo.models.users).find({
    query: {
      _id: userId,
    },
    select: {
      commission: 1,
    },
  });

  const matchIDs = await mongo.bettingApp
    .model(mongo.models.betsHistory)
    .distinct({ query, field: "matchId" });

  const bets = [];
  for await (const matchId of matchIDs) {
    let backTotal = 0;
    let layTotal = 0;
    let marketTotal = 0;
    let commission = 0;
    let total = 0;
    let betsHistory = await mongo.bettingApp
      .model(mongo.models.betsHistory)
      .find({
        query: {
          ...query,
          matchId,
        },
        select: {
          type: 1,
          //   matchId: 1,
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
        },
      });
    betsHistory = await betsHistoryDataFiter(betsHistory);
    for await (const bet of betsHistory) {
      let amount = 0;
      if (["bookMark", "odds", "premium", "session"].includes(bet.betType)) {
        if (bet.betSide === "back") {
          if (bet.tType === "win") {
            backTotal += bet.profit;
            amount += bet.profit;
            // marketTotal += bet.profit
            // total += bet.profit
          } else {
            backTotal -= bet.betPlaced;
            amount -= bet.betPlaced;
            // marketTotal -= bet.betPlaced
            // total -= bet.betPlaced
          }
        } else if (bet.betSide === "lay") {
          if (bet.tType === "win") {
            layTotal += bet.betPlaced;
            amount += bet.betPlaced;
            // marketTotal += bet.betPlaced
            // total += bet.betPlaced
          } else {
            layTotal -= bet.profit;
            amount -= bet.profit;
            // marketTotal -= bet.profit
            // total -= bet.profit
          }
        }

        if (amount > 0 && bet.betType === "odds") {
          commission += (amount * userDetail.commission) / 100;
        }
      }
      marketTotal = backTotal + layTotal;
      total = marketTotal - commission;
    }

    const sportDetail = await mongo.bettingApp.model(mongo.models.sports).find({
      query: {
        _id: matchId,
      },
      select: {
        name: 1,
        openDate: 1,
        type: 1,
      },
    });

    const betData = {
      backTotal,
      layTotal,
      marketTotal,
      commission,
      total,
      betsHistory,
      sportDetail,
    };
    bets.push(betData);
  }

  bets.msg = "bet profit/lost.";

  return bets;
}

module.exports = {
  payload,
  handler,
  auth: true,
};
