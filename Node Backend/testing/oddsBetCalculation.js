async function betsLastExposureOdds(userId, matchId, type, betType) {
  const query = {
    matchId: matchId,
    userId: userId,
    betType,
    // selection,
    type,
    deleted: false,
  };
  const userInfo = { commission: 10 };
  const betList = [
    {
      _id: "648e1ef06ae0427607ec09fc",
      userId: "648b09aaa2386f8fbc77ede1",
      matchId: "648aef88a2386f8fbc718a64",
      type: "cricket",
      betType: "odds",
      betSide: "back",
      betStatus: "completed",
      winnerSelection: ["Nepal", "Zimbabwe"],
      selection: "Nepal",
      subSelection: "",
      betId: 0,
      betPlaced: 3,
      stake: 3,
      oddsUp: 6,
      oddsDown: 11.08,
      fancyYes: 0,
      fancyNo: 0,
      profit: 15,
      exposure: 3,
      tType: "lost",
      deleted: false,
      teams: "",
      winner: "Zimbabwe",
      createdAt: "2023-06-17T21:00:32.280Z",
      updatedAt: "2023-06-18T14:05:46.858Z",
      __v: 0,
    },
    {
      _id: "648e25f46ae0427607edded4",
      userId: "648b09aaa2386f8fbc77ede1",
      matchId: "648aef88a2386f8fbc718a64",
      type: "cricket",
      betType: "odds",
      betSide: "back",
      betStatus: "completed",
      winnerSelection: ["Nepal", "Zimbabwe"],
      selection: "Nepal",
      subSelection: "",
      betId: 0,
      betPlaced: 1,
      stake: 1,
      oddsUp: 5.8,
      oddsDown: 57.3,
      fancyYes: 0,
      fancyNo: 0,
      profit: 4.8,
      exposure: 1,
      tType: "lost",
      deleted: false,
      teams: "",
      winner: "Zimbabwe",
      createdAt: "2023-06-17T21:30:28.599Z",
      updatedAt: "2023-06-18T14:05:46.858Z",
      __v: 0,
    },
    {
      _id: "648eb96d6ae04276070901db",
      userId: "648b09aaa2386f8fbc77ede1",
      matchId: "648aef88a2386f8fbc718a64",
      type: "cricket",
      betType: "odds",
      betSide: "back",
      betStatus: "completed",
      winnerSelection: ["Nepal", "Zimbabwe"],
      selection: "Zimbabwe",
      subSelection: "",
      betId: 0,
      betPlaced: 20,
      stake: 20,
      oddsUp: 1.51,
      oddsDown: 81056.3,
      fancyYes: 0,
      fancyNo: 0,
      profit: 10.2,
      exposure: 20,
      tType: "win",
      deleted: false,
      teams: "",
      winner: "Zimbabwe",
      createdAt: "2023-06-18T07:59:41.770Z",
      updatedAt: "2023-06-18T14:05:46.858Z",
      __v: 0,
    },
    {
      _id: "648ebb1d6ae04276070ab820",
      userId: "648b09aaa2386f8fbc77ede1",
      matchId: "648aef88a2386f8fbc718a64",
      type: "cricket",
      betType: "odds",
      betSide: "back",
      betStatus: "completed",
      winnerSelection: ["Nepal", "Zimbabwe"],
      selection: "Zimbabwe",
      subSelection: "",
      betId: 0,
      betPlaced: 4,
      stake: 4,
      oddsUp: 1.6,
      oddsDown: 55260.05,
      fancyYes: 0,
      fancyNo: 0,
      profit: 2.4,
      exposure: 4,
      tType: "win",
      deleted: false,
      teams: "",
      winner: "Zimbabwe",
      createdAt: "2023-06-18T08:06:53.740Z",
      updatedAt: "2023-06-18T14:05:46.858Z",
      __v: 0,
    },
    {
      _id: "648ec9d06ae042760714803c",
      userId: "648b09aaa2386f8fbc77ede1",
      matchId: "648aef88a2386f8fbc718a64",
      type: "cricket",
      betType: "odds",
      betSide: "back",
      betStatus: "completed",
      winnerSelection: ["Nepal", "Zimbabwe"],
      selection: "Nepal",
      subSelection: "",
      betId: 0,
      betPlaced: 4,
      stake: 4,
      oddsUp: 1.89,
      oddsDown: 4386.51,
      fancyYes: 0,
      fancyNo: 0,
      profit: 3.56,
      exposure: 4,
      tType: "lost",
      deleted: false,
      teams: "",
      winner: "Zimbabwe",
      createdAt: "2023-06-18T09:09:36.906Z",
      updatedAt: "2023-06-18T14:05:46.858Z",
      __v: 0,
    },
    // {
    //   _id: "648eded26ae0427607287df2",
    //   userId: "648b09aaa2386f8fbc77ede1",
    //   matchId: "648aef88a2386f8fbc718a64",
    //   type: "cricket",
    //   betType: "odds",
    //   betSide: "back",
    //   betStatus: "completed",
    //   winnerSelection: ["Nepal", "Zimbabwe"],
    //   selection: "Nepal",
    //   subSelection: "",
    //   betId: 0,
    //   betPlaced: 5,
    //   stake: 5,
    //   oddsUp: 1.76,
    //   oddsDown: 16706.57,
    //   fancyYes: 0,
    //   fancyNo: 0,
    //   profit: 3.8,
    //   exposure: 5,
    //   tType: "lost",
    //   deleted: false,
    //   teams: "",
    //   winner: "Zimbabwe",
    //   createdAt: "2023-06-18T10:39:14.185Z",
    //   updatedAt: "2023-06-18T14:05:46.858Z",
    //   __v: 0,
    // },
  ];

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
    // oldExpAmount = newExpByNew[0];
  } else {
    oldExpAmount = 0;
  }

  // exposure = calculatExposure({ back, lay });

  console.log({
    oldExp,
    commission: userInfo.commission,
  });
  return { oldExpAmount, oldExp, commission: userInfo.commission };
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

  console.log("oldExp ::: ", oldExp);
  let newExp = 0;
  const newExpByNew = Object.keys(oldExp)
    .map((key) => oldExp[key])
    .sort((a, b) => a - b);
  console.log("newExpByNew :: ", newExpByNew);
  if (newExpByNew && newExpByNew.length) {
    newExp = newExpByNew[0] < 0 ? newExpByNew[0] : 0;
  } else {
    newExp = 0;
  }
  console.log(
    "snewExp, oldExp:oldBets.exposure :: ",
    newExp,
    " == ",
    oldExpAmount
  );

  return { newExp: Math.abs(newExp), oldExp: Math.abs(oldExpAmount) };
}

