const mongoose = require("mongoose");
const { GAME_STATUS } = require("../constants");

const gameInfo = mongoose.Schema(
  {
    roundStartTime: {
      type: String,
      default: "",
    },
    streamerId: {
      type: String,
      default: "",
    },
    tableId: {
      type: mongoose.Schema.Types.Mixed,
      default: -1,
    },
    dealerDomain: {
      type: String,
      default: "",
    },
    denyTime: {
      type: String,
      default: "",
    },
    extension1: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

const casinoMatchHistorySchema = mongoose.Schema(
  {
    userObjectId: {
      type: mongoose.Schema.Types.ObjectId,
      index: true,
      ref: "users",
      required: true,
    },
    gameType: {
      type: String,
      default: "",
    },
    gameCode: {
      type: String,
      default: "",
    },
    platform: {
      type: String,
      default: "",
    },
    gameName: {
      type: String,
      default: "",
    },
    userId: {
      type: String,
      default: "",
    },
    platformTxId: {
      type: String,
      default: "",
    },
    refPlatformTxId: {
      type: String,
      default: "",
    },
    roundId: {
      type: String,
      default: "",
    },
    betType: {
      type: String,
      default: "",
    },
    currency: {
      type: String,
      default: "INR",
    },
    betTime: {
      type: String,
      default: "",
    },
    betAmount: {
      type: Number,
      default: 0,
    },
    isMatchComplete: {
      type: Boolean,
      default: false,
    },
    isRefundComplete: {
      type: Boolean,
      default: false,
    },
    gameStatus: {
      type: String,
      enum: [
        GAME_STATUS.CANCEL,
        GAME_STATUS.LOSE,
        GAME_STATUS.START,
        GAME_STATUS.TIE,
        GAME_STATUS.VOID,
        GAME_STATUS.WIN,
        GAME_STATUS.SUCCESS,
        GAME_STATUS.TIP,
        GAME_STATUS.CANCEL_TIP,
      ],
      default: GAME_STATUS.START,
    },
    winLostAmount: {
      type: Number,
      default: 0,
    },
    winLostAmountForVoidSettel: {
      type: Number,
      default: 0,
    },
    manualiySet: {
      type: Boolean,
      default: false,
    },
    gameInfo,
  },
  {
    timestamps: true,
  }
);

casinoMatchHistorySchema.index({ createdAt: -1 });

module.exports = casinoMatchHistorySchema;
