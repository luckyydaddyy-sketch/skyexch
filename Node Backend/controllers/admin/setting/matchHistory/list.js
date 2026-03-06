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
        SPORT_TYPE.BASKETBALL,
        "ALL"
      )
      .required(),
    page: joi.string().required(),
    limit: joi.string().required(),
  }),
};

async function handler({ body }) {
  const { search, type, page, limit } = body;

  // const playerIds = await mongo.bettingApp.model(mongo.models.users).distinct({
  //   field: "_id",
  //   query: {
  //     whoAdd: userId,
  //   },
  // });

  const query = {
    gameStatus: "completed",
  };
  if (type !== "ALL") {
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
  const sports = await mongo.bettingApp.model(mongo.models.sports).paginate({
    query,
    page,
    limit,
    select: {
      name: 1,
      openDate: 1,
      startDate: 1,
      winner: 1,
      gameId: 1,
      type: 1,
    },
    sort: {updatedAt : -1}
  });

  sports.msg = "sport match history List!";

  return sports;
}

module.exports = {
  payload,
  handler,
  auth: true,
};
