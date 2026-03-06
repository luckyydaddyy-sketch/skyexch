const joi = require("joi");
const mongo = require("../../../config/mongodb");

const payload = {
  body: joi.object().keys({
    matchId: joi.string().required(),
    blockAll: joi.boolean().optional(),
    blockOdds: joi.boolean().optional(),
    blockBookMaker: joi.boolean().optional(),
    blockFancy: joi.boolean().optional(),
    blockPremium: joi.boolean().optional(),
  }),
};

async function handler({ body, user }) {
  const { userId } = user;
  const {
    matchId,
    blockAll,
    blockOdds,
    blockBookMaker,
    blockFancy,
    blockPremium,
  } = body;

  const blockMatchDetail = await mongo.bettingApp
    .model(mongo.models.blockMatch)
    .findOne({
      query: {
        userId,
        matchId,
      },
    });
  let blockMatchSend = {};

  if (blockMatchDetail) {
    blockMatchSend = await mongo.bettingApp
      .model(mongo.models.blockMatch)
      .findOneAndUpdate({
        query: {
          userId,
          matchId,
        },
        update: {
          blockAll,
          blockOdds,
          blockBookMaker,
          blockFancy,
          blockPremium,
        },
      });
  } else {
    const adminDetail = await mongo.bettingApp
      .model(mongo.models.admins)
      .findOne({
        query: {
          _id: userId,
        },
        select: {
          agent: 1,
        },
      });
    const banchOfUserId = [userId, ...adminDetail.agent];
    blockMatchSend = await mongo.bettingApp
      .model(mongo.models.blockMatch)
      .insertOne({
        document: {
          userId: banchOfUserId,
          matchId,
          blockAll,
          blockOdds,
          blockBookMaker,
          blockFancy,
          blockPremium,
        },
      });
  }

  blockMatchSend.msg = "block match contant.";

  return blockMatchSend;
}

module.exports = {
  payload,
  handler,
  auth: true,
};
