const liveMatchCountForVelki = require("../../socketControllers/sports/liveMatchCountForVelki");

function liveMatchCountForVelkiHelper(data, socket) {
  console.log("==liveMatchCountForVelkiHelper=> call <===");

  return liveMatchCountForVelki(data, socket).catch((e) => console.error(e));
}

module.exports = liveMatchCountForVelkiHelper;
