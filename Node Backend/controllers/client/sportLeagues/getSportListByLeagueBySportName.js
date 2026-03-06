const joi = require("joi");
const mongo = require("../../../config/mongodb");
const { getDate } = require("../../../utils/comman/date");

const payload = {
  body: joi.object().keys({
    gameId: joi.string().required(),
  }),
};

async function handler({ body, user }) {
  const { gameId } = body;

  const turnamentDetail = await mongo.bettingApp
    .model(mongo.models.sports)
    .findOne({
      query: {
        gameId,
      },
      select: {
        name: 1,
        _id: 1,
        marketId: 1,
        gameId: 1,
        Turnament: 1,
      },
    });

  const todayDate = await getDate("today");
  const query = {
    Turnament: turnamentDetail?.Turnament,
    winner: "",
    deleted: false,
    startDate: { $gt: todayDate.startDate },
    gameId: { $ne: gameId },
  };

  const sportDetail = await mongo.bettingApp.model(mongo.models.sports).find({
    query,
    select: {
      name: 1,
      _id: 1,
      marketId: 1,
      gameId: 1,
      type: 1,
    },
  });
  const sendObject = {
    msg: "Sport in Turnament Leage by sport.",
    sportDetail,
  };
  return sendObject;
}

module.exports = {
  payload,
  handler,
  auth: false,
};
