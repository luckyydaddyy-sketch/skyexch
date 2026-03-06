const express = require("express");

const requestHandler = require("../../../middlewares/requestHandler");
const addPlayer = require("../../../controllers/admin/downlineList/player/addPlayer");
const changeStatus = require("../../../controllers/admin/downlineList/player/changeStatus");
const getProfile = require("../../../controllers/admin/downlineList/player/getProfile");
const betHistory = require("../../../controllers/admin/downlineList/player/betHistory");
const active = require("../../../controllers/admin/downlineList/player/active");
const getBetList = require("../../../controllers/admin/downlineList/player/getBetList");
const casinoHistory = require("../../../controllers/admin/downlineList/player/casinoHistory");
const cheatBlock = require("../../../controllers/admin/downlineList/player/cheatBlock");

const router = express.Router();

router.post("/create", requestHandler(addPlayer));
router.post("/updateInfo", requestHandler(changeStatus));
router.post("/getProfile", requestHandler(getProfile));
router.post("/betHistory", requestHandler(betHistory));
router.post("/active", requestHandler(active));
router.post("/getBetList", requestHandler(getBetList));
router.post("/casinoHistory", requestHandler(casinoHistory));
router.post("/cheatBlock", requestHandler(cheatBlock));
module.exports = router;
