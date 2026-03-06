const mongo = require("../../config/mongodb");
const { EVENTS } = require("../../constants");
const eventEmitter = require("../../eventEmitter");

async function handler(data, socket) {
  const { userId } = data;

  if (typeof userId === "undefined") return false;
  const query = { user_name: userId };

  const userInfo = await mongo.bettingApp.model(mongo.models.admins).findOne({
    query,
  });

  if (userInfo) {
    await mongo.bettingApp.model(mongo.models.admins).updateOne({
      query,
      update: {
        socketId: socket.id,
      },
    });

    socket.userId = userInfo._id;
    const sendData = {
      en: EVENTS.SIGN_UP,
      data: {
        msg: "done",
      },
      socket,
    };
    eventEmitter.emit(EVENTS.SOCKET, sendData);
  }
}

module.exports = handler;
