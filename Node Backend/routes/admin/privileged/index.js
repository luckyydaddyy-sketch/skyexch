const express = require("express");

const requestHandler = require("../../../middlewares/requestHandler");

const getUserRole = require("../../../controllers/admin/privileged/getUserRole");
const updateUserRole = require("../../../controllers/admin/privileged/updateUserRole");

const router = express.Router();

router.get("/getUserRole", requestHandler(getUserRole));
router.post("/updateUserRole", requestHandler(updateUserRole));

module.exports = router;
