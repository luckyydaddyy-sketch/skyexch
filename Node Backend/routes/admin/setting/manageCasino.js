const express = require("express");

const requestHandler = require("../../../middlewares/requestHandler");
const getList = require("../../../controllers/admin/setting/manageCasino/list");
const create = require("../../../controllers/admin/setting/manageCasino/create");


const router = express.Router();

router.post("/", requestHandler(getList));
router.post("/create", requestHandler(create)); 


module.exports = router;
