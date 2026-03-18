const joi = require("joi");
const { getGLiveStream } = require("../../../config/sportsAPI");

const payload = {
  body: joi.object().keys({
    matchId: joi.alternatives().try(joi.number(), joi.string()).required(),
  }),
};

async function handler({ body, user }) {
  const { matchId } = body;
  console.log("==getLiveStream handler=> matchId:", matchId);
  const result = await getGLiveStream(matchId);
  console.log("==getLiveStream handler=> result:", JSON.stringify(result));
  const data = result?.data || null;

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
