const joi = require("joi");
const mongo = require("../../../config/mongodb");
const { betsHistoryDataFiter } = require("../../utils/filterData");

const payload = {
  body: joi.object().keys({
    id: joi.string().optional(),
    matchId: joi.string().required(),
    betType: joi.string().required(),
    selection: joi.string().optional(),
  }),
};

async function handler({ body, user }) {
  console.log("statementBetView ::: body", body);
  const { id, matchId, selection, betType } = body;
  const { userId } = user;

  const query = {
    userId,
    betType,
    matchId: mongo.ObjectId(matchId),
  };

  if (id) query.userId = mongo.ObjectId(id);
  if (betType === "session" || betType === "premium")
    query.selection = selection;

  console.log("statementBetView ::: query", query);
  let betInfo = await mongo.bettingApp.model(mongo.models.betsHistory).find({
    query,
    // select: {},
  });

  betInfo = await betsHistoryDataFiter(betInfo);

  let total = 0;
  let tempBetInfo = [];
  for await (const bet of betInfo) {
    if (betType === "premium") {
      if (bet.winner.includes("cancel")) {
        bet.tType = "cancel";
      } else if (bet.winner.includes(bet.subSelection)) {
        total += bet.profit;
        bet.tType = "win";
      } else {
        total -= bet.exposure;
        bet.profit = -bet.betPlaced;
        bet.tType = "lost";
      }
    } else if (betType === "session") {
      if (bet.winner === "cancel") {
        total = 0;
        // bet.tType = "cancel";
      } else if (bet.tType === "win") {
        if (bet.betSide === "yes") {
          total += bet.profit;
        } else {
          total += bet.betPlaced;
          bet.profit = bet.betPlaced;
        }
      } else if (bet.tType === "lost") {
        if (bet.betSide === "yes") {
          total -= bet.betPlaced;
          bet.profit = -bet.betPlaced;
        } else {
          total -= bet.profit;
        }
      }
    } else {
      if (bet.winner === "cancel") {
        bet.tType = "cancel";
      } else if (bet.betSide === "back") {
        if (bet.selection === bet.winner) {
          total += bet.profit;
          bet.tType = "win";
        } else {
          bet.profit = -bet.exposure;
          total -= bet.exposure;
          bet.tType = "lost";
        }
      } else if (bet.selection !== bet.winner) {
        bet.exposure = bet.betPlaced;
        bet.profit = bet.betPlaced;
        total += bet.exposure;
        bet.tType = "win";
      } else {
        total -= bet.profit;
        bet.tType = "lost";
      }
    }

    tempBetInfo.push(bet);
  }
  console.log("statementBetView :: total ::: ", total);
  console.log("statementBetView :: betInfo :: ", tempBetInfo);

  const sendObject = {
    msg: "statement Bet View!",
    betInfo: tempBetInfo,
    total: Number(total.toFixed(2)),
  };
  return sendObject;
}

module.exports = {
  payload,
  handler,
  auth: true,
};
