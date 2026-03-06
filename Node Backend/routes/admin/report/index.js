const express = require("express");

const requestHandler = require("../../../middlewares/requestHandler");
const accountStatment = require("../../../controllers/admin/report/accountStatment");
// const downline = require("../../../controllers/admin/report/downline");
const downline = require("../../../controllers/admin/report/downline-new-report");
const marketReport = require("../../../controllers/admin/report/marketReport");
const userList = require("../../../controllers/admin/report/userList");
const casinoReport = require("../../../controllers/admin/report/casinoReport");
const depositReport = require("../../../controllers/admin/report/deposit-withdrawal");
const marketReportNew = require("../../../controllers/admin/report/marketReportNew");
const casinoProfitLost = require("../../../controllers/admin/report/userProfitLost/casinoProfitLost");
const sportsProfitLost = require("../../../controllers/admin/report/userProfitLost/sportsProfitLost");
const profitLossByMarket = require("../../../controllers/admin/report/profitLossByMarket");
const dWithdrawalDailyReport = require("../../../controllers/admin/report/deposit-withdrawalDailyReport");

const router = express.Router();

router.post("/accountStatment", requestHandler(accountStatment));
router.post("/downline", requestHandler(downline));
router.post("/downlineCasino", requestHandler(casinoReport));
router.post("/marketReport", requestHandler(marketReport));
router.post("/userList", requestHandler(userList));
router.post("/deposit-withdrawal", requestHandler(depositReport));
router.post("/marketReportNew", requestHandler(marketReportNew));
router.post("/sportsProfitLost", requestHandler(sportsProfitLost));
router.post("/casinoProfitLost", requestHandler(casinoProfitLost));
router.post("/profitLossByMarket", requestHandler(profitLossByMarket));
router.post("/DW-Daily", requestHandler(dWithdrawalDailyReport));

module.exports = router;
