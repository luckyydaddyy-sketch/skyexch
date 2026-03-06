const joi = require("joi");
const mongo = require("../../../config/mongodb");
const { getDate } = require("../../../utils/comman/date");
const { getChennelId } = require("../../../config/sportsAPI");

const payload = {
  body: joi.object().keys({
    gameId: joi.number().required(),
  }),
};

async function handler({ body, user }) {
  const { gameId } = body;
 const data = await getChennelId(Number(gameId))

  const sendObject = {
    msg: "chennal ID.",
    // ChannelId : data?.Channel,
    ChannelId : data?.sportradarApiSiteEventId,
  };
  return sendObject;
}

module.exports = {
  payload,
  handler,
  auth: false,
};
