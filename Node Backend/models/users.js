const mongoose = require("mongoose");

const delaySchema = mongoose.Schema(
  {
    bookmaker: {
      type: Number,
      default: 0,
    },
    fancy: {
      type: Number,
      default: 0,
    },
    premium: {
      type: Number,
      default: 0,
    },
    odds: {
      type: Number,
      default: 0,
    },
    soccer: {
      type: Number,
      default: 0,
    },
    tennis: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const userSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      default: "",
      index: true,
    },
    lastName: {
      type: String,
      default: "",
      index: true,
    },
    commission: {
      type: Number,
      default: 0,
    },
    commissionAmount: {
      type: Number,
      default: 0,
    },
    agent_level: {
      type: String,
      default: "PL",
    },
    user_name: {
      type: String,
      index: true,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      default: "",
      index: true,
    },
    newPassword: {
      type: Boolean,
      default: true,
    },
    password: {
      type: String,
      index: true,
      required: true,
      trim: true,
      minlength: 8,
    },
    email_verified_at: {
      type: Date,
      default: null,
    },
    domain: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "websites",
        default: [],
      },
    ],
    // limit for add agent and playar
    limit: {
      type: Number,
      default: 0,
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admins",
      default: null,
      index: true,
    },
    whoAdd: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "admins",
        default: null,
        index: true,
      },
    ],
    mobileNumber: {
      type: Number,
      default: "",
    },
    status: {
      type: String,
      default: "active",
      enum: ["active", "suspend", "locked"],
    },
    balance: {
      // available_balance
      type: Number,
      default: 0,
    },
    remaining_balance: {
      type: Number,
      default: 0,
    },
    // je amount bet ma add hoy e
    exposure: {
      type: Number,
      default: 0,
    },
    cumulative_pl: {
      type: Number,
      default: 0,
    },
    ref_pl: {
      type: Number,
      default: 0,
    },
    credit_ref: {
      type: Number,
      default: 0,
    },
    exposer_limit: {
      type: Number,
      default: 0,
    },
    rolling_delay: {
      type: Boolean,
      default: false,
    },
    isCasinoUser: {
      type: Boolean,
      default: false,
    },
    casinoUserName: {
      type: String,
      default: "",
    },
    currency: {
      type: String,
      default: "",
    },
    delay: delaySchema,
    socketId: {
      type: String,
      default: "",
    },
    sportWinLimit: {
      type: Number,
      default: 0,
    },
    sportWinings: {
      type: Number,
      default: 0,
    },
    casinoWinings: {
      type: Number,
      default: 0,
    },
    isRefferCode: {
      type: Boolean,
      default: false,
    },
    refferCode: {
      type: String,
      default: 0,
    },
    sportWiningsTotalAmount: {
      type: Number,
      default: 0,
    },
    casinoWiningsTotalAmount: {
      type: Number,
      default: 0,
    },
    sportWiningsTotalAmountMonth: {
      type: Number,
      default: 0,
    },
    casinoWiningsTotalAmountMonth: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = userSchema;
