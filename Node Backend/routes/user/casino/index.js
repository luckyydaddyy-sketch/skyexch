const express = require("express");

const requestHandler = require("../../../middlewares/requestHandler");
const login = require("../../../controllers/casinoApi/client/login");
const evolationLogin = require("../../../controllers/casinoApi/client/evolationLogin");

const router = express.Router();

router.post("/login", requestHandler(login));
router.post("/evolationLogin", requestHandler(evolationLogin));
module.exports = router;
