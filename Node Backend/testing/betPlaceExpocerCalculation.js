const mongo = require("../config/mongodb");

const betsHistoryNew = [
//   {
//     "_id" : "6761b227824d7c4465c06bdc",
//     "userId" : "6712b8a2fe0e3bde325bfedd",
//     "matchId" : "676032651796c883a4cb26cf",
//     "type" : "soccer",
//     "betType" : "odds",
//     "betSide" : "back",
//     "betStatus" : "completed",
//     "winnerSelection" : [ 
//         "The Draw", 
//         "Paradou", 
//         "ES Setif"
//     ],
//     "selection" : "The Draw",
//     "subSelection" : "",
//     "betId" : 0,
//     "betPlaced" : 150,
//     "stake" : 150,
//     "oddsUp" : 3,
//     "oddsDown" : 4732.56,
//     "fancyYes" : 0,
//     "fancyNo" : 0,
//     "profit" : 300,
//     "exposure" : 150,
//     "tType" : "lost",
//     "deleted" : false,
//     "teams" : "",
//     "winner" : "Paradou",
//     "isMatched" : true,
//     "oldOdds" : 3,
//     "isCheat" : false,
//     "createdAt" : "2024-12-17T17:17:27.438Z",
//     "updatedAt" : "2024-12-17T19:18:07.431Z",
//     "__v" : 0
// },
// {
//   "_id" : "6761b233824d7c4465c07628",
//   "userId" : "6712b8a2fe0e3bde325bfedd",
//   "matchId" : "676032651796c883a4cb26cf",
//   "type" : "soccer",
//   "betType" : "odds",
//   "betSide" : "back",
//   "betStatus" : "completed",
//   "winnerSelection" : [ 
//       "The Draw", 
//       "Paradou", 
//       "ES Setif"
//   ],
//   "selection" : "ES Setif",
//   "subSelection" : "",
//   "betId" : 0,
//   "betPlaced" : 100,
//   "stake" : 100,
//   "oddsUp" : 5,
//   "oddsDown" : 4173.26,
//   "fancyYes" : 0,
//   "fancyNo" : 0,
//   "profit" : 400,
//   "exposure" : 100,
//   "tType" : "lost",
//   "deleted" : false,
//   "teams" : "",
//   "winner" : "Paradou",
//   "isMatched" : false,
//   "oldOdds" : 4.9,
//   "isCheat" : true,
//   "createdAt" : "2024-12-17T17:17:39.438Z",
//   "updatedAt" : "2024-12-17T19:18:07.431Z",
//   "__v" : 0
// },
// {
//   "_id" : "6761b255afe99b2bf4bfff07",
//   "userId" : "6712b8a2fe0e3bde325bfedd",
//   "matchId" : "676032651796c883a4cb26cf",
//   "type" : "soccer",
//   "betType" : "odds",
//   "betSide" : "back",
//   "betStatus" : "completed",
//   "winnerSelection" : [ 
//       "The Draw", 
//       "Paradou", 
//       "ES Setif"
//   ],
//   "selection" : "The Draw",
//   "subSelection" : "",
//   "betId" : 0,
//   "betPlaced" : 9,
//   "stake" : 9,
//   "oddsUp" : 3,
//   "oddsDown" : 9574.83,
//   "fancyYes" : 0,
//   "fancyNo" : 0,
//   "profit" : 18,
//   "exposure" : 9,
//   "tType" : "lost",
//   "deleted" : false,
//   "teams" : "",
//   "winner" : "Paradou",
//   "isMatched" : true,
//   "oldOdds" : 3,
//   "isCheat" : true,
//   "createdAt" : "2024-12-17T17:18:13.181Z",
//   "updatedAt" : "2024-12-17T19:18:07.431Z",
//   "__v" : 0
// },
// {
//   "_id" : "6761b9fac99cd5fb3e1e5f04",
//   "userId" : "6712b8a2fe0e3bde325bfedd",
//   "matchId" : "676032651796c883a4cb26cf",
//   "type" : "soccer",
//   "betType" : "odds",
//   "betSide" : "back",
//   "betStatus" : "completed",
//   "winnerSelection" : [ 
//       "The Draw", 
//       "Paradou", 
//       "ES Setif"
//   ],
//   "selection" : "Paradou",
//   "subSelection" : "",
//   "betId" : 0,
//   "betPlaced" : 70,
//   "stake" : 70,
//   "oddsUp" : 7.8,
//   "oddsDown" : 1458.49,
//   "fancyYes" : 0,
//   "fancyNo" : 0,
//   "profit" : 476,
//   "exposure" : 70,
//   "tType" : "win",
//   "deleted" : false,
//   "teams" : "",
//   "winner" : "Paradou",
//   "isMatched" : true,
//   "oldOdds" : 7.8,
//   "isCheat" : false,
//   "createdAt" : "2024-12-17T17:50:50.160Z",
//   "updatedAt" : "2024-12-17T19:18:07.431Z",
//   "__v" : 0
// }
];

