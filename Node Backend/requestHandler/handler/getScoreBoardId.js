const getSportScoreId = require("../../socketControllers/user/getSportScoreId");

function getScoreBoardIdHelper(data, socket) {
  console.log("==getScoreBoardIdHelper=> call <===");

  return getSportScoreId(data, socket).catch((e) => console.error(e));
}

module.exports = getScoreBoardIdHelper;
