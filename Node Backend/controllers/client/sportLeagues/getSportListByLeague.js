const joi = require("joi");
const mongo = require("../../../config/mongodb");
const { getDate } = require("../../../utils/comman/date");

const payload = {
  body: joi.object().keys({
    name: joi.string().required(),
  }),
};

async function handler({ body, user }) {
  const { name } = body;
  const todayDate = await getDate("today");
  const query = {
    Turnament: name,
    winner: "",
    deleted: false,
    startDate: { $gt: todayDate.startDate },
  };

  const sportDetail = await mongo.bettingApp.model(mongo.models.sports).find({
    query,
    select: {
      name: 1,
      _id: 1,
      marketId: 1,
      gameId: 1,
    },
  });
  const sendObject = {
    msg: "Sport in Turnament Leage.",
    sportDetail,
  };
  return sendObject;
}

module.exports = {
  payload,
  handler,
  auth: false,
};
