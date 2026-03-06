const mongo = require("../../../config/mongodb");

const createInbox = async (userId, title, message) => {
  const document = {
    userId,
    title,
    message,
  };

  return await mongo.bettingApp
    .model(mongo.models.inboxs)
    .insertOne({ document });
};

module.exports = {
  createInbox,
};
