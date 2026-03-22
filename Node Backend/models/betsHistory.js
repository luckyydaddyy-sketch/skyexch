const mongoose = require("mongoose");
const { SPORT_TYPE } = require("../constants");

const betsHistorySchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      index: true,
      ref: "users",
      required: true,
    },
    matchId: {
      type: mongoose.Schema.Types.ObjectId,
      index: true,
      ref: "sports",
      required: true,
    },
    // sport,casion
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
        "casino",
      ],
    },
    /*
    exchange = 
    sportsBook = 
    bookMark = 
    binary = 
    */
    betType: {
      type: String,
      index: true,
      required: true,
      enum: ["odds", "bookMark", "session", "premium", "casino"], // "exchange",
      // enum: ["ODDS", "BOOKMAKER", "SESSION", "PREMIUM", "CASINO"],
    },
    betSide: {
      type: String,
      index: true,
      required: true,
      enum: ["back", "lay", "yes", "no"],
    },
    // start, end, cancel
    // 'pending','running','completed'
    betStatus: {
      type: String,
      index: true,
      default: "pending",
      enum: ["pending", "running", "completed"],
    },
    winnerSelection: [
      {
        type: String,
        default: [],
      },
    ],
    // name: {
    //   type: String,
    //   required: true,
    // },
    selection: {
      type: String,
      index: true,
      required: true,
    },
    selectionId: {
      type: Number,
      index: true,
    },
    runnerName: {
      type: String,
    },
    subSelection: {
      type: String,
      index: true,
      default: "",
    },
    betId: {
      type: Number,
      default: 0,
    },
    betPlaced: {
      type: Number,
      required: true,
    },
    // boot amount
    stake: {
      type: Number,
      required: true,
    },
    // bet amount from api : maybe
    oddsUp: {
      type: Number,
      required: true,
    },
    // bet amount from api : maybe
    oddsDown: {
      type: Number,
      required: true,
    },
    fancyYes: { type: Number, default: 0 },
    fancyNo: { type: Number, default: 0 },
    profit: {
      type: Number,
      required: true,
    },
    exposure: {
      type: Number,
      required: true,
    },
    // trascation type // me win or not this match
    tType: {
      type: String,
      default: "",
      enum: ["win", "lost", "cancel", "draw", ""],
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    teams: {
      type: String,
      default: "",
    },
    // this match winners
    winner: {
      type: String,
      index: true,
      default: "",
    },
    isMatched: {
      type: Boolean,
      default: true,
    },
    oldOdds: {
      type: Number,
      default: 0,
    },
    isCheat: {
      type: Boolean,
      default: false,
    },
    winnerCount:{
      type: Number,
      default: 0,
    },
    rollBackCount:{
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
    // // use only for casino
    // userName: {
    //   type: String,
    //   index: true,
    //   default: "",
    // },
    // roundId: {
    //   type: String,
    //   index: true,
    //   default: "",
    // },
    // gameType: {
    //   type: String,
    //   default: "",
    // },
    // gameCode: {
    //   type: String,
    //   default: "",
    // },
    // platform: {
    //   type: String,
    //   default: "",
    // },
    // gameName: {
    //   type: String,
    //   default: "",
    // },
    // refPlatformTxId: {
    //   type: String,
    //   default: "",
    // },
    // platformTxId: {
    //   type: String,
    //   default: "",
    // },
    // gameStatus: {
    //   type: String,
    //   enum: [
    //     GAME_STATUS.CANCEL,
    //     GAME_STATUS.LOSE,
    //     GAME_STATUS.START,
    //     GAME_STATUS.TIE,
    //     GAME_STATUS.VOID,
    //     GAME_STATUS.WIN,
    //   ],
    //   default: GAME_STATUS.START,
    // },
  },
  {
    timestamps: true,
  }
);

module.exports = betsHistorySchema;