async function betsLastExposureOdds(userId, matchId, type, betType) {
  const query = {
    matchId: mongo.ObjectId(matchId),
    userId: mongo.ObjectId(userId),
    betType,
    // selection,
    type,
    deleted: false,
  };
  // const userInfo = await mongo.bettingApp.model(mongo.models.users).findOne({
  //   query: { _id: mongo.ObjectId(userId) },
  //   select: {
  //     commission: 1,
  //   },
  // });
  const betList = betsHistoryNew;

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
        if (bet.betSide === "back") {
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
      } else {
        if (bet.betSide === "back") {
          if (!oldExp[element]) {
            oldExp[element] = -exposureForBet;
          } else {
            oldExp[element] -= exposureForBet;
          }
        } else {
          if (!oldExp[element]) {
            oldExp[element] = profileForBet;
          } else {
            oldExp[element] += profileForBet;
          }
        }
      }
    });
  }

  console.log(" oldExp ::: ");
  console.log(oldExp);
  let oldExpAmount = 0;
  const newExpByNew = Object.keys(oldExp)
    .map((key) => oldExp[key])
    .sort((a, b) => a - b);
  console.log("newExpByNew :: ", newExpByNew);
  if (newExpByNew && newExpByNew.length) {
    oldExpAmount = newExpByNew[0] < 0 ? newExpByNew[0] : 0;
  } else {
    oldExpAmount = 0;
  }

  // exposure = calculatExposure({ back, lay });

  console.log({
    oldExp,
    commission: 0,
    // commission: userInfo.commission,
  });
  return { oldExpAmount, oldExp, commission: 0 };
}

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
  const oldBets = await betsLastExposureOdds(userId, matchId, type, betType);

  const { oldExp, oldExpAmount } = oldBets;
  console.log(userId, " : betDetail :: ");
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
      if (betSide === "back") {
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
    } else {
      if (betSide === "back") {
        if (!oldExp[element]) {
          oldExp[element] = -exposureForBet;
        } else {
          oldExp[element] -= exposureForBet;
        }
      } else {
        if (!oldExp[element]) {
          oldExp[element] = profileForBet;
        } else {
          oldExp[element] += profileForBet;
        }
      }
    }
  });

  let newExp = 0;
  let newprofit = 0;
  const newExpByNew = Object.keys(oldExp)
    .map((key) => oldExp[key])
    .sort((a, b) => a - b);
  console.log("newExpByNew :: ", newExpByNew);
  if (newExpByNew && newExpByNew.length) {
    newExp = newExpByNew[0] < 0 ? newExpByNew[0] : 0;
    newprofit = newExpByNew[newExpByNew.length - 1];
  } else {
    newExp = 0;
  }
  console.log(
    "snewExp, oldExp:oldBets.exposure :: ",
    newExp,
    " == oldExp: ",
    oldExpAmount
  );

  return {
    newExp: Math.abs(newExp),
    oldExp: Math.abs(oldExpAmount),
    profit: newprofit,
  };
}
currantBetOdds(
  {
    "_id" : "6761b227824d7c4465c06bdc",
    "userId" : "6712b8a2fe0e3bde325bfedd",
    "matchId" : "676032651796c883a4cb26cf",
    "type" : "soccer",
    "betType" : "odds",
    "betSide" : "back",
    "betStatus" : "completed",
    "winnerSelection" : [ 
        "The Draw", 
        "Paradou", 
        "ES Setif"
    ],
    "selection" : "The Draw",
    "subSelection" : "",
    "betId" : 0,
    "betPlaced" : 150,
    "stake" : 150,
    "oddsUp" : 3,
    "oddsDown" : 4732.56,
    "fancyYes" : 0,
    "fancyNo" : 0,
    "profit" : 300,
    "exposure" : 150,
    "tType" : "lost",
    "deleted" : false,
    "teams" : "",
    "winner" : "Paradou",
    "isMatched" : true,
    "oldOdds" : 3,
    "isCheat" : false,
    "createdAt" : "2024-12-17T17:17:27.438Z",
    "updatedAt" : "2024-12-17T19:18:07.431Z",
    "__v" : 0
  },
  "6712b8a2fe0e3bde325bfedd"
);
