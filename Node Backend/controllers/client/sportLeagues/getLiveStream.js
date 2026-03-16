const joi = require("joi");
const { getFastGLive } = require("../../../config/sportsAPI");

const payload = {
  body: joi.object().keys({
    matchId: joi.alternatives().try(joi.number(), joi.string()).required(),
  }),
};

async function handler({ body, user }) {
  const { matchId } = body;
  const data = await getFastGLive(matchId);

  const sendObject = {
    msg: "Live stream data.",
    liveStream: data || null,
  };
  return sendObject;
}

module.exports = {
  payload,
  handler,
  auth: false,
};
