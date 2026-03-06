const express = require("express");
const requestHandler = require("../../../middlewares/requestHandler");

const inPlay = require("../../../controllers/client/inPlay");
const getScorboard = require("../../../controllers/client/inPlay/getScorboard");
const inPlayFast = require("../../../controllers/client/inPlay/inPlayFast");

const router = express.Router();

router.post("/", requestHandler(inPlayFast));
router.post("/getScorboard", requestHandler(getScorboard));

module.exports = router;
