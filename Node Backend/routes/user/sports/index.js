const express = require("express");
const requestHandler = require("../../../middlewares/requestHandler");
// const configController = require("../../controllers/user/config");

const placeBet = require("../../../controllers/client/bet/placeBet");
const betList = require("../../../controllers/client/bet/betList");
const betListWithCount = require("../../../controllers/client/bet/betListWithCount");
const search = require("../../../controllers/client/bet/search");
const getBlockMatch = require("../../../controllers/client/bet/getBlockMatch");
const getLeagueName = require("../../../controllers/client/sportLeagues/getList");
const getSportListByLeague = require("../../../controllers/client/sportLeagues/getSportListByLeague");
const getProfitLost = require("../../../controllers/client/bet/getProfitLost");
const getSportListByLeagueBySportName = require("../../../controllers/client/sportLeagues/getSportListByLeagueBySportName");
const getChannelId = require("../../../controllers/client/sportLeagues/getChannelId");

const router = express.Router();

/**
 * API for Sports
 */

router.post("/placeBet", requestHandler(placeBet));
router.post("/betList", requestHandler(betList));
router.post("/betListWithCount", requestHandler(betListWithCount));
router.post("/search", requestHandler(search));
router.post("/getBlockMatch", requestHandler(getBlockMatch));
router.post("/getLeagueName", requestHandler(getLeagueName));
router.post("/getSportListByLeague", requestHandler(getSportListByLeague));
router.post("/getProfitLost", requestHandler(getProfitLost));
router.post(
  "/getSportListByLeagueBySportName",
  requestHandler(getSportListByLeagueBySportName)
  );
  router.post("/getChannelId", requestHandler(getChannelId));

module.exports = router;
