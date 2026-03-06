const joi = require("joi");

const mongo = require("../../../config/mongodb");

const payload = {
  body: joi.object().keys({}),
};

async function handler({ body, user }) {
  const { userId } = user;

  const query = {
    // whoAdd: userId, // all user
    admin: userId,
  };

  const userInfo = await mongo.bettingApp.model(mongo.models.users).find({
    query,
    select: {
      user_name: 1,
      firstName: 1,
      lastName: 1,
    },
  });
  const agentInfo = await mongo.bettingApp.model(mongo.models.admins).find({
    query,
    select: {
      user_name: 1,
      firstName: 1,
      lastName: 1,
    },
  });

  const sendObject = {
    userInfo: userInfo.concat(agentInfo),
    agentInfo,
    msg: "user list!",
  };

  return sendObject;
}

module.exports = {
  payload,
  handler,
  auth: true,
};
