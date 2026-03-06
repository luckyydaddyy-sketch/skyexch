const joi = require("joi");
const mongo = require("../../../../config/mongodb");

const payload = {
  body: joi.object().keys({
    search: joi.string().optional().allow(""),
    // type: joi.string().valid("cricket", "soccer", "tennis").required(),
    // page: joi.string().required(),
    // limit: joi.string().required(),
  }),
};

async function handler({ body }) {
  const { search, page, limit } = body;

  // const playerIds = await mongo.bettingApp.model(mongo.models.users).distinct({
  //   field: "_id",
  //   query: {
  //     whoAdd: userId,
  //   },
  // });

  const query = {
    gameStatus: "completed",
    winner: "cancel",
  };
  if (search && search !== "") {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { marketId: { $regex: search, $options: "i" } },
    ];

    if (/^\d+$/.test(search)) {
      query.$or.push({ gameId: Number(search) });
    }
  }
  const sports = await mongo.bettingApp.model(mongo.models.sports).find({
    query,
    // page,
    // limit,
    select: {
      name: 1,
      openDate: 1,
      startDate: 1,
      winner: 1,
      type: 1,
      gameId: 1,
      marketId: 1,
    },
    sort: {updatedAt : -1}
  });

  sports.msg = "sport cancel match history List!";

  return sports;
}

module.exports = {
  payload,
  handler,
  auth: true,
};
