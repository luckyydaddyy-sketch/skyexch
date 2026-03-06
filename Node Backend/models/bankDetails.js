const mongoose = require("mongoose");
const { TRANSACTION_METHOD, ONLINE_PAYMENT } = require("../constants");

const bankDetailsSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admins",
      required: true,
      index: true,
    },
    type: {
      type: String,
      default: TRANSACTION_METHOD.BANK,
      enum: [
        TRANSACTION_METHOD.BANK,
        TRANSACTION_METHOD.G_PAY,
        TRANSACTION_METHOD.P_PAY,
        TRANSACTION_METHOD.PAYTM,
        TRANSACTION_METHOD.UPI,
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
    paymentType: {
      type: String,
      default: ONLINE_PAYMENT.DEPOSIT,
      enum:[
        ONLINE_PAYMENT.DEPOSIT,
        ONLINE_PAYMENT.WITHDRAWAL
      ]
    },
    name: {
      type: String,
      required: true,
    },
    accountNo: {
      type: String,
      required: true,
    },
    ifscCode: {
      type: String,
      default: "",
    },
    holderName: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = bankDetailsSchema;
