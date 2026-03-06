const mongoose = require("mongoose");

const activitiesSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      index: true,
      required: true,
    },
    action: {
      type: String,
      required: true,
    },
    ip_address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      default:""
    },
    ISP: {
      type: String,
      default:""
    },
    state: {
      type: String,
      default:""
    },
    country: {
      type: String,
      default:""
    },
    browser_detail: {
      type: String,
      required: true,
    },
    systemDetail: {
      type: String,
      required: true,
    },
    data: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = activitiesSchema;
