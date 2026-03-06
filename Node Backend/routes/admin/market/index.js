const express = require("express");

const requestHandler = require("../../../middlewares/requestHandler");

const getList = require("../../../controllers/admin/market/getList");
const blockMarket = require("../../../controllers/admin/market/blockMarket");

const router = express.Router();

router.get("/list", requestHandler(getList));
router.post("/block", requestHandler(blockMarket));

module.exports = router;
