const mongo = require("../../config/mongodb");
const { EVENTS } = require("../../constants");
const eventEmitter = require("../../eventEmitter");

async function handler(data, socket) {
  const { userId, token } = data;
  if (typeof userId === "undefined" || typeof token === "undefined")
    return false;
  const query = { _id: mongo.ObjectId(userId) };

  const userInfo = await mongo.bettingApp.model(mongo.models.users).findOne({
    query,
  });

  if (userInfo) {
    const tokenInfo = await mongo.bettingApp
      .model(mongo.models.tokens)
      .findOne({
        query: { _id: mongo.ObjectId(token) },
      });

    let sendData = {};

    if (tokenInfo) {
      sendData = {
        en: EVENTS.VERIFY_TOKEN,
        data: {
          msg: "done",
          status: 200,
        },
        socket,
      };
    } else {
      sendData = {
        en: EVENTS.VERIFY_TOKEN,
        data: {
          msg: "unauthorized",
          status: 401,
        },
        socket,
      };
    }

    eventEmitter.emit(EVENTS.SOCKET, sendData);
  }
}

module.exports = handler;
