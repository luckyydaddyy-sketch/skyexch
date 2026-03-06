const mongoose = require("mongoose");

const depositsSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      index: true,
    },
    bankId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "bankdetails",
      index: true,
    },
    userName: {
      type: String,
      required: true,
    },
    mobileNo: {
      type: Number,
      required: true,
    },
    accountNo: {
      type: Number,
      required: true,
    },
    transactionId: {
      type: String,
      required: true,
      unique: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    reason: {
      type: String,
      default: "",
    },
    isApprove: {
      type: Boolean,
      default: false,
    },
    approvalBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admins",
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = depositsSchema;
