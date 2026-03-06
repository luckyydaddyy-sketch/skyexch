const joi = require("joi");
const mongo = require("../../../config/mongodb");
const { USER_LEVEL_NEW } = require("../../../constants");

const payload = {
  body: joi.object().keys({
    matchId: joi.string().required(),
  }),
};

async function handler({ body, user }) {
  const { userId,  } = user;
  const { matchId } = body;
  const query = {
    userId,
    matchId
  }
  
  console.log("getBlock match : query: ", query);
  
  const blockMatchDetail = await mongo.bettingApp
    .model(mongo.models.blockMatch)
    .findOne({
      query,
    });
  let blockMatchSend = {
    blockMatchDetail: blockMatchDetail ? blockMatchDetail : {},
  };

  blockMatchSend.msg = "block match contant.";

  return blockMatchSend;
}

module.exports = {
  payload,
  handler,
  auth: true,
};
