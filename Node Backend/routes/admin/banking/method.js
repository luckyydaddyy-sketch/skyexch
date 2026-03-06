const express = require("express");

const requestHandler = require("../../../middlewares/requestHandler");

const addMethod = require("../../../controllers/admin/banking/method/addMethod");
const getMethod = require("../../../controllers/admin/banking/method/getMethod");
const getAllMethod = require("../../../controllers/admin/banking/method/getAllMethod");
const updateMethod = require("../../../controllers/admin/banking/method/updateMethod");
const deleteMethod = require("../../../controllers/admin/banking/method/deleteMethod");

const router = express.Router();

// router.post("/method/addMethod", requestHandler(addBalance));
router.post("/add", requestHandler(addMethod));
router.get("/getAll", requestHandler(getAllMethod));
router.get("/getOne", requestHandler(getMethod));
router.post("/updateMethod", requestHandler(updateMethod));
router.post("/deleteMethod", requestHandler(deleteMethod));

module.exports = router;
