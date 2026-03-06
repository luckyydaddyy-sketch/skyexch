const signup = require("../../socketControllers/user/signup");

function signupHelper(data, socket) {
  console.log("==signupHelper=> call <===");

  return signup(data, socket).catch((e) => console.error(e));
}

module.exports = signupHelper;
