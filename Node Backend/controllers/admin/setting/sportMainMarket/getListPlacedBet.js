const joi = require("joi");
const mongo = require("../../../../config/mongodb");
const { SPORT_TYPE } = require("../../../../constants");

const payload = {
  body: joi.object().keys({
    search: joi.string().optional(),
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
    page: joi.string().required(),
    limit: joi.string().required(),
  }),
};

async function handler({ body, user }) {
  const { userId } = user;
  const { search, type, page, limit } = body;

  console.log("sportMarketPlacedBet :: call : ", body);
  const query = {
    type,
    gameStatus: { $ne: "completed" },
  };

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { marketId: { $regex: search, $options: "i" } },
    ];

    if (/^\d+$/.test(search)) {
      query.$or.push({ gameId: Number(search) });
    }
  }

  const queryBetQuery = {
    type,
    betType: { $in: ["odds", "bookMark"] },
    betStatus: { $ne: "completed" },
    deleted: false,
  };

  const sportIds = await mongo.bettingApp
    .model(mongo.models.betsHistory)
    .distinct({
      query: queryBetQuery,
      field: "matchId",
    });

  console.log("query :: ", query);
  const sports = await mongo.bettingApp.model(mongo.models.sports).paginate({
    query: {
      _id: { $in: sportIds },
    },
    page,
    limit,
    select: {
      name: 1,
      openDate: 1,
      startDate: 1,
      activeStatus: 1,
      oddsLimit: 1,
      bet_odds_limit: 1,
      bet_bookmaker_limit: 1,
      bet_fancy_limit: 1,
      bet_premium_limit: 1,
      winner: 1,
      winnerSelection: 1,
      gameId: 1,
      marketId: 1,
    },
  });

  sports.msg = "sport List!";

  return sports;
}

module.exports = {
  payload,
  handler,
  auth: true,
};
