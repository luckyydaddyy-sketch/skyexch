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

  await mongo.bettingApp.model(mongo.models.inboxs).updateOne({
    query: {
      _id: mongo.ObjectId(id),
    },
    update: {
      isRead: true,
    },
  });

  const sendObject = {
    msg: "Message is Inbox View.",
  };

  return sendObject; // Return response
}

module.exports = {
  payload,
  handler,
  auth: true,
};
