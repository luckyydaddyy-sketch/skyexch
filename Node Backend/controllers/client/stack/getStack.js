const joi = require("joi");
const mongo = require("../../../config/mongodb");
const payload = {
  body: joi.object().keys({}),
};

async function handler({ user }) {
  const { userId } = user;
  let stackInfo = await mongo.bettingApp.model(mongo.models.stacks).findOne({
    query: {
      userId,
    },
  });

  const sendObject = {
    stackInfo: stackInfo ? stackInfo : {},
    msg: "user stack info.",
  };

  return sendObject; // Return response
}

module.exports = {
  payload,
  handler,
  auth: true,
};
