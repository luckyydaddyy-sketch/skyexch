const joi = require("joi");
const mongo = require("../../../config/mongodb");
const {
  betsHistoryDataFiter,
  casinoMatchHistoryFilter,
} = require("../../utils/filterData");

const payload = {
  body: joi.object().keys({
    // id: joi.string().optional(),
    // matchId: joi.string().required(),
    // betType: joi.string().required(),
    // selection: joi.string().optional(),

    // id: joi.string().required(), // user id
    // bet: joi.string().valid("active", "history").required(),
    // betStatus: joi.string().optional(),
    betType: joi
      .string()
      .valid(
        "exchange",
        "sportsBook",
        "bookMark",
        "binary",
        "fancybet",
        "casino",
        "all"
      )
      .required(),
    filter: joi.string().valid("all", "date", "today", "yesterday").optional(),
    to: joi.string().optional(),
    from: joi.string().optional(),
  }),
};

async function handler({ body, user }) {
  console.log("statementBetView ::: body", body);
  //   const { id, matchId, selection, betType } = body;
  const { betType, filter, to, from } = body;
  const { userId } = user;
  let query = {};
  if (betType && betType !== "casino") {
    query.betStatus = "completed";
    query.userId = userId;
  } else {
    // query.userObjectId = userId;
  }
  let matchType = "Match Odds";
  if (betType && betType === "bookMark") {
    query.betType = "bookMark";
    matchType = "bookMark";
  } else if (betType && betType === "exchange") {
    query.betType = "odds";
    matchType = "Match Odds";
  } else if (betType && betType === "fancybet") {
    query.betType = "session";
    matchType = "fancy";
  } else if (betType && betType === "sportsBook") {
    query.betType = "premium";
    matchType = "premium";
  } else if (betType && betType === "binary") {
    query.betType = "binary";
  }

  if (filter && filter === "date" && to && from) {
    const { endDate, startDate } = getStartEndDateTime(to, from);
    query.createdAt = {
      $gte: startDate,
      $lte: endDate,
    };
  } else if ((filter && filter === "today") || filter === "yesterday") {
    const { endDate, startDate } = getDate(filter);
    query.createdAt = {
      $gte: startDate,
      $lte: endDate,
    };
  } else if (filter && filter === "isMatched") {
    query.isMatched = true;
  } else if (filter && filter === "UnMatched") {
    query.isMatched = false;
  }

  console.log("statementBetView ::: query", query);
  let betObject = [];

  if (betType && betType !== "casino") {
    const matchIds = await mongo.bettingApp
      .model(mongo.models.betsHistory)
      .distinct({
        field: "matchId",
        query,
      });

    for await (const matchId of matchIds) {
      const sportDetails = await mongo.bettingApp
        .model(mongo.models.sports)
        .findOne({
          query: { _id: matchId },
          select: {
            startDate: 1,
            name: 1,
            type: 1,
          },
        });
      query.matchId = matchId;
      let betInfo = await mongo.bettingApp
        .model(mongo.models.betsHistory)
        .find({
          query,
        });
      betInfo = await betsHistoryDataFiter(betInfo);

      let total = 0;
      let backAmount = 0;
      let layAmount = 0;
      let tempBetInfo = [];
      for await (const bet of betInfo) {
        if (betType === "premium") {
          if (bet.winner.includes("cancel")) {
            bet.tType = "cancel";
          } else if (bet.winner.includes(bet.subSelection)) {
            backAmount += bet.profit;
            total += bet.profit;
            bet.tType = "win";
          } else {
            backAmount -= bet.exposure;
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
              backAmount += bet.profit;
              total += bet.profit;
            } else {
              layAmount += bet.betPlaced;
              total += bet.betPlaced;
              bet.profit = bet.betPlaced;
            }
          } else if (bet.tType === "lost") {
            if (bet.betSide === "yes") {
              backAmount -= bet.betPlaced;
              total -= bet.betPlaced;
              bet.profit = -bet.betPlaced;
            } else {
              layAmount -= bet.profit;
              total -= bet.profit;
            }
          }
        } else {
          if (bet.winner === "cancel") {
            bet.tType = "cancel";
          } else if (bet.betSide === "back") {
            if (bet.selection === bet.winner) {
              backAmount += bet.profit;
              total += bet.profit;
              bet.tType = "win";
            } else {
              bet.profit = -bet.exposure;
              backAmount -= bet.exposure;
              total -= bet.exposure;
              bet.tType = "lost";
            }
          } else if (bet.selection !== bet.winner) {
            bet.exposure = bet.betPlaced;
            bet.profit = bet.betPlaced;
            total += bet.exposure;
            layAmount += bet.exposure;
            bet.tType = "win";
          } else {
            layAmount -= bet.profit;
            total -= bet.profit;
            bet.tType = "lost";
          }
        }

        tempBetInfo.push(bet);
      }
      sportDetails.total = total;
      sportDetails.backAmount = backAmount;
      sportDetails.layAmount = layAmount;
      sportDetails.bets = tempBetInfo;
      sportDetails.matchType = matchType;

      betObject.push(sportDetails);
    }
  } else {
    const casinoMatchCode = await mongo.bettingApp
      .model(mongo.models.casinoMatchHistory)
      .distinct({
        field: "gameCode",
        query,
      });

    for await (const gameCode of casinoMatchCode) {
      query.gameCode = gameCode;

      let casinoMatchList = await mongo.bettingApp
        .model(mongo.models.casinoMatchHistory)
        .find({
          query,
        });

      const sportDetails = {
        type: "casino",
        name: casinoMatchList[0].gameName,
        matchType: casinoMatchList[0].gameType,
        startDate: casinoMatchList[0].createdAt,
      };
      casinoMatchList = await casinoMatchHistoryFilter(casinoMatchList);

      let total = 0;
      let backAmount = 0;
      let layAmount = 0;

      casinoMatchList.forEach((bet) => {
        if (bet.tType === "lost") {
          total -= bet.exposure;
          backAmount -= bet.exposure;
        } else if (bet.tType === "win") {
          total += bet.profit;
          backAmount += bet.profit;
        }
      });
      sportDetails.total = total;
      sportDetails.backAmount = backAmount;
      sportDetails.layAmount = layAmount;
      sportDetails.bets = casinoMatchList;

      betObject.push(sportDetails);
    }
  }

  //   let betInfo = await mongo.bettingApp.model(mongo.models.betsHistory).find({
  //     query,
  //   });

  //   betInfo = await betsHistoryDataFiter(betInfo);

  //   let total = 0;
  //   let tempBetInfo = [];
  //   for await (const bet of betInfo) {
  //     if (betType === "premium") {
  //       if (bet.winner === "cancel") {
  //         bet.tType = "cancel";
  //       } else if (bet.subSelection === bet.winner) {
  //         total += bet.profit;
  //         bet.tType = "win";
  //       } else {
  //         total -= bet.exposure;
  //         bet.profit = -bet.betPlaced;
  //         bet.tType = "lost";
  //       }
  //     } else if (betType === "session") {
  //       if (bet.winner === "cancel") {
  //         total = 0;
  //         // bet.tType = "cancel";
  //       } else if (bet.tType === "win") {
  //         if (bet.betSide === "yes") {
  //           total += bet.profit;
  //         } else {
  //           total += bet.betPlaced;
  //           bet.profit = bet.betPlaced;
  //         }
  //       } else if (bet.tType === "lost") {
  //         if (bet.betSide === "yes") {
  //           total -= bet.betPlaced;
  //           bet.profit = -bet.betPlaced;
  //         } else {
  //           total -= bet.profit;
  //         }
  //       }
  //     } else {
  //       if (bet.winner === "cancel") {
  //         bet.tType = "cancel";
  //       } else if (bet.betSide === "back") {
  //         if (bet.selection === bet.winner) {
  //           total += bet.profit;
  //           bet.tType = "win";
  //         } else {
  //           bet.profit = -bet.exposure;
  //           total -= bet.exposure;
  //           bet.tType = "lost";
  //         }
  //       } else if (bet.selection !== bet.winner) {
  //         bet.exposure = bet.betPlaced;
  //         bet.profit = bet.betPlaced;
  //         total += bet.exposure;
  //         bet.tType = "win";
  //       } else {
  //         total -= bet.profit;
  //         bet.tType = "lost";
  //       }
  //     }

  //     tempBetInfo.push(bet);
  //   }
  //   console.log("statementBetView :: total ::: ", total);
  //   console.log("statementBetView :: betInfo :: ", tempBetInfo);
  betObject = betObject.sort(
    (a, b) => new Date(b.startDate) - new Date(a.startDate)
  );
  betObject.msg = "player Profit lost Info!";
  // const sendObject = {
  //   msg: "player Profit lost Info!",
  //   betInfo: betObject,
  //   // total: Number(total.toFixed(2)),
  // };
  return betObject;
}

module.exports = {
  payload,
  handler,
  auth: true,
};
