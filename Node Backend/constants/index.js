const { inbox_message } = require("./inboxMessage");

const EVENTS = {
  SOCKET: "SOCKET",
  SIGN_UP: "SIGN_UP",
  SIGN_UP_ADMIN: "SIGN_UP_ADMIN",
  VERIFY_TOKEN: "VERIFY_TOKEN",
  VERIFY_TOKEN_ADMIN: "VERIFY_TOKEN_ADMIN",
  DISCONNECT: "DISCONNECT",
  ACTIVITIES_TRACK: "ACTIVITIES_TRACK",
  GET_SPORTS: "GET_SPORTS",
  GET_SPORTS_DETAILS: "GET_SPORTS_DETAILS",
  GET_MAIN_SPORTS: "GET_MAIN_SPORTS",
  GET_USER_COUNT: "GET_USER_COUNT",
  GET_LIVE_MATCH_COUNT: "GET_LIVE_MATCH_COUNT",
  GET_LIVE_MATCH_COUNT_FOR_VELKI: "GET_LIVE_MATCH_COUNT_FOR_VELKI",
  UPDATE_USER_BALANCE: "UPDATE_USER_BALANCE",
  GET_SCORE_ID: "GET_SCORE_ID",
  GET_DP_WL_COUNT: "GET_DP_WL_COUNT",
};

const MESSAGE = {};

const CASINO_EVENTS = {
  GET_BALANCE: "getBalance",
  BET_PLACE: "bet",
  SETTLE_WIN_LOSS: "settle",
  VOID_BET: "voidBet",
  VOID_SETTLE: "voidSettle",
  CANCEL_BET: "cancelBet",
  GIVE_BONUS: "give",
  RE_SETTLE: "resettle",
  BET_N_SETTLE: "betNSettle",
  CANCEL_BET_N_SETTLE: "cancelBetNSettle",
  ADJUST_BET: "adjustBet",
  UN_SETTLE: "unsettle",
  UN_VOID_BET: "unvoidBet",
  UN_VOID_SETTLE: "unvoidSettle",
  REFUND: "refund",
  FREE_SPIN: "freeSpin",
  TIP: "tip",
  CANCEL_TIP: "cancelTip",
};

const GAME_STATUS = {
  WIN: "WIN",
  START: "Start",
  LOSE: "LOSE",
  VOID: "Void",
  TIE: "TIE",
  CANCEL: "Cancel",
  SUCCESS: "SUCCESS",
  TIP: "TIP",
  CANCEL_TIP: "CANCEL_TIP",
};

const CASINO_NAME = {
  KINGMAKER: "KINGMAKER",
  JILI: "JILI",
  LUDO: "LUDO",
  YL: "YL",
  ESPORTS: "E1SPORT",
  DRAGOONSOFT: "DRAGOONSOFT",
  SV388: "SV388",
  BG: "BG",
  SABA: "SABA",
  FASTSPIN: "FASTSPIN",
  HORSEBOOK: "HORSEBOOK",
  PRAGMATIC: "PT",
  PP: "PP",
  SPADE: "SPADE",
  YESBINGO: "YESBINGO",
  EVOLUTION: "EVOLUTION",
  JDB: "JDB",
  BTG: "BTG",
  NETENT: "NETENT",
  RT: "RT",
  HOTROAD: "HOTROAD",
  NLC: "NLC",
  SPRIBE: "SPRIBE",
  LADYLUCK: "LADYLUCK",
  JOKER: "JOKER",
  VIACASINO: "VIACASINO",
  FC: "FC",
  ROYALGAMING: "ROYALGAMING",
  RT_TABLE: "RT TABLE",
};
const SUB_CASINO_NAME = {
  JILI_TABLE: "TABLE",
};

const USER_LEVEL = {
  COM: "COM",
  AD: "AD",
  SP: "SP",
  SMDL: "SMDL",
  MDL: "MDL",
  DL: "DL",
  PL: "PL",
};

// These are 10 layer
// 1/ Owner (MAIN CONTEOLLER) (O)
// 2/ SUB - OWNER (SUO)
// 3/ WHITELEBEL (WL)
// 4/ Super Admin (SA)
// 5/Admin (A)
// 6/ Sub Admin (SUA)
// 7/ Senior Super (SS)
// 8/ Super (S)
// 9/ Master (M)
// 10/ User (CL)

const USER_LEVEL_NEW = {
  COM: "O",
  SUO: "SUO",
  WL: "WL",
  SP: "SA",
  AD: "A",
  SUA: "SUA",
  SS: "SS",
  S: "S",
  M: "M",
  CL: "CL",
  PL: "PL",
};

const USER_LEVEL_NAME = {
  O: "Owner",
  SUO: "Sub Owner",
  WL: "WHITELEBEL",
  SP: "Super Admin",
  A: "Admin",
  SUA: "Sub Admin",
  SS: "Senior Super",
  S: "Super",
  M: "Master",
  CL: "Player",
  PL: "Player",
};

const TRANSACTION_METHOD = {
  BANK: "bank",
  UPI: "upi",
  G_PAY: "google pay",
  P_PAY: "phone pe",
  PAYTM: "PAYTM",
  bKash: "bKash",
  Rocket: "Rocket",
  Nagad: "Nagad",
  Ok_Wallet: "Ok Wallet",
  SureCash: "SureCash",
  Upay: "Upay",
  Tap: "Tap",
  USDT_TRC20: "USDT TRC20",
  BTC: "BTC",
  Local_Bank: "Local Bank",
};

const ONLINE_PAYMENT = {
  OFFLINE_DEPOSIT: "Offline Deposit",
  DEPOSIT: "Deposit",
  WITHDRAWAL: "Withdrawal",
  OFFLINE_WITHDRAWAL: "Offline Withdrawal",
};

// jili game code for only round id winner
const GAME_CODE_FOR_ROUND_ID = {
  Jackpot_Bingo: "JILI-TABLE-024",
  Andar_Bahar: "JILI-TABLE-003",
  AK47: "JILI-TABLE-002",
  TeenPatti_Joker: "JILI-TABLE-010",
  TeenPatti: "JILI-TABLE-001",
  Bingo_Carnaval: "JILI-TABLE-019",
};

const SPORT_TYPE = {
  CRICKET: "cricket",
  SOCCER: "soccer",
  TENNIS: "tennis",
  ESOCCER: "esoccer",
  BASKETBALL: "basketball",
};

module.exports = {
  EVENTS,
  MESSAGE,
  CASINO_EVENTS,
  CASINO_NAME,
  GAME_STATUS,
  SUB_CASINO_NAME,
  USER_LEVEL,
  TRANSACTION_METHOD,
  GAME_CODE_FOR_ROUND_ID,
  USER_LEVEL_NEW,
  SPORT_TYPE,
  ONLINE_PAYMENT,
  INBOX_MESSAGE: inbox_message,
  USER_LEVEL_NAME,
};
