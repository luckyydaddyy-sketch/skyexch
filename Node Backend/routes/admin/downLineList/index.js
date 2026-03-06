const express = require("express");

const requestHandler = require("../../../middlewares/requestHandler");
const getList = require("../../../controllers/admin/downlineList/getList");
const addAgent = require("../../../controllers/admin/downlineList/agent/addAgent");
const addPlayer = require("../../../controllers/admin/downlineList/player/addPlayer");
const addCreditRef = require("../../../controllers/admin/downlineList/addCreditRef");
const addSportLimit = require("../../../controllers/admin/downlineList/addSportLimit");

const router = express.Router();

router.post("/", requestHandler(getList));
router.post("/addAgent", requestHandler(addAgent));
router.post("/addPlayer", requestHandler(addPlayer));
router.post("/addCreditRef", requestHandler(addCreditRef));
router.post("/addSportLimit", requestHandler(addSportLimit));

module.exports = router;
