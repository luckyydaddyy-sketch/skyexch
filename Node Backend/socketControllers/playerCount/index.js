const mongo = require("../../config/mongodb");
const { EVENTS } = require("../../constants");
const eventEmitter = require("../../eventEmitter");

async function handler(data, socket) {
  const activeUser = await mongo.bettingApp
    .model(mongo.models.users)
    .countDocuments({
      query: { status: "active" },
    });
  const suspendUser = await mongo.bettingApp
    .model(mongo.models.users)
    .countDocuments({
      query: { status: "suspend" },
    });
  const lockedUser = await mongo.bettingApp
    .model(mongo.models.users)
    .countDocuments({
      query: { status: "locked" },
    });

  const res = {
    activeUser,
    suspendUser,
    lockedUser,
    totalUser: activeUser + suspendUser + lockedUser,
  };

  console.log("count ::");
  console.log(res);
  const sendData = {
    en: EVENTS.GET_USER_COUNT,
    data:res,
    socket,
  };
  eventEmitter.emit(EVENTS.SOCKET, sendData);
}

module.exports = handler;
