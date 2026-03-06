const joi = require("joi");
const mongo = require("../../../config/mongodb");
const payload = {
  body: joi.object().keys({
    id: joi.string().optional(),
  }),
};

async function handler({ body, user }) {
  const { id } = body;
  const { userId } = user;

  const inboxsCount = await mongo.bettingApp.model(mongo.models.inboxs).countDocuments({
    query: {
      userId,
      isRead: false
    },
  });
  

  const sendObject = {
    msg: "Get Inbox Count.",
    inboxsCount,
  };

  return sendObject; // Return response
}

module.exports = {
  payload,
  handler,
  auth: true,
};
