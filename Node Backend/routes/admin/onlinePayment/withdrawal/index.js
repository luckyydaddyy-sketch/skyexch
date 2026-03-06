const express = require("express");

const requestHandler = require("../../../../middlewares/requestHandler");

const approveWithdrawal = require("../../../../controllers/admin/onlinePayment/withdrawal/approveWithdrawal");
const approveWithdrawalAdmin = require("../../../../controllers/admin/onlinePayment/withdrawal/approveWithdrawalAdmin");
const getList = require("../../../../controllers/admin/onlinePayment/withdrawal/getList");

const router = express.Router();

router.post("/approveWithdrawal", requestHandler(approveWithdrawal));
router.post("/approveWithdrawalAdmin", requestHandler(approveWithdrawalAdmin));
router.post("/getList", requestHandler(getList));

module.exports = router;
