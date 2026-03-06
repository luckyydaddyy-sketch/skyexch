const express = require("express");

const requestHandler = require("../../../middlewares/requestHandler");
const getList = require("../../../controllers/admin/setting/premiumHistory/list");
const listOfBet = require("../../../controllers/admin/setting/premiumHistory/listOfBet");
const rollBackWinner = require("../../../controllers/admin/setting/premiumHistory/rollBackWinner");

const router = express.Router();

router.post("/", requestHandler(getList));
router.post("/listOfBet", requestHandler(listOfBet)); // one sports bet list
router.post("/rollBackWinner", requestHandler(rollBackWinner));


module.exports = router;
