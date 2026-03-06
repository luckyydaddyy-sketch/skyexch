const mongo = require("../config/mongodb");

// const betsHistoryNew = []

const betsHistoryNew = [
  /* 1 */
  {
    _id: "63f66800480e2b1d3b60c667",
    userId: "63f666f3480e2b1d3b6088f4",
    matchId: "63f58b9b527d875feae6c559",
    type: "soccer",
    betType: "odds",
    betSide: "back",
    betStatus: "completed",
    winnerSelection: ["Volta Redonda", "Falcon FC"],
    selection: "Falcon FC",
    subSelection: "",
    betId: 0,
    betPlaced: 10,
    stake: 10,
    oddsUp: 4.1,
    oddsDown: 51.93,
    fancyYes: 0,
    fancyNo: 0,
    profit: 31,
    exposure: 10,
    tType: "",
    deleted: false,
    teams: "",
    winner: "Falcon FC",
    createdAt: "2023-02-22T19:07:44.230Z",
    updatedAt: "2023-02-22T19:33:31.555Z",
    __v: 0,
  },
];

// use for all match // only for odds and bookmaker
async function betsLastExposureOdds(userId, selection, matchId, type, betType) {
  const query = {
    matchId: mongo.ObjectId(matchId),
    userId: mongo.ObjectId(userId),
    betType,
    // selection,
    type,
    deleted: false,
  };
  const userInfo = await mongo.bettingApp.model(mongo.models.users).findOne({
    query: { _id: mongo.ObjectId(userId) },
    select: {
      commission: 1,
      balance: 1,
      remaining_balance: 1,
      exposure: 1,
    },
  });

  console.log(selection, " :: userInfo ::: ", userInfo);
  let betList = {};
  if (selection === "Abu Dhabi Knight Riders") {
    betList = await mongo.bettingApp.model(mongo.models.betsHistory).find({
      query,
    });
  } else {
    betList = betsHistoryNew;
  }

  let oldExp = {};

  for await (const bet of betList) {
    const { winnerSelection } = bet;
    console.log(winnerSelection);
    let profileForBet = 0;
    let exposureForBet = 0;
    if (bet.betSide === "back") {
      profileForBet = bet.profit;
      exposureForBet = bet.exposure;
    } else {
      profileForBet = bet.betPlaced;
      exposureForBet = bet.profit;
    }

    console.log("profileForBet :: ", profileForBet);
    console.log("exposureForBet :: ", exposureForBet);
    winnerSelection.forEach((element) => {
      if (element === bet.selection) {
        if (!oldExp[element]) {
          oldExp[element] = profileForBet;
        } else {
          oldExp[element] += profileForBet;
        }
      } else {
        if (!oldExp[element]) {
          oldExp[element] = -exposureForBet;
        } else {
          oldExp[element] -= exposureForBet;
        }
      }
    });
  }

  console.log(" oldExp ::: ");
  console.log(oldExp);
  console.log(oldExp["Falcon FC"]);
  let oldExpAmount = 0;
  const newExpByNew = Object.keys(oldExp)
    .map((key) => oldExp[key])
    .sort((a, b) => a - b);
  console.log("newExpByNew :: ", newExpByNew);
  if (newExpByNew && newExpByNew.length) {
    oldExpAmount = newExpByNew[0];
  } else {
    oldExpAmount = 0;
  }

  // exposure = calculatExposure({ back, lay });

  console.log(selection, " ::  betsLastExposure :: ");
  console.log({
    oldExp,

    commission: userInfo.commission,
  });
  return {
    oldExpAmount: oldExpAmount,
    oldExp,
    commission: userInfo.commission,
  };
}

// check old bet exp
// betsLastExposureOdds(
//   "63d7e86768d2273dcf909760",
//   "Abu Dhabi Knight Riders",
//   "63d640f03003e3889633b1d1",
//   "cricket",
//   "odds"
// );

async function currantBetOdds(betDetail, userId) {
  const {
    matchId,
    type,
    betType,
    betSide,
    selection,
    betPlaced,
    stake,
    oddsUp,
    oddsDown,
    profit,
    exposure,
    winnerSelection,
  } = betDetail;
  const oldBets = await betsLastExposureOdds(
    userId,
    selection,
    matchId,
    type,
    betType
  );

  const userInfo = await mongo.bettingApp.model(mongo.models.users).findOne({
    query: { _id: mongo.ObjectId(userId) },
    select: {
      commission: 1,
      balance: 1,
      remaining_balance: 1,
      exposure: 1,
    },
  });

  const { oldExp, oldExpAmount } = oldBets;
  console.log("betDetail :: ");
  console.log(betDetail);
  console.log("oldBets :: ");
  console.log(oldBets);
  console.log(
    'betSide === "back" || betSide === "yes" :: ',
    betSide === "back" || betSide === "yes"
  );

  let profileForBet = 0;
  let exposureForBet = 0;
  if (betSide === "back") {
    profileForBet = profit;
    exposureForBet = exposure;
  } else {
    profileForBet = betPlaced;
    exposureForBet = profit;
  }
  winnerSelection.forEach((element) => {
    if (element === selection) {
      if (!oldExp[element]) {
        oldExp[element] = profileForBet;
      } else {
        oldExp[element] += profileForBet;
      }
    } else {
      if (!oldExp[element]) {
        oldExp[element] = -exposureForBet;
      } else {
        oldExp[element] -= exposureForBet;
      }
    }
  });

  console.log("oldExp ::: new :: ", oldExp);
  let newExp = 0;
  const newExpByNew = Object.keys(oldExp)
    .map((key) => oldExp[key])
    .sort((a, b) => a - b);
  console.log("newExpByNew :: ", newExpByNew);
  if (newExpByNew && newExpByNew.length) {
    newExp = newExpByNew[0];
  } else {
    newExp = 0;
  }
  console.log(
    "snewExp, oldExp:oldBets.exposure :: ",
    newExp,
    " == ",
    oldExpAmount
  );

  return { newExp, oldExp: oldExpAmount };
}

currantBetOdds(
  {
    _id: "63f66850480e2b1d3b60deca",
    userId: "63f666f3480e2b1d3b6088f4",
    matchId: "63f58b9b527d875feae6c559",
    type: "soccer",
    betType: "odds",
    betSide: "back",
    betStatus: "completed",
    winnerSelection: ["Volta Redonda", "Falcon FC"], // "The Draw",
    selection: "Volta Redonda",
    subSelection: "",
    betId: 0,
    betPlaced: 18,
    stake: 18,
    oddsUp: 2.14,
    oddsDown: 118.24,
    fancyYes: 0,
    fancyNo: 0,
    profit: 20.52,
    exposure: 18,
    tType: "",
    deleted: false,
    teams: "",
    winner: "Falcon FC",
    createdAt: "2023-02-22T19:09:04.055Z",
    updatedAt: "2023-02-22T19:33:31.555Z",
    __v: 0,
  },
  "63f666f3480e2b1d3b6088f4"
);
