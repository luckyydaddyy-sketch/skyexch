const joi = require("joi");
const mongo = require("../../../../config/mongodb");
const {
  getStartEndDateTime,
  getDate,
} = require("../../../../utils/comman/date");
const { casinoMatchHistoryFilter } = require("../../../utils/filterData");

const payload = {
  body: joi.object().keys({
    id: joi.string().required(), // user id
    bet: joi.string().valid("active", "history").required(),
    betStatus: joi.string().optional(),
    betType: joi
      .string()
      .valid("exchange", "sportsBook", "bookMark", "binary", "casino", "awcCasinoBet")
      .required(),
    filter: joi.string().valid("all", "date", "today", "yesterday").optional(),
    to: joi.string().optional(),
    from: joi.string().optional(),
  }),
};

async function handler({ body, user }) {
  const { userId } = user;
  const { id, bet, betStatus, betType, filter, to, from } = body;

  let query = {
    userObjectId: id,
    isMatchComplete : bet === "history"
  };

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
  }

  
  let betsHistory = await mongo.bettingApp
    .model(mongo.models.casinoMatchHistory)
    .find({
      query,
      sort:{createdAt:-1},
      limit:100
    });
  console.log("casino :: betsHistory ::: ", betsHistory);
  betsHistory = await casinoMatchHistoryFilter(betsHistory);
  console.log("casino :: betsHistory ::: after :::: ", betsHistory);

  betsHistory.msg = "casino bet history.";

  return betsHistory;
}

module.exports = {
  payload,
  handler,
  auth: true,
};
