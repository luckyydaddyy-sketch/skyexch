const express = require("express");

const requestHandler = require("../../../middlewares/requestHandler");
const getList = require("../../../controllers/admin/setting/matchHistory/list");
const rollBackWinner = require("../../../controllers/admin/setting/matchHistory/rollBackWinner");
const listOfCancel = require("../../../controllers/admin/setting/matchHistory/listOfCancel");

const router = express.Router();

router.post("/", requestHandler(getList));
router.post("/listOfCancel", requestHandler(listOfCancel));
router.post("/rollBackWinner", requestHandler(rollBackWinner));

module.exports = router;
