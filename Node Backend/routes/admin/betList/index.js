const express = require("express");

const requestHandler = require("../../../middlewares/requestHandler");
const getList = require("../../../controllers/admin/betList/getList");
const history = require("../../../controllers/admin/betList/history");
const matchList = require("../../../controllers/admin/betList/matchList");

const router = express.Router();

router.post("/liveList", requestHandler(getList));
router.post("/list", requestHandler(history));
router.post("/matchList", requestHandler(matchList));

module.exports = router;
