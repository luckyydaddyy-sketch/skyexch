const mongoose = require("mongoose");

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
    maxProfit: {
      type: Number,
      default: 0,
    },
    betDelay: {
      type: Number,
      default: 0,
    },
    maxPrice: {
      type: Number,
      default: 0,
    },
    isShow: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const cricket = mongoose.Schema(
  {
    oddsLimit: limitSchema,
    bet_odds_limit: limitSchema,
    bet_bookmaker_limit: limitSchema,
    bet_fancy_limit: limitSchema,
    bet_premium_limit: limitSchema,
  },
  { _id: false }
);
const soccer = mongoose.Schema(
  {
    oddsLimit: limitSchema,
    bet_odds_limit: limitSchema,
    bet_bookmaker_limit: limitSchema,
    bet_premium_limit: limitSchema,
  },
  { _id: false }
);
const tennis = mongoose.Schema(
  {
    oddsLimit: limitSchema,
    bet_odds_limit: limitSchema,
    bet_bookmaker_limit: limitSchema,
    bet_premium_limit: limitSchema,
  },
  { _id: false }
);

const setAutoSportsResult = mongoose.Schema(
  {
    cricket: {
      type: Boolean,
      default: false,
    },
    soccer: {
      type: Boolean,
      default: false,
    },
    tennis: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const defaultSettingSchema = mongoose.Schema(
  {
    cricket,
    soccer,
    tennis,
    setAutoSportsResult,
    setAutoSportsAdd: setAutoSportsResult,
  },
  {
    timestamps: true,
  }
);

module.exports = defaultSettingSchema;