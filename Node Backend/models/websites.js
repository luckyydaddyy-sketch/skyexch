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
const esoccer = mongoose.Schema(
  {
    oddsLimit: limitSchema,
    bet_odds_limit: limitSchema,
    bet_bookmaker_limit: limitSchema,
    bet_premium_limit: limitSchema,
  },
  { _id: false }
);
const basketball = mongoose.Schema(
  {
    oddsLimit: limitSchema,
    bet_odds_limit: limitSchema,
    bet_bookmaker_limit: limitSchema,
    bet_premium_limit: limitSchema,
  },
  { _id: false }
);

const websitesSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    domain: {
      type: String,
      index: true,
      // required: true,
      default: "",
    },
    favicon: {
      type: String,
      // required: true,
      default: "",
    },
    logo: {
      type: String,
      // required: true,
      default: "",
    },
    adminLogo: {
      type: String,
      // required: true,
      default: "",
    },
    loginImage: {
      type: String,
      // required: true,
      default: "",
    },
    mobileLoginImage: {
      type: String,
      // required: true,
      default: "",
    },
    agentListUrl: {
      type: String,
      // required: true,
      default: "",
    },
    email: [
      {
        type: String,
        required: true,
      },
    ],
    whatsapp: [
      {
        type: String,
        required: true,
      },
    ],
    telegram: [
      {
        type: String,
        required: true,
      },
    ],
    instagram: [
      {
        type: String,
        required: true,
      },
    ],
    skype: [
      {
        type: String,
        required: true,
      },
    ],
    facebook: {
      type: String,
      default: "",
    },
    signup: {
      type: String,
      default: "",
    },
    appLink: {
      type: String,
      default: "",
    },
    SABALink: {
      type: String,
      default: "",
    },
    validationLink: {
      type: String,
      default: "",
    },
    maintenanceMessage: {
      type: String,
      default: "",
    },
    titleMaintenanceMessage: {
      type: String,
      default: "",
    },
    maintenanceDate: {
      type: Date,
    },
    agentMessage: {
      type: String,
      default: "",
    },
    userMessage: {
      type: String,
      default: "",
    },
    titleUserMessage: {
      type: String,
      default: "",
    },
    userMessageDate: {
      type: Date,
    },
    adminStatus: {
      type: Boolean,
      default: true,
    },
    currency: {
      type: String,
      default: "PTH",
    },
    theme: {
      type: String,
      default: "sky", // Emerald
    },
    colorSchema: {
      type: String,
      default: "yellow",
    },
    status: {
      type: Boolean,
      default: true,
    },
    change_password_on_first_login: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    isMaintenance: {
      type: Boolean,
      default: false,
    },
    cricket,
    soccer,
    tennis,
    esoccer,
    basketball
  },
  {
    timestamps: true,
  }
);

module.exports = websitesSchema;
