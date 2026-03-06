const joi = require("joi");
const mongo = require("../../../config/mongodb");
const { SPORT_TYPE } = require("../../../constants");
const { getDate, getStartEndDateTime } = require("../../../utils/comman/date");

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
        SPORT_TYPE.BASKETBALL,
        "All",
        "cricket/fancy",
        "casino"
      )
      .required(),
    page: joi.string().required(),
    limit: joi.string().required(),
    filter: joi.string().valid("all", "today", "yesterday").optional(),
    to: joi.string().optional(),
    from: joi.string().optional(),
  }),
};

async function handler({ body, user }) {
  const { search, type, page, limit, to, from, filter } = body;
  const { userId } = user;

  const playerIds = await mongo.bettingApp.model(mongo.models.users).distinct({
    field: "_id",
    query: {
      whoAdd: userId,
    },
  });

  const query = {
    userId: { $in: playerIds },
    winner: { $ne: "" },
    deleted: false,
    // betStatus: "completed",
  };

  

  if(type && type !== "All"){
    query.type = type;
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
  const sportIds = await mongo.bettingApp
    .model(mongo.models.betsHistory)
    .distinct({
      query,
      field: "matchId",
    });
    const sportQuery = {
      _id: { $in: sportIds },
    }

    if (filter && filter !== "all") {
      const { endDate, startDate } = getDate(filter);
      sportQuery.startDate = {
        $gte: startDate,
        $lte: endDate,
      };
    } else if (to && from) {
      const { endDate, startDate } = getStartEndDateTime(from, to);
      sportQuery.startDate = {
        $gte: startDate,
        $lte: endDate,
      };
    }

  const sports = await mongo.bettingApp.model(mongo.models.sports).paginate({
    query: sportQuery,
    page,
    limit,
    select: {
      _id: 1,
      name: 1,
      openDate: 1,
      startDate: 1,
    },
    sort: {updatedAt : -1}
  });

  sports.msg = "Match List For History!";

  return sports;
}

module.exports = {
  payload,
  handler,
  auth: true,
};
