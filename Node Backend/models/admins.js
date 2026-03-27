const mongoose = require("mongoose");
const mongo = require("../config/mongodb");
const { USER_LEVEL_NEW } = require("../constants");

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
    },
    lastName: {
      type: String,
      default: "",
    },
    commission: {
      type: Number,
      default: 0,
    },
    agent_level: {
      type: String,
      required: true,
      // enum: ["COM", "AD", "SP", "SMDL", "MDL", "DL"],
      enum: [
        USER_LEVEL_NEW.COM,
        USER_LEVEL_NEW.SUO,
        USER_LEVEL_NEW.WL,
        USER_LEVEL_NEW.SP,
        USER_LEVEL_NEW.AD,
        USER_LEVEL_NEW.SUA,
        USER_LEVEL_NEW.SS,
        USER_LEVEL_NEW.S,
        USER_LEVEL_NEW.M,
      ],
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
    domain: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "websites",
        default: [],
      },
    ],
    // Downline user list
    agent: [
      {
        type: mongoose.Schema.Types.ObjectId,
        default: [],
      },
    ],
    player: [
      {
        type: mongoose.Schema.Types.ObjectId,
        default: [],
      },
    ],
    mobileNumber: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      default: "active",
      enum: ["active", "suspend", "locked"],
    },
    // total creadited balance
    balance: {
      // available_balance
      type: Number,
      default: 0,
    },
    // total = available_balance - player and agent available_balance
    remaining_balance: {
      type: Number,
      default: 0,
    },
    exposure: {
      type: Number,
      default: 0,
    },
    // pl = profit/lost
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
    delay: delaySchema,
    casinoWinLimit: {
      type: Number,
      default: 0,
    },
    casinoWinLimitMin: {
      type: Number,
      default: 0,
    },
    casinoUserBalance: {
      type: Number,
      default: 0,
    },
    casinoWinings: {
      type: Number,
      default: 0,
    },
    refferCode: {
      type: String,
      default: 0,
    },
    socketId: {
      type: String,
      default: "",
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
