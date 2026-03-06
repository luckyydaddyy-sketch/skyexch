const verifyTokenAdmin = require("../../socketControllers/user/verifyTokenAdmin");

function verifyTokenAdminHelper(data, socket) {
  console.log("==verifyTokenAdminHelper=> call <===");

  return verifyTokenAdmin(data, socket).catch((e) => console.error(e));
}

module.exports = verifyTokenAdminHelper;
