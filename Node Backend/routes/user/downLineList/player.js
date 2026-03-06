const express = require("express");

const requestHandler = require("../../../middlewares/requestHandler");
const changeStatus = require("../../../controllers/client/downlineList/changeStatus");
const getInBox = require("../../../controllers/client/inbox/getInBox");
const getInBoxCount = require("../../../controllers/client/inbox/getInboxCount");
const setInBoxMessageIsView = require("../../../controllers/client/inbox/setInBoxMessageIsView");

const router = express.Router();

router.post("/updateInfo", requestHandler(changeStatus));
router.post("/getInBox", requestHandler(getInBox));
router.post("/getInBoxCount", requestHandler(getInBoxCount));
router.post("/setInBoxMessageIsView", requestHandler(setInBoxMessageIsView));
module.exports = router;
