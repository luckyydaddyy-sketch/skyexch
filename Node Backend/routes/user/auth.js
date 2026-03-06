const express = require("express");
const requestHandler = require("../../middlewares/requestHandler");
// const configController = require("../../controllers/user/config");

const loginController = require("../../controllers/client/user/login");
const updateProfileController = require("../../controllers/client/user/updateProfile");
const getProfileController = require("../../controllers/client/user/getProfile");
const changePassController = require("../../controllers/client/user/changePassword");

const forgetPassController = require("../../controllers/client/user/forgetPassword");
const verifyController = require("../../controllers/client/user/verify");
const resetPassController = require("../../controllers/client/user/resetPassword");
const register = require("../../controllers/client/user/register");
const signUp = require("../../controllers/client/user/signUp");
const getAgents = require("../../controllers/client/user/getAgents");

const router = express.Router();

/**
 * API for User
 */

router.get("/", (req, res) => {
  console.log("user/ auth call--------->", req.originalUrl);
  res.send(req.originalUrl);
});

/**
 * API for User Login
 */

router.post("/login", requestHandler(loginController));

/**
 * API for User Update Profile
 */

router.post("/updateProfile", requestHandler(updateProfileController));

/**
 * API for User  Profile
 */
router.get("/getProfile", requestHandler(getProfileController));
/**
 * API for User changePassword
 */

router.post("/changePassword", requestHandler(changePassController));

/**
 * API for User Forget Password
 */

router.post("/forgetPassword", requestHandler(forgetPassController));

/**
 * API for User Verify Token
 */

router.post("/verify", requestHandler(verifyController));

/**
 * API for User Reset Password
 */

router.post("/resetPassword", requestHandler(resetPassController));
// router.get("/config", requestHandler(configController));

router.post("/register", requestHandler(register));
router.post("/signUp", requestHandler(signUp));
router.post("/getAgents", requestHandler(getAgents));

module.exports = router;
