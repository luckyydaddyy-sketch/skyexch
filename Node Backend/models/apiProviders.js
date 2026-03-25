const mongoose = require("mongoose");

const apiProviderSchema = new mongoose.Schema(
  {
    activeSportsProvider: {
      type: String,
      default: "FASTODDS",
      enum: ["FASTODDS", "NINE_WICKET"],
    },
    activeCasinoProvider: {
      type: String,
      default: "AWC",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = apiProviderSchema;
