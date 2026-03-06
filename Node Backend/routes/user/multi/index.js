const express = require("express");
const requestHandler = require("../../../middlewares/requestHandler");

const add = require("../../../controllers/client/pin/add");
const view = require("../../../controllers/client/pin/view");

const router = express.Router();

router.post("/", requestHandler(view));
router.post("/pin", requestHandler(add));

module.exports = router;
