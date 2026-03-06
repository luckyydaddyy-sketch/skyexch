const eventEmitter = require("../eventEmitter");
const { EVENTS } = require("../constants");
const {
  addClientInRoom,
  sendEventToClient,
  sendEventToRoom,
  sendEventToGlobal
} = require("../socket");

const activitiesTrack = require("../controllers/utils/activitiesTrack")

// function activities(payload) {
//   const { socket, data } = payload;
//   const responseData = {
//     en: EVENTS.USER_LIST,
//     data,
//   };
//   sendEventToClient(socket, responseData);
// }
eventEmitter.on(EVENTS.ACTIVITIES_TRACK, activitiesTrack);

function sendSocketEventToClient(payload) {
  const { en, socket, data } = payload;
  const responseData = {
    en,
    data,
  };
  sendEventToClient(socket, responseData);
}
eventEmitter.on(EVENTS.SOCKET, sendSocketEventToClient);