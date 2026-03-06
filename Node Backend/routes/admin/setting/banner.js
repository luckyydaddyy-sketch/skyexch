const express = require("express");

const requestHandler = require("../../../middlewares/requestHandler");
const getList = require("../../../controllers/admin/setting/banner/list");
const create = require("../../../controllers/admin/setting/banner/create");
const getOne = require("../../../controllers/admin/setting/banner/getOne");
const update = require("../../../controllers/admin/setting/banner/update");
const deleteControler = require("../../../controllers/admin/setting/banner/delete");

const router = express.Router();

router.post("/", requestHandler(getList));
router.post("/create", requestHandler(create));
router.post("/getOne", requestHandler(getOne));
router.post("/update", requestHandler(update));
router.post("/delete", requestHandler(deleteControler));

module.exports = router;
