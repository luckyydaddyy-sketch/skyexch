const joi = require("joi");
const mongo = require("../../../../config/mongodb");
const { SPORT_TYPE } = require("../../../../constants");
const { getDate, getStartEndDateTime } = require("../../../../utils/comman/date");

const payload = {
  body: joi.object().keys({
    search: joi.string().optional(),
    date: joi.string().optional(),
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
    isInactive: joi.boolean().optional(),
    isSuspend: joi.string().optional(),
  }),
};

async function handler({ body, user }) {
  const { userId } = user;
  const { search, type, page, limit, isInactive, isSuspend, date } = body;

  // const playerIds = await mongo.bettingApp.model(mongo.models.users).distinct({
  //   field: "_id",
  //   query: {
  //     whoAdd: userId,
  //   },
  // });
  // const {endDate, startDate} = getDate('2');

  const query = {
    type,
    gameStatus: { $ne: "completed" },
    // startDate: {
    //   $gte: startDate,
    //   $lte: endDate,
    // }
  };

  if(date && date !== ""){
    const {endDate : eDate, startDate: sDate} = getStartEndDateTime(date, date);
    query.startDate = {
      $gte: sDate,
      $lte: eDate,
    }
  }
  if (isInactive) {
    query[`activeStatus.status`] = false
    // query.activeStatus = {
    //   status: false,
    // };
  } else if (isSuspend) {
    query[`suspend.odds`] = true
    // query.suspend = {
    //   odds: true,
    // };
  } else {
    query[`activeStatus.status`] = true
    query[`suspend.odds`] = false
    // query.activeStatus = {
    //   status: true,
    // };
    // query.suspend = {
    //   odds: false,
    // };
  }
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { marketId: { $regex: search, $options: "i" } },
    ];

    if (/^\d+$/.test(search)) {
      query.$or.push({ gameId: Number(search) });
    }
  }

  console.log("query :: ", query);
  const sports = await mongo.bettingApp.model(mongo.models.sports).paginate({
    query,
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
      max_profit_limit: 1,
      winner: 1,
      winnerSelection: 1,
      type: 1,
      gameId: 1,
      marketId: 1,
      suspend: 1,
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
