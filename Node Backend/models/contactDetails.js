const mongoose = require("mongoose");;

const contactDetailsSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admins",
      default: null,
      index: true,
    },
    bonus: {
      type: Number,
      default: 0,
    },
    deposit_min: {
      type: Number,
      default: 0,
    },
    deposit_max: {
      type: Number,
      default: 0,
    },
    withdrow_min: {
      type: Number,
      default: 0,
    },
    withdrow_max: {
      type: Number,
      default: 0,
    },
    email: {
      type: String,
      default: "",
    },
    whatsapp: {
      type: String,
      default: "",
    },
    facebook: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = contactDetailsSchema;
