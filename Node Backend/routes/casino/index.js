const express = require("express");
const { CASINO_EVENTS } = require("../../constants");

const getBalance = require("../../controllers/casinoApi/getBalance");
const placeBet = require("../../controllers/casinoApi/placeBet");
const settleWin = require("../../controllers/casinoApi/settleWin");
const voidBet = require("../../controllers/casinoApi/voidBet");
const voidSettle = require("../../controllers/casinoApi/voidSettle");
const cancelBet = require("../../controllers/casinoApi/cancelBet");
const giveBonus = require("../../controllers/casinoApi/giveBonus");
const resettle = require("../../controllers/casinoApi/resettle");
const betNsettle = require("../../controllers/casinoApi/betNsettle");
const cancelBetNsettle = require("../../controllers/casinoApi/cancelBetNsettle");
const adjustBet = require("../../controllers/casinoApi/adjustBet");
const unSettleBet = require("../../controllers/casinoApi/unSettleBet");
const unVoidBet = require("../../controllers/casinoApi/unVoidBet");
const unVoidSettle = require("../../controllers/casinoApi/unVoidSettle");
const refund = require("../../controllers/casinoApi/refund");
const freeSpin = require("../../controllers/casinoApi/freeSpin");
const tip = require("../../controllers/casinoApi/tip");
const cancelTip = require("../../controllers/casinoApi/cancelTip");

const router = express.Router();

/**
 * API for test Route
 */

router.post("/callBack", (req, res) => {
  console.log("test call ------->");
  console.log("req :::: ");
  console.log(req.body);
  let { key, message } = req.body;
  console.log("req :::: req.message ", typeof message);
  message = typeof message === "string" ? JSON.parse(message) : message;

  switch (message.action) {
    case CASINO_EVENTS.GET_BALANCE:
      getBalance.handler(req, res);
      break;
    case CASINO_EVENTS.BET_PLACE:
      placeBet.handler(req, res);
      break;
    case CASINO_EVENTS.SETTLE_WIN_LOSS:
      settleWin.handler(req, res);
      break;
    case CASINO_EVENTS.VOID_BET:
      voidBet.handler(req, res);
      break;
    case CASINO_EVENTS.VOID_SETTLE:
      voidSettle.handler(req, res);
      break;
    case CASINO_EVENTS.CANCEL_BET:
      cancelBet.handler(req, res);
      break;
    case CASINO_EVENTS.GIVE_BONUS:
      giveBonus.handler(req, res);
      break;
    case CASINO_EVENTS.RE_SETTLE:
      resettle.handler(req, res);
      break;
    case CASINO_EVENTS.BET_N_SETTLE:
      betNsettle.handler(req, res);
      break;
    case CASINO_EVENTS.CANCEL_BET_N_SETTLE:
      cancelBetNsettle.handler(req, res);
      break;
    case CASINO_EVENTS.ADJUST_BET:
      adjustBet.handler(req, res);
      break;
    case CASINO_EVENTS.UN_SETTLE:
      unSettleBet.handler(req, res);
      break;
    case CASINO_EVENTS.UN_VOID_BET:
      unVoidBet.handler(req, res);
      break;
    case CASINO_EVENTS.UN_VOID_SETTLE:
      unVoidSettle.handler(req, res);
      break;
    case CASINO_EVENTS.REFUND:
      refund.handler(req, res);
      break;
    case CASINO_EVENTS.FREE_SPIN:
      freeSpin.handler(req, res);
      break;
    case CASINO_EVENTS.TIP:
      tip.handler(req, res);
      break;
    case CASINO_EVENTS.CANCEL_TIP:
      cancelTip.handler(req, res);
      break;

    default:
      console.log("get new event :: ", message.action);
      res.send(req.originalUrl);
      break;
  }
});
// this for skyexche7 only
router.post("/sky/callBack", (req, res) => {
  console.log("test call ------->");
  console.log("req :::: ");
  console.log(req.body);
  let { key, message } = req.body;
  console.log("req :::: req.message ", typeof message);
  message = typeof message === "string" ? JSON.parse(message) : message;

  switch (message.action) {
    case CASINO_EVENTS.GET_BALANCE:
      getBalance.handler(req, res);
      break;
    case CASINO_EVENTS.BET_PLACE:
      placeBet.handler(req, res);
      break;
    case CASINO_EVENTS.SETTLE_WIN_LOSS:
      settleWin.handler(req, res);
      break;
    case CASINO_EVENTS.VOID_BET:
      voidBet.handler(req, res);
      break;
    case CASINO_EVENTS.VOID_SETTLE:
      voidSettle.handler(req, res);
      break;
    case CASINO_EVENTS.CANCEL_BET:
      cancelBet.handler(req, res);
      break;
    case CASINO_EVENTS.GIVE_BONUS:
      giveBonus.handler(req, res);
      break;
    case CASINO_EVENTS.RE_SETTLE:
      resettle.handler(req, res);
      break;
    case CASINO_EVENTS.BET_N_SETTLE:
      betNsettle.handler(req, res);
      break;
    case CASINO_EVENTS.CANCEL_BET_N_SETTLE:
      cancelBetNsettle.handler(req, res);
      break;
    case CASINO_EVENTS.ADJUST_BET:
      adjustBet.handler(req, res);
      break;
    case CASINO_EVENTS.UN_SETTLE:
      unSettleBet.handler(req, res);
      break;
    case CASINO_EVENTS.UN_VOID_BET:
      unVoidBet.handler(req, res);
      break;
    case CASINO_EVENTS.UN_VOID_SETTLE:
      unVoidSettle.handler(req, res);
      break;
    case CASINO_EVENTS.REFUND:
      refund.handler(req, res);
      break;
    case CASINO_EVENTS.FREE_SPIN:
      freeSpin.handler(req, res);
      break;
    case CASINO_EVENTS.TIP:
      tip.handler(req, res);
      break;
    case CASINO_EVENTS.CANCEL_TIP:
      cancelTip.handler(req, res);
      break;

    default:
      console.log("get new event :: ", message.action);
      res.send(req.originalUrl);
      break;
  }
});

router.post("/v1/callBack", async (req, res) => {
  res.send("ok").status(200);
});
router.post("/gap/callBack", async (req, res) => {
  res.send("ok").status(200);
});
module.exports = router;
