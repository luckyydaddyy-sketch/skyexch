const joi = require("joi");

const mongo = require("../../../../config/mongodb");
const { USER_LEVEL_NEW } = require("../../../../constants");

const payload = {
  body: joi.object().keys({
    id: joi.string().required(),
  }),
};

async function handler({ user, body }) {
  const { role } = user;
  const { id } = body;

  const query = {
    agent_level: USER_LEVEL_NEW.SUO,
    _id: mongo.ObjectId(id),
  };
  if (role === USER_LEVEL_NEW.SUO) {
    query.agent_level = USER_LEVEL_NEW.WL;
  }
console.log("query: ", query);

  const adminInfo = await mongo.bettingApp.model(mongo.models.admins).find({
    query,
    select: {
      casinoWinLimit: 1,
      casinoWinLimitMin: 1,
      casinoUserBalance: 1, // bet limit
      casinoWinings: 1,
      _id: 1,
    },
  });

  if (!adminInfo) {
    return {
      msg: "please create the WhiteLabels!",
    };
  }
  adminInfo.msg = "webSite WL limit!";

  return adminInfo;
}

module.exports = {
  payload,
  handler,
  auth: true,
};
