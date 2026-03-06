const express = require("express");
const requestHandler = require("../../../middlewares/requestHandler");

const home = require("../../../controllers/client/home");
const bajiHome = require("../../../controllers/client/home/bajiHome");
const getBlockMarketList = require("../../../controllers/client/home/getBlockMarketList");
const getCasino = require("../../../controllers/client/home/getCasino");
const getCasinoBaji = require("../../../controllers/client/home/getCasinoBaji");
const getSiteBaji = require("../../../controllers/client/home/getSite");

const router = express.Router();

router.get("/", requestHandler(home));
router.get("/velki", requestHandler(home));
router.get("/baji", requestHandler(bajiHome));
router.get("/marketList", requestHandler(getBlockMarketList));
router.get("/getCasino", requestHandler(getCasino));
router.get("/getCasino/baji", requestHandler(getCasinoBaji));
router.post("/getSiteBaji", requestHandler(getSiteBaji));

module.exports = router;
