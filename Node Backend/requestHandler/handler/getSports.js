const getMain = require("../../socketControllers/sports/getMain");

function getSportsHelper(data, socket) {
  console.log("==getSportsHelper=> call <===");

  return getMain(data, socket).catch((e) => console.error(e));
}

module.exports = getSportsHelper;
