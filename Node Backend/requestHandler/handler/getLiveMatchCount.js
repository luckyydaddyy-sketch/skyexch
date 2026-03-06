const liveMatchCount = require("../../socketControllers/sports/liveMatchCount");

function liveMatchCountHelper(data, socket) {
  console.log("==liveMatchCountHelper=> call <===");

  return liveMatchCount(data, socket).catch((e) => console.error(e));
}

module.exports = liveMatchCountHelper;