async function currantBetRemoveOdds(betDetail, userId) {
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
  console.log("currantBetRemoveOdds : betDetail :: ");
  console.log(betDetail);
  console.log("currantBetRemoveOdds : oldBets :: ");
  console.log(oldBets);

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
          oldExp[element] = -profileForBet;
        } else {
          oldExp[element] -= profileForBet;
        }
      } else {
        if (!oldExp[element]) {
          oldExp[element] = exposureForBet;
        } else {
          oldExp[element] += exposureForBet;
        }
      }
    } else {
      if (betSide === "back") {
        if (!oldExp[element]) {
          oldExp[element] = exposureForBet;
        } else {
          oldExp[element] += exposureForBet;
        }
      } else {
        if (!oldExp[element]) {
          oldExp[element] = -profileForBet;
        } else {
          oldExp[element] -= profileForBet;
        }
      }
    }
  });

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

  console.log("currantBetRemoveOdds : oldBets : 2 : ");
  console.log(oldBets);

  console.log(
    "currantBetRemoveOdds : snewExp, oldExp:oldBets.exposure :: ",
    newExp,
    " == ",
    oldExpAmount
  );
  return { newExp: Math.abs(newExp), oldExp: Math.abs(oldExpAmount) };
}

const newbet = {
  _id: "648eded26ae0427607287df2",
  userId: "648b09aaa2386f8fbc77ede1",
  matchId: "648aef88a2386f8fbc718a64",
  type: "cricket",
  betType: "odds",
  betSide: "back",
  betStatus: "completed",
  winnerSelection: ["Nepal", "Zimbabwe"],
  selection: "Nepal",
  subSelection: "",
  betId: 0,
  betPlaced: 5,
  stake: 5,
  oddsUp: 1.76,
  oddsDown: 16706.57,
  fancyYes: 0,
  fancyNo: 0,
  profit: 3.8,
  exposure: 5,
  tType: "lost",
  deleted: false,
  teams: "",
  winner: "Zimbabwe",
  createdAt: "2023-06-18T10:39:14.185Z",
  updatedAt: "2023-06-18T14:05:46.858Z",
  __v: 0,
};
async function test() {
  const newData = await currantBetOdds(newbet, "648c745fc57fbbdca07cb186");
  // const newData = await currantBetRemoveOdds(
  //   newbet,
  //   "648c745fc57fbbdca07cb186"
  // );

  console.log("test :: ", newData);
}

test();
