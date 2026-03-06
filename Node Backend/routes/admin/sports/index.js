const express = require("express");

const requestHandler = require("../../../middlewares/requestHandler");

const getList = require("../../../controllers/admin/sport/getList");
const activeSport = require("../../../controllers/admin/sport/update");
const sportMarket = require("../../../controllers/admin/setting/sportMainMarket/getList");
const getListPlacedBet = require("../../../controllers/admin/setting/sportMainMarket/getListPlacedBet");
const declareWinner = require("../../../controllers/admin/setting/sportMainMarket/declareWinner");
const updare = require("../../../controllers/admin/setting/sportMainMarket/updare");
const getUserCount = require("../../../controllers/admin/sport/getUserCount");
const getBetsCount = require("../../../controllers/admin/sport/getBetsCount");
const getCheatsBets = require("../../../controllers/admin/sport/getCheatsBets");
const updateProfitLimit = require("../../../controllers/admin/setting/sportMainMarket/updateProfitLimit");

const router = express.Router();

// sport league
router.post("/getList", requestHandler(getList));
router.post("/activeSport", requestHandler(activeSport));

// sport Main Market
router.post("/sportMarket", requestHandler(sportMarket));
router.post("/declareWinner", requestHandler(declareWinner));
router.post("/updare", requestHandler(updare));
router.post("/updateProfitLimit", requestHandler(updateProfitLimit));

// only for super admin
router.post("/sportMarketPlacedBet", requestHandler(getListPlacedBet));
router.post("/getUserCount", requestHandler(getUserCount));
router.post("/getBetsCount", requestHandler(getBetsCount));
router.post("/getCheatsBets", requestHandler(getCheatsBets));
module.exports = router;
