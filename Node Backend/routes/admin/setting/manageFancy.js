const express = require("express");

const requestHandler = require("../../../middlewares/requestHandler");
const getList = require("../../../controllers/admin/setting/manageFancy/list");
const listOfBet = require("../../../controllers/admin/setting/manageFancy/listOfBet");
const declareWinner = require("../../../controllers/admin/setting/manageFancy/declareWinner");

const router = express.Router();

router.post("/", requestHandler(getList));
router.post("/listOfBet", requestHandler(listOfBet)); // one sports bet list
router.post("/declareWinner", requestHandler(declareWinner));


module.exports = router;
