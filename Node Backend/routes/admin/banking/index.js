const express = require("express");

const requestHandler = require("../../../middlewares/requestHandler");
const getBalance = require("../../../controllers/admin/banking/masterBanking/getBalance");
const addBalance = require("../../../controllers/admin/banking/masterBanking/addBalance");
const getList = require("../../../controllers/admin/banking/playerBanking/getList");
const update = require("../../../controllers/admin/banking/playerBanking/update");

const router = express.Router();

router.get("/master/getBalance", requestHandler(getBalance));
router.post("/master/addBalance", requestHandler(addBalance));

router.post("/getList", requestHandler(getList));
router.post("/update", requestHandler(update));

module.exports = router;
