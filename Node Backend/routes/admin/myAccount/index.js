const express = require("express");

const requestHandler = require("../../../middlewares/requestHandler");
const getProfile = require("../../../controllers/admin/myAccount/getProfile");
const getStatements = require("../../../controllers/admin/myAccount/getStatements");
const getActivities = require("../../../controllers/admin/myAccount/getActivities");
const statementBetView = require("../../../controllers/admin/myAccount/statementBetView");

const router = express.Router();

router.post("/getProfile", requestHandler(getProfile));
router.post("/getStatements", requestHandler(getStatements));
router.post("/getActivities", requestHandler(getActivities));
router.post("/statementBetView", requestHandler(statementBetView));

module.exports = router;
