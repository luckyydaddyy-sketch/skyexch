const joi = require("joi");

const mongo = require("../../../../config/mongodb");
const { USER_LEVEL_NEW } = require("../../../../constants");

const payload = {
  body: joi.object().keys({
    // id : joi.string().required()
  }),
};

async function handler({ user, body }) {
  const { userId, role } = user;

  const query = {
    agent_level: USER_LEVEL_NEW.SUO,
    whoAdd: mongo.ObjectId(userId),
  };

  if (role === USER_LEVEL_NEW.SUO) {
    query.agent_level = USER_LEVEL_NEW.WL;
  }
  const adminInfo = await mongo.bettingApp.model(mongo.models.admins).find({
    query,
    select: {
      firstName: 1,
      user_name: 1,
      _id: 1,
    },
  });

  adminInfo.msg = "agent List!";

  return adminInfo;
}

module.exports = {
  payload,
  handler,
  auth: true,
};
