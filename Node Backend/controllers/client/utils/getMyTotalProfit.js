const mongo = require("../../../config/mongodb");

const getMytotalProfit = async (matchId, betType, selection) => {
  const bet = await mongo.bettingApp.model(mongo.models.betsHistory).find({
    query: {
      matchId: mongo.ObjectId(matchId),
      betType,
      selection: { $ne: selection },
    },
    select: {
      _id: 1,
      userId: 1,
      matchId: 1,
      betType: 1,
      stake: 1,
      winner: 1,
      selection: 1,
      betSide: 1,
      profit: 1,
      exposure: 1,
      betPlaced: 1,
      fancyYes: 1,
      fancyNo: 1,
      oddsUp: 1,
      subSelection: 1,
    },
  });

  const playerProfitLost = 0;

  if (bet.betType === "session") {
    if (bet.winner !== "" && bet.winner !== -2) {
      if (bet.fancyYes === bet.fancyNo) {
        if (bet.betSide === "yes") {
          if (bet.oddsUp <= Number(bet.winner)) {
            playerProfitLost += bet.profit;
          } else {
            playerProfitLost -= bet.exposure;
          }
        } else {
          if (bet.oddsUp > Number(bet.winner)) {
            playerProfitLost += bet.betPlaced;
          } else {
            playerProfitLost -= bet.profit;
          }
        }
      } else {
        if (bet.betSide === "yes") {
          if (bet.oddsUp <= Number(bet.winner)) {
            playerProfitLost += bet.profit;
          } else {
            playerProfitLost -= bet.exposure;
          }
        } else {
          if (bet.oddsUp > Number(bet.winner)) {
            playerProfitLost += bet.betPlaced;
          } else {
            playerProfitLost -= bet.profit;
          }
        }
      }
    } else if (bet.betSide === "yes") {
      playerProfitLost += bet.profit;
    } else {
      playerProfitLost += bet.betPlaced;
    }
  } else if (bet.betType === "premium") {
    if (bet.winner !== "" && !bet.winner.includes("cancel")) {
      if (bet.winner.includes(bet.subSelection)) {
        playerProfitLost += bet.profit;
      } else if (!bet.winner.includes(bet.subSelection)) {
        playerProfitLost -= bet.exposure;
      }
    } else {
      playerProfitLost += bet.profit;
    }
  }

  return playerProfitLost;
};

module.exports = getMytotalProfit;
