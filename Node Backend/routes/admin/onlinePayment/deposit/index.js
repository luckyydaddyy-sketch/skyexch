const express = require("express");

const requestHandler = require("../../../../middlewares/requestHandler");

const approveDeposit = require("../../../../controllers/admin/onlinePayment/deposit/approveDeposit");
const approveDepositAdmin = require("../../../../controllers/admin/onlinePayment/deposit/approveDepositAdmin");
const getList = require("../../../../controllers/admin/onlinePayment/deposit/getList");

const router = express.Router();

router.post("/approveDeposit", requestHandler(approveDeposit));
router.post("/approveDepositAdmin", requestHandler(approveDepositAdmin));
router.post("/getList", requestHandler(getList));

module.exports = router;
