const joi = require("joi");
const mongo = require("../../../config/mongodb");
const { getDate } = require("../../../utils/comman/date");
const { SPORT_TYPE } = require("../../../constants");

const payload = {
  body: joi.object().keys({
    type: joi
      .string()
      .valid(
        SPORT_TYPE.CRICKET,
        SPORT_TYPE.SOCCER,
        SPORT_TYPE.TENNIS,
        SPORT_TYPE.ESOCCER,
        SPORT_TYPE.BASKETBALL,
        "all"
      )
      .required(),
  }),
};

async function handler({ body, user }) {
  const { type } = body;
  const todayDate = await getDate("today");
  const query = {
    winner: "",
    deleted: false,
    startDate: { $gt: todayDate.startDate },
  };

  if (type !== "all") {
    query.type = type;
  }

  const sportLeageName = await mongo.bettingApp
    .model(mongo.models.sports)
    .distinct({
      field: "Turnament",
      query,
    });

  const sendObject = {
    msg: "Turnament Leage.",
    sportLeageName,
  };
  return sendObject;
}

module.exports = {
  payload,
  handler,
  auth: false,
};
