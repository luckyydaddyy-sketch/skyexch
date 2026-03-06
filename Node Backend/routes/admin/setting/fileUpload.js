const express = require("express");

const requestHandler = require("../../../middlewares/requestHandler");
const { upload } = require("../../../utils/fileUpload");
const imageUpload = require("../../../controllers/admin/setting/fileUpload")


const router = express.Router();

router.post(
    "/",
    upload.single("photos"),
    requestHandler(imageUpload)
  );

module.exports = router;
