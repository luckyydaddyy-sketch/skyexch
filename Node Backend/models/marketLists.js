const mongoose = require("mongoose");

const marketListsSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    betFairId: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = marketListsSchema;
