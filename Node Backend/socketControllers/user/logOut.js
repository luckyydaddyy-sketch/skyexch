const mongo = require("../../config/mongodb");
const { EVENTS } = require("../../constants");
const eventEmitter = require("../../eventEmitter");

async function handler(data, socket) {
  const { userId } = socket;

  if (userId) {
    const query = { _id: mongo.ObjectId(userId), socketId: socket.id };

    const userInfo = await mongo.bettingApp.model(mongo.models.users).findOne({
      query,
    });
    if (userInfo) {
      await mongo.bettingApp.model(mongo.models.users).updateOne({
        query,
        update: {
          socketId: "",
        },
      });
    }
  }
}

module.exports = handler;
