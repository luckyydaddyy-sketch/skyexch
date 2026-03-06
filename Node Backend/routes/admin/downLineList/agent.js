const express = require("express");

const requestHandler = require("../../../middlewares/requestHandler");
const addAgent = require("../../../controllers/admin/downlineList/agent/addAgent")
const changeStatus = require("../../../controllers/admin/downlineList/agent/changeStatus")
const getList = require("../../../controllers/admin/downlineList/agent/getList")

const router = express.Router();
 
router.post("/getList", requestHandler(getList));
router.post("/create", requestHandler(addAgent));
router.post("/updateInfo", requestHandler(changeStatus));

module.exports = router;
