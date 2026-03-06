const mongoose = require("mongoose");

const statementsSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      index: true,
      required: true,
    },
    openSportBetUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      default: null,
    },
    credit: {
      type: Number,
      required: true,
    },
    debit: {
      type: Number,
      required: true,
    },
    balance: {
      type: Number,
      required: true,
    },
    Remark: {
      type: String,
      default: "",
    },
    // nothing for use
    type: {
      type: String,
      default: "",
      enum: ["commission", "casino", "sport", "", "player", "agent", ""],
    },
    // only For Casino
    betAmount: {
      type: Number,
      default: 0,
    },
    matchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "sports",
      default: null,
    },
    casinoMatchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "casinoMatchHistory",
      default: null,
    },
    casinoBonusId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "casinoBonus",
      default: null,
    },
    betType: {
      type: String,
      default: "",
      enum: ["odds", "bookMark", "session", "premium", "casino", ""], // "exchange",
      // enum: ["ODDS", "BOOKMAKER", "SESSION", "PREMIUM", "CASINO"],
    },
    withdrawalsId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      ref: "withdrawals",
    },
    from: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      refPath: "fromModel",
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      refPath: "toModel",
    },
    fromModel: {
      type: String,
      default: "",
      // enum: ['admins', 'users']
    },
    toModel: {
      type: String,
      default: "",
      // enum: ['admins', 'users']
    },
    selection: {
      type: String,
      default: "",
    },
    // only For Casino
    amountOfBalance: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = statementsSchema;
