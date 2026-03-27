const mongoose = require("mongoose");

const dashboardImagesSchema = mongoose.Schema(
  {
    domain: 
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "websites",
        required: true,
      },
    title: {
      type: String,
      default: "",
    },
    image: {
      type: String,
      required: true,
    },
    link: {
      type: String,
      default: "#",
    },
    Width: {
      type: String,
      default: "squareSize",
      enum: ["fullSize", "halfWidth", "squareSize"],
    },
    sort: {
      type: Number,
      default: 1,
    },
    type: {
      type: String,
      default: "casino",
      enum: ["casino", "sports"],
    },
    platform: {
      type: String,
      default: "",
    },
    gameType: {
      type: String,
      default: "",
    },
    gameCode: {
      type: String,
      default: "",
    },
    gameName: {
      type: String,
      default: "",
    },
    gameLimit: {
      type: String,
      default: "",
    },
    catalog: {
      type: String,
      default: "",
    },
    isLatest: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = dashboardImagesSchema;
