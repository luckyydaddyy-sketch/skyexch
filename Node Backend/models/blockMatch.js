const mongoose = require("mongoose");

const blockMatchSchema = mongoose.Schema(
  {
    userId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        index: true,
        ref: "admins",
        required: true,
      },
    ],
    matchId: {
      type: mongoose.Schema.Types.ObjectId,
      index: true,
      ref: "sports",
      required: true,
    },
    blockAll: {
      type: Boolean,
      default: false,
    },
    blockOdds: {
      type: Boolean,
      default: false,
    },
    blockBookMaker: {
      type: Boolean,
      default: false,
    },
    blockFancy: {
      type: Boolean,
      default: false,
    },
    blockPremium: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = blockMatchSchema;
