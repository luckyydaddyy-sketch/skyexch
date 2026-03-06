const mongoose = require("mongoose");

const betTotalAmountSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      index: true,
      required: true,
      ref: "users",
    },
    sportWiningsTotalAmount: {
      type: Number,
      default: 0,
    },
    casinoWiningsTotalAmount: {
      type: Number,
      default: 0,
    },
    monthDate: {
      type: Date,
    },
    monthDateString: {
      type: String,
      default:""
    },
  },
  {
    timestamps: true,
  }
);

module.exports = betTotalAmountSchema;
