const joi = require("joi");
const { getScoreBoardId } = require("../../../config/sportsAPI");

const payload = {
  body: joi.object().keys({
    gameId: joi
      .number()
      .required(),
  }),
};

async function handler({ body }) {
  const { gameId } = body;
  
  const scoreIdInfo = await getScoreBoardId(gameId);
 
  const sendObject = {
    msg: "get scoreBoard ID",
    scoreIdInfo,
  };

  return sendObject; // Return response
}

module.exports = {
  payload,
  handler,
  auth: false,
};
