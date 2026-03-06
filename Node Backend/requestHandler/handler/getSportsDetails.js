const getSportsDetails = require("../../socketControllers/sports/getSportsDetails");

function getSportsDetailsHelper(data, socket) {
  console.log("==getSportsDetailsHelper=> call <===");

  return getSportsDetails(data, socket).catch((e) => console.error(e));
}

module.exports = getSportsDetailsHelper;
