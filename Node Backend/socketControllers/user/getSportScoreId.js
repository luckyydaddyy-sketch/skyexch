const { getScoreBoardId } = require("../../config/sportsAPI");
const { EVENTS } = require("../../constants");
const eventEmitter = require("../../eventEmitter");

async function handler(data, socket) {
  const { gameId } = data;

  const scoreIdInfo = await getScoreBoardId(gameId);

  const sendData = {
    en: EVENTS.GET_SCORE_ID,
    data: scoreIdInfo,
    socket,
  };
  eventEmitter.emit(EVENTS.SOCKET, sendData);
}

module.exports = handler;
