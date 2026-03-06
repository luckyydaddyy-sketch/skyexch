const mongoose = require("mongoose");

const daysWiseBetTotalAmountSchema = mongoose.Schema(
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
    sportWiningsTotalAmountCommi: {
      type: Number,
      default: 0,
    },
    casinoWiningsTotalAmount: {
      type: Number,
      default: 0,
    },
    dayDate: {
      type: Date,
    },
    dayDateString: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = daysWiseBetTotalAmountSchema;
