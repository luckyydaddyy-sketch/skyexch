const mongoose = require("mongoose");
const { TRANSACTION_METHOD, ONLINE_PAYMENT } = require("../constants");

const withdrawalsSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      index: true,
      default: null
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admins",
      index: true,
      default: null
    },
    transactionType : {
      type: String,
      enum:[
        ONLINE_PAYMENT.WITHDRAWAL,
        ONLINE_PAYMENT.DEPOSIT,
        ONLINE_PAYMENT.OFFLINE_DEPOSIT,
        ONLINE_PAYMENT.OFFLINE_WITHDRAWAL,
      ],
      default:ONLINE_PAYMENT.WITHDRAWAL
    },
    type: {
      type: String,
      default: TRANSACTION_METHOD.BANK,
      enum: [
        TRANSACTION_METHOD.BANK,
        TRANSACTION_METHOD.G_PAY,
        TRANSACTION_METHOD.P_PAY,
        TRANSACTION_METHOD.UPI,
        TRANSACTION_METHOD.PAYTM,
        TRANSACTION_METHOD.bKash,
        TRANSACTION_METHOD.Rocket,
        TRANSACTION_METHOD.Nagad,
        TRANSACTION_METHOD.Ok_Wallet,
        TRANSACTION_METHOD.SureCash,
        TRANSACTION_METHOD.Upay,
        TRANSACTION_METHOD.Tap,
        TRANSACTION_METHOD.USDT_TRC20,
        TRANSACTION_METHOD.BTC,
        TRANSACTION_METHOD.Local_Bank
      ],
    },
    bankName: {
      type: String,
      default: "",
    },
    userName: {
      type: String,
      required: true,
    },
    accountNo: {
      type: String,
      default:""
    },
    mobileNo: {
      type: Number,
      default:0
    },
    ifscCode: {
      type: String,
      default: "",
    },
    holderName: {
      type: String,
      default: "",
    },
    amount: {
      type: Number,
      required: true,
    },
    transactionId: {
      type: String,
      default: "",
    },
    descrpitions: {
      type: String,
      default: "",
    },
    isApprove: {
      type: Boolean,
      default: false,
    },
    reason: {
      type: String,
      default: "",
    },
    approvalBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admins",
      default: null,
      index: true,
    },
    // diposits
    bankId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "bankdetails",
      index: true,
    },
    image: {
      type: String,
      default:""
    },
  },
  {
    timestamps: true,
  }
);

module.exports = withdrawalsSchema;
