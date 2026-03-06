const signupAdmin = require("../../socketControllers/user/signupAdmin");

function signupAdminHelper(data, socket) {
  console.log("==signupAdminHelper=> call <===");

  return signupAdmin(data, socket).catch((e) => console.error(e));
}

module.exports = signupAdminHelper;
