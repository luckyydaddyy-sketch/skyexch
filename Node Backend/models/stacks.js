const mongoose = require("mongoose");

const stackSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      index: true,
      required: true,
      ref: "users",
    },
    defaultStack: {
      type: Number,
      default: 10,
    },
    stack: [
      {
        type: Number,
        default: [10, 50, 100, 1000],
      },
    ],
    highLightsOdds: {
      type: Boolean,
      default: false,
    },
    acceptFancyOdds: {
      type: Boolean,
      default: false,
    },
    acceptBookmakerOdds: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = stackSchema;
