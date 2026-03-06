const express = require("express");

const requestHandler = require("../../../../middlewares/requestHandler");

const addDeposit = require("../../../../controllers/admin/onlinePayment/addRequest/addDeposit");
const addWithdrawal = require("../../../../controllers/admin/onlinePayment/addRequest/addWithdrawal");
const getMethod = require("../../../../controllers/admin/onlinePayment/addRequest/getMethod");
const getMyTransactions = require("../../../../controllers/admin/onlinePayment/addRequest/getMyTransactions");
const { uploadForDeposit } = require("../../../../utils/fileUpload");

const router = express.Router();

router.post("/addDeposit", uploadForDeposit.single("image"), requestHandler(addDeposit));
router.post("/addWithdrawal", requestHandler(addWithdrawal));
router.get("/getMethod", requestHandler(getMethod));
router.post("/getMyTransactions", requestHandler(getMyTransactions));

module.exports = router;
