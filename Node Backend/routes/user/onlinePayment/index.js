const express = require("express");
const requestHandler = require("../../../middlewares/requestHandler");

const addDeposit = require("../../../controllers/client/deposit/addDeposit");
const addWithdrawal = require("../../../controllers/client/deposit/addWithdrawal");
const getMethod = require("../../../controllers/client/deposit/getMethod");
const getWithdrawalRequest = require("../../../controllers/client/deposit/getWithdrawalRequest");
const getDepositRequest = require("../../../controllers/client/deposit/getDepositRequest");
const getMyTransactions = require("../../../controllers/client/deposit/getMyTransactions");
const { uploadForDeposit } = require("../../../utils/fileUpload");

const router = express.Router();

router.post(
  "/addDeposit",
  uploadForDeposit.single("image"),
  requestHandler(addDeposit)
);
router.post("/addWithdrawal", requestHandler(addWithdrawal));
router.get("/getMethod", requestHandler(getMethod));
router.get("/getWithdrawalRequest", requestHandler(getWithdrawalRequest));
router.get("/getDepositRequest", requestHandler(getDepositRequest));
router.post("/getMyTransactions", requestHandler(getMyTransactions));

module.exports = router;
