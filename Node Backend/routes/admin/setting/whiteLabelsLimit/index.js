const express = require("express");

const requestHandler = require("../../../../middlewares/requestHandler");
const getLimit = require("../../../../controllers/admin/setting/whiteLabelsLimit/getLimit");
const updateLimit = require("../../../../controllers/admin/setting/whiteLabelsLimit/updateLimit");
const resetLimit = require("../../../../controllers/admin/setting/whiteLabelsLimit/resetLimit");
const getAgentList = require("../../../../controllers/admin/setting/whiteLabelsLimit/getAgentList");

const router = express.Router();

router.get("/getAgentList", requestHandler(getAgentList));
router.post("/getLimit", requestHandler(getLimit));
router.post("/updateLimit", requestHandler(updateLimit));
router.post("/resetLimit", requestHandler(resetLimit));

module.exports = router;
