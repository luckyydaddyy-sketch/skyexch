const mongoose = require("mongoose");
const { SPORT_TYPE } = require("../constants");

const statusSchema = mongoose.Schema(
  {
    bookmaker: {
      type: Boolean,
      default: true,
    },
    fancy: {
      type: Boolean,
      default: true,
    },
    premium: {
      type: Boolean,
      default: true,
    },
    status: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false }
);
const suspendSchema = mongoose.Schema(
  {
    bookmaker: {
      type: Boolean,
      default: false,
    },
    fancy: {
      type: Boolean,
      default: false,
    },
    premium: {
      type: Boolean,
      default: false,
    },
    odds: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);
const limitSchema = mongoose.Schema(
  {
    min: {
      type: Number,
      default: 0,
    },
    max: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);
const maxProfit = mongoose.Schema(
  {
    odds: {
      type: Number,
      default: 2500,
    },
    bookmaker: {
      type: Number,
      default: 5000,
    },
    fancy: {
      type: Number,
      default: 3300,
    },
    premium: {
      type: Number,
      default: 100,
    },
  },
  { _id: false }
);

const sportsSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    openDate: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      index: true,
      required: true,
    },
    type: {
      type: String,
      index: true,
      required: true,
      enum: [
        SPORT_TYPE.CRICKET,
        SPORT_TYPE.SOCCER,
        SPORT_TYPE.TENNIS,
        SPORT_TYPE.ESOCCER,
        SPORT_TYPE.BASKETBALL,
      ],
    },
    gameId: {
      type: Number,
      index: true,
      required: true,
    },
    marketId: {
      type: String,
      index: true,
      required: true,
    },
    activeStatus: statusSchema,
    suspend: suspendSchema,
    // 9Wicket Specific Flags
    f: { type: Boolean, default: false },
    m1: { type: Boolean, default: false },
    p: { type: Boolean, default: false },
    pf: { type: Boolean, default: false },
    tv: { type: Boolean, default: false },
    ematch: { type: Number, default: 0 },
    // user bet limit on prize hish show bet amount
    oddsLimit: limitSchema,
    // user bet limit on place bet
    bet_odds_limit: limitSchema,
    bet_bookmaker_limit: limitSchema,
    bet_fancy_limit: limitSchema,
    bet_premium_limit: limitSchema,
    max_profit_limit: maxProfit,
    winner: {
      type: String,
      index: true,
      default: "",
    },
    winnerSelection: [
      {
        type: String,
        default: [],
      },
    ],
    sportradarApiSiteEventId: {
      type: String,
      default: "",
    },
    sportradarSportId: {
      type: String,
      default: "",
    },
    gameStatus: {
      type: String,
      index: true,
      default: "pending",
      enum: ["pending", "running", "completed"],
    },
    teams: {
      type: String,
      default: "",
    },
    // this status use for main sport to active or not
    status: {
      type: Boolean,
      index: true,
      default: false,
    },
    Turnament: {
      type: String,
      default: "",
    },
    TurnamentId: {
      type: Number,
      default: 0,
    },
    settlementType: {
      type: String,
      default: "manual",
    },
    settledBy: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    settledAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = sportsSchema;
