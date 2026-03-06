const express = require("express");

const requestHandler = require("../../../middlewares/requestHandler");
const getList = require("../../../controllers/admin/setting/fancyHistory/list");
const listOfBet = require("../../../controllers/admin/setting/fancyHistory/listOfBet");
const rollBackWinner = require("../../../controllers/admin/setting/fancyHistory/rollBackWinner");
const listOfBetCancel = require("../../../controllers/admin/setting/fancyHistory/listOfBetCancel");

const router = express.Router();

router.post("/", requestHandler(getList));
router.post("/listOfBet", requestHandler(listOfBet)); // one sports bet list
router.post("/listOfBetCancel", requestHandler(listOfBetCancel)); // one sports bet list
router.post("/rollBackWinner", requestHandler(rollBackWinner));

module.exports = router;
