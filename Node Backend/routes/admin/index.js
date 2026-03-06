const express = require("express");
const requestHandler = require("../../middlewares/requestHandler");
const configController = require("../../controllers/admin/config");

const loginController = require("../../controllers/admin/user/login");
const registerController = require("../../controllers/admin/user/register");
const changePassController = require("../../controllers/admin/user/changePassword");

const forgetPassController = require("../../controllers/admin/user/forgetPassword");
const verifyController = require("../../controllers/admin/user/verify");
const resetPassController = require("../../controllers/admin/user/resetPassword");
const getRole = require("../../controllers/admin/user/getRole");
const totalPlayerCount = require("../../controllers/admin/user/totalPlayerCount");
const getUserListByDownline = require("../../controllers/admin/user/getUserListByDownline");

const router = express.Router();

/**
 * API for Admin
 */

router.get("/", (req, res) => {
  console.log("admin/ auth call--------->", req.originalUrl);
  res.send(req.originalUrl);
});

/**
 * API for Admin Login
 */

router.post("/login", requestHandler(loginController));

/**
 * API for Admin Role
 */

router.get("/getRole", requestHandler(getRole));

/**
 * API for Admin Register
 */

router.post("/register", requestHandler(registerController));

/**
 * API for Admin changePassword
 */

router.post("/changePassword", requestHandler(changePassController));

/**
 * API for Admin Forget Password
 */

router.post("/forgetPassword", requestHandler(forgetPassController));

/**
 * API for Admin Verify Token
 */

router.post("/verify", requestHandler(verifyController));

/**
 * API for Admin Reset Password
 */

router.post("/resetPassword", requestHandler(resetPassController));

router.post("/totalPlayerCount", requestHandler(totalPlayerCount));
router.post("/getUserListByDownline", requestHandler(getUserListByDownline));

module.exports = router;
