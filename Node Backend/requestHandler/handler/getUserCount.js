const playerCount = require("../../socketControllers/playerCount");

function playerCountHelper(data, socket) {
  console.log("==playerCountHelper=> call <===");

  return playerCount(data, socket).catch((e) => console.error(e));
}

module.exports = playerCountHelper;
