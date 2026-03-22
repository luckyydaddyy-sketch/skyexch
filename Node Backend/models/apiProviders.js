const mongoose = require("mongoose");

const apiProviderSchema = new mongoose.Schema(
  {
    activeSportsProvider: {
      type: String,
      default: "FASTODDS",
      enum: ["FASTODDS", "PROVIDER_2"],
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
