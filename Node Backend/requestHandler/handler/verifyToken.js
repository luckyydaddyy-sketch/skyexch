const verifyToken = require("../../socketControllers/user/verifyToken");

function verifyTokenHelper(data, socket) {
  console.log("==verifyTokenHelper=> call <===");

  return verifyToken(data, socket).catch((e) => console.error(e));
}

module.exports = verifyTokenHelper;
