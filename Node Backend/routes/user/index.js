const express = require("express");
const getStack = require("../../controllers/client/stack/getStack");
const updateStack = require("../../controllers/client/stack/updateStack");
const profitLost = require("../../controllers/client/user/profitLost");
const requestHandler = require("../../middlewares/requestHandler");

const router = express.Router();

/**
 * API for User
 */

router.get("/", (req, res) => {
  console.log("user/ auth call--------->", req.originalUrl);
  res.send(req.originalUrl);
});

router.get("/getStack", requestHandler(getStack));
router.post("/updateStack", requestHandler(updateStack));
router.post("/profitLost", requestHandler(profitLost));

module.exports = router;
