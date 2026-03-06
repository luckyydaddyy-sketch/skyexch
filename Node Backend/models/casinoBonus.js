const mongoose = require("mongoose");

const casinoBonusSchema = mongoose.Schema(
  {
    userObjectId: {
      type: mongoose.Schema.Types.ObjectId,
      index: true,
      ref: "users",
      required: true,
    },
    userId: {
      type: String,
      default: "",
    },
    platform: {
      type: String,
      default: "",
    },
    currency: {
      type: String,
      default: "INR",
    },
    amount: {
      type: Number,
      default: 0,
    },
    promotionTxId: {
      type: String,
      default: "",
    },
    promotionId: {
      type: String,
      default: "",
    },
    promotionTypeId: {
      type: String,
      default: "",
    },
    txTime: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = casinoBonusSchema;
