const joi = require("joi");
const mongo = require("../../../config/mongodb");
const { getDate } = require("../../../utils/comman/date");

const payload = {
  body: joi.object().keys({
    search: joi.string().allow("").required(),
  }),
};

async function handler({ body, user }) {
  const { search } = body;

  const { endDate, startDate } = getDate("yesterday");
  const query = {
    name: { $regex: search, $options: "i" },
    winner: "",
    status: true,
    startDate: { $gt: endDate },
  };

  let sportList = await mongo.bettingApp.model(mongo.models.sports).find({
    query,
    select: {
      name: 1,
      gameId: 1,
      marketId: 1,
    },
  });

  sportList.msg = "match Search.";

  return sportList;
}

module.exports = {
  payload,
  handler,
};
