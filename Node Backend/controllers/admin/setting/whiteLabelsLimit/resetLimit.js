const joi = require("joi");

const mongo = require("../../../../config/mongodb");
const { USER_LEVEL_NEW } = require("../../../../constants");

const payload = {
  body: joi.object().keys({
    id: joi.string().required(),
  }),
};

async function handler({ user, body }) {
  const { id } = body;

  const adminInfo = await mongo.bettingApp
    .model(mongo.models.admins)
    .updateOne({
      query: {
        _id: mongo.ObjectId(id),
        // agent_level: USER_LEVEL_NEW.WL,
      },
      update: {
        casinoWinLimit: 0,
        casinoWinLimitMin: 0,
        casinoUserBalance: 0,
        casinoWinings: 0,
      },
    });

  adminInfo.msg = "webSite WL limit has been reset!";

  return adminInfo;
}

module.exports = {
  payload,
  handler,
  auth: true,
};
