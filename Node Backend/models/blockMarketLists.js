const mongoose = require("mongoose");

const blockMarketListsSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      index: true,
      ref: "admins",
      required: true,
    },
    userIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        index: true,
        ref: "admins",
        required: true,
      },
    ],
    marketId: {
      type: mongoose.Schema.Types.ObjectId,
      index: true,
      ref: "marketLists",
      required: true,
    },
    isBlock: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = blockMarketListsSchema;
