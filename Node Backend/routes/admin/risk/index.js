const express = require("express");

const requestHandler = require("../../../middlewares/requestHandler");
const getList = require("../../../controllers/admin/riskManager/getList");
const getBetList = require("../../../controllers/admin/riskManager/getBetList");
const deleteBet = require("../../../controllers/admin/riskManager/deleteBet");
const blockMatch = require("../../../controllers/admin/riskManager/blockMatch");
const getBlockMatch = require("../../../controllers/admin/riskManager/getBlockMatch");
const listOfBlockBetsByMatch = require("../../../controllers/admin/riskManager/listOfBlockBetsByMatch");
const listOfBlockmatch = require("../../../controllers/admin/riskManager/listOfBlockmatch");
const getBetListAdminBook = require("../../../controllers/admin/riskManager/getBetListAdminBook");
const getListOfBetBigAmount = require("../../../controllers/admin/riskManager/getListOfBetBigAmount");

const router = express.Router();

router.post("/", requestHandler(getList));
router.post("/getBetList", requestHandler(getBetList));
router.post("/deleteBet", requestHandler(deleteBet));
router.post("/blockMatch", requestHandler(blockMatch));
router.post("/getBlockMatch", requestHandler(getBlockMatch));
router.post("/listOfBlockBetsByMatch", requestHandler(listOfBlockBetsByMatch));
router.post("/listOfBlockmatch", requestHandler(listOfBlockmatch));
router.post("/getBetListAdminBook", requestHandler(getBetListAdminBook));
router.post("/getListOfBetBigAmount", requestHandler(getListOfBetBigAmount));

module.exports = router;
