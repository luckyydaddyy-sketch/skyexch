const express = require("express");

const requestHandler = require("../../../middlewares/requestHandler");
const getDetails = require("../../../controllers/admin/setting/contactDetails/getDetails");
const updateDetails = require("../../../controllers/admin/setting/contactDetails/updateDetails");


const router = express.Router();

router.get("/", requestHandler(getDetails));
router.post("/updateDetails", requestHandler(updateDetails));

module.exports = router;
