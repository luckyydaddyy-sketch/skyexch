const mongo = require("../../../config/mongodb");

// use for odds and bookmaker
function calculatExposure(oldBets) {
  let newExp = 0;
  console.log(" calculatExpostre : start :: ");
  // calucate new expocers
  if (
    oldBets.back.exp === 0 &&
    oldBets.back.win === 0 &&
    oldBets.lay.exp != 0 &&
    oldBets.lay.win != 0
  ) {
    console.log(" calculatExpostre : 111 :: ");
    // 1: if back value is zero
    newExp = oldBets.lay.exp;
  } else if (
    oldBets.lay.exp === 0 &&
    oldBets.lay.win === 0 &&
    oldBets.back.exp != 0 &&
    oldBets.back.win != 0
  ) {
    console.log(" calculatExpostre : 222 :: ");
    // 2: if lay value is zero
    newExp = oldBets.back.exp;
  } else if (
    oldBets.lay.win > oldBets.back.win &&
    oldBets.lay.exp >= oldBets.back.exp
  ) {
    console.log(" calculatExpostre : 333 :: ");
    // 3: if lay both amount is high to back
    newExp = oldBets.lay.exp - oldBets.back.win;
  } else if (
    oldBets.back.win > oldBets.lay.win &&
    (oldBets.back.exp >= oldBets.lay.exp || oldBets.lay.exp > oldBets.back.exp)
  ) {
    console.log(" calculatExpostre : 444 :: ");
    // 4: if back both amount is high to lay
    newExp = oldBets.back.exp - oldBets.lay.win;
  } else if (
    oldBets.lay.exp > oldBets.back.exp &&
    oldBets.back.win > oldBets.lay.win &&
    oldBets.lay.exp > oldBets.back.win
  ) {
    console.log(" calculatExpostre : 555 :: ");
    // 5: if lay expocer high and back win high
    newExp = oldBets.lay.exp - oldBets.back.win;
  } else if (
    oldBets.back.exp === oldBets.lay.win &&
    oldBets.lay.exp > oldBets.back.win
  ) {
    console.log(" calculatExpostre : 666 :: ");
    newExp = oldBets.lay.exp - oldBets.back.win;
  } else if (
    oldBets.lay.win > oldBets.back.win &&
    oldBets.back.exp > oldBets.lay.exp
    // (oldBets.back.win > oldBets.lay.win && oldBets.lay.exp > oldBets.back.exp)
  ) {
    console.log(" calculatExpostre : 777 :: ");
    newExp = oldBets.back.exp - oldBets.lay.win;
  }
  console.log(" calculatExpostre : end :: ");
  return newExp;
}

// fancy exposure calculation
function fancyExposureCalculation(bet, numberArray, oddsValues) {
  const no = bet.fancyNo;
  const yes = bet.fancyYes;

  if (bet.betSide === "yes") {
    if (!oddsValues.includes(yes)) {
      oddsValues.push(yes);
    }
    if (!oddsValues.includes(yes + 1)) {
      oddsValues.push(yes + 1);
    }
    if (!oddsValues.includes(yes - 1)) {
      oddsValues.push(yes - 1);
    }
  } else {
    if (!oddsValues.includes(no)) {
      oddsValues.push(no);
    }
    if (!oddsValues.includes(no + 1)) {
      oddsValues.push(no + 1);
    }
    if (!oddsValues.includes(no - 1)) {
      oddsValues.push(no - 1);
    }
  }

  console.log("max values : oddsValues : ", oddsValues);
  console.log("no value : ", no);
  console.log("yes value : ", yes);
  const maxVal = Math.max(...oddsValues);
  console.log("max values : maxVal : ", maxVal);
  for (let i = 0; i <= maxVal + 1000; i++) {
    if (bet.betSide === "yes") {
      if (yes <= i) {
        if (!numberArray[i]) {
          numberArray[i] = bet.profit;
        } else {
          numberArray[i] += bet.profit;
        }
      } else {
        if (!numberArray[i]) {
          numberArray[i] = -bet.exposure;
        } else {
          numberArray[i] -= bet.exposure;
        }
      }
    } else if (bet.betSide === "no") {
      if (no > i) {
        if (!numberArray[i]) {
          numberArray[i] = bet.betPlaced;
        } else {
          numberArray[i] += bet.betPlaced;
        }
      } else {
        if (!numberArray[i]) {
          numberArray[i] = -bet.profit;
        } else {
          numberArray[i] -= bet.profit;
        }
      }
    }
  }

  return numberArray;
}

// only for fency
async function betsLastExposure(
  userId,
  selection,
  matchId,
  type,
  betType,
  oddsValuesNew = []
) {
  const query = {
    matchId: mongo.ObjectId(matchId),
    userId: mongo.ObjectId(userId),
    betType,
    selection,
    type,
    deleted: false,
  };

  const betList = await mongo.bettingApp.model(mongo.models.betsHistory).find({
    query,
  });

  let exposure = 0;
  let betAmount = 0;

  let betValue = {
    no: { up: -2, down: -2 },
    yes: { up: -2, down: -2 },
  };

  let oddsValues = [];
  betList.forEach((value) => {
    betAmount += value.betPlaced;
    if (value.betSide === "yes") {
      if (!oddsValues.includes(value.fancyYes)) {
        oddsValues.push(value.fancyYes);
      }
      if (!oddsValues.includes(value.fancyYes + 1)) {
        oddsValues.push(value.fancyYes + 1);
      }
      if (!oddsValues.includes(value.fancyYes - 1)) {
        oddsValues.push(value.fancyYes - 1);
      }
    } else {
      if (!oddsValues.includes(value.fancyNo)) {
        oddsValues.push(value.fancyNo);
      }
      if (!oddsValues.includes(value.fancyNo + 1)) {
        oddsValues.push(value.fancyNo + 1);
      }
      if (!oddsValues.includes(value.fancyNo - 1)) {
        oddsValues.push(value.fancyNo - 1);
      }
    }
  });

  if (oddsValuesNew.length > 0) {
    oddsValuesNew.forEach((value) => {
      if (!oddsValues.includes(value)) {
        oddsValues.push(value);
      }
    });
  }

  let numberArray = {};
  for await (const bet of betList) {
    numberArray = await fancyExposureCalculation(bet, numberArray, oddsValues);
    betValue.yes.up = bet.fancyYes;
    betValue.yes.down = bet.oddsDown;
    betValue.no.up = bet.fancyNo;
    betValue.no.down = bet.oddsDown;
  }

  const newExpByNew = Object.keys(numberArray)
    .map((key) => numberArray[key])
    .sort((a, b) => a - b);
  console.log("newExpByNew :: ", newExpByNew);
  if (newExpByNew && newExpByNew.length) {
    exposure = newExpByNew[0];
  }

  console.log("exposure ::: ", exposure);

  console.log("getUSer:: fancy : : betsLastExposure :: ");
  console.log({ exposure, betValue, commission: 0 });
  return { numberArray, exposure, betValue, commission: 0, oddsValues, betAmount };
}

async function currantBet(betDetail, userId) {
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
    fancyYes,
    fancyNo,
  } = betDetail;
  const oldBets = await betsLastExposure(
    userId,
    selection,
    matchId,
    type,
    betType,
    [fancyYes, fancyNo]
  );

  console.log("currantBet : fancy : : betDetail :: ");
  console.log(betDetail);
  console.log("currantBet : fancy : oldBets :: ");
  console.log(oldBets);
  let newExp = 0;

  let { betValue, numberArray, oddsValues } = oldBets;

  numberArray = await fancyExposureCalculation(
    betDetail,
    numberArray,
    oddsValues
  );
  let newProfit = 0;
  const newExpByNew = Object.keys(numberArray)
    .map((key) => numberArray[key])
    .sort((a, b) => a - b);
  console.log("newExpByNew :: ", newExpByNew);
  if (newExpByNew && newExpByNew.length) {
    newExp = newExpByNew[0];
    newProfit = newExpByNew[newExpByNew.length - 1];
  }

  console.log("exposure ::newExp: ", newExp);

  console.log(
    "currantBet :fancy :: newExp, oldExp:oldBets.exposure :: ",
    newExp,
    " == ",
    oldBets.exposure
  );
  return {
    newExp: Math.abs(newExp),
    oldExp: Math.abs(oldBets.exposure),
    profit: newProfit,
  };
}

async function currantBetRemove(betDetail, userId) {
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
  } = betDetail;
  const oldBets = await betsLastExposure(
    userId,
    selection,
    matchId,
    type,
    betType
  );

  console.log("currantBetRemove : fancy : : betDetail :: ");
  console.log(betDetail);
  console.log("currantBetRemove : fancy : oldBets :: ");
  console.log({
    betValue: oldBets.betValue,
    commission: oldBets.commission,
    exposure: oldBets.exposure,
    oddsValues: oldBets.oddsValues,
  });
  let newExp = 0;

  let { betValue, numberArray, oddsValues } = oldBets;

  const no = betDetail.fancyNo;
  const yes = betDetail.fancyYes;
  console.log("currantBetRemove : no value : ", no);
  console.log("currantBetRemove : yes value : ", yes);

  if (betDetail.betSide === "yes") {
    if (!oddsValues.includes(yes)) {
      oddsValues.push(yes);
    }
    if (!oddsValues.includes(yes + 1)) {
      oddsValues.push(yes + 1);
    }
    if (!oddsValues.includes(yes - 1)) {
      oddsValues.push(yes - 1);
    }
  } else {
    if (!oddsValues.includes(no)) {
      oddsValues.push(no);
    }
    if (!oddsValues.includes(no + 1)) {
      oddsValues.push(no + 1);
    }
    if (!oddsValues.includes(no - 1)) {
      oddsValues.push(no - 1);
    }
  }
  const maxVal = Math.max(...oddsValues);
  console.log("currantBetRemove : max values : maxVal : ", maxVal);

  for (let i = 0; i <= maxVal + 1000; i++) {
    if (betDetail.betSide === "yes") {
      if (yes <= i) {
        if (!numberArray[i]) {
          numberArray[i] = -betDetail.profit;
        } else {
          numberArray[i] -= betDetail.profit;
        }
      } else {
        if (!numberArray[i]) {
          numberArray[i] = +betDetail.exposure;
        } else {
          numberArray[i] += betDetail.exposure;
        }
      }
    } else if (betDetail.betSide === "no") {
      if (no > i) {
        if (!numberArray[i]) {
          numberArray[i] = -betDetail.betPlaced;
        } else {
          numberArray[i] -= betDetail.betPlaced;
        }
      } else {
        if (!numberArray[i]) {
          numberArray[i] = +betDetail.profit;
        } else {
          numberArray[i] += betDetail.profit;
        }
      }
    }
  }

  // numberArray = await fancyExposureCalculation(betDetail, numberArray);

  const newExpByNew = Object.keys(numberArray)
    .map((key) => numberArray[key])
    .sort((a, b) => a - b);
  console.log("currantBetRemove : newExpByNew :: ", newExpByNew);
  if (newExpByNew && newExpByNew.length) {
    newExp = newExpByNew[0];
  }

  console.log("currantBetRemove : exposure ::newExp: ", newExp);

  console.log(
    "currantBetRemove :fancy :: newExp, oldExp:oldBets.exposure :: ",
    newExp,
    " == ",
    oldBets.exposure
  );
  return { newExp: Math.abs(newExp), oldExp: Math.abs(oldBets.exposure) };
}

// only for odds and bookmaker
async function betsLastExposureOdds(userId, matchId, type, betType) {
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
    },
  });
  const betList = await mongo.bettingApp.model(mongo.models.betsHistory).find({
    query,
  });

  let oldExp = {};
  let betAmount = 0;
  for await (const bet of betList) {
    const { winnerSelection } = bet;
    console.log(winnerSelection);
    let profileForBet = 0;
    let exposureForBet = 0;
    betAmount += bet.betPlaced;
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
    commission: userInfo.commission,
  });
  return { oldExpAmount, oldExp, commission: userInfo.commission, betAmount };
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
    " == ",
    oldExpAmount
  );

  return {
    newExp: Math.abs(newExp),
    oldExp: Math.abs(oldExpAmount),
    profit: newprofit,
  };
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
    newExp = newExpByNew[0] < 0 ? newExpByNew[0] : 0;
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

// use for premium bet
async function betsLastExposurePremium(
  userId,
  selection,
  matchId,
  type,
  betType
) {
  const query = {
    matchId: mongo.ObjectId(matchId),
    userId: mongo.ObjectId(userId),
    betType,
    selection,
    type,
    deleted: false,
  };

  const betList = await mongo.bettingApp.model(mongo.models.betsHistory).find({
    query,
  });

  let oldExp = {};
  let betAmount = 0

  for await (const bet of betList) {
    const { winnerSelection } = bet;
    console.log(
      "betsLastExposurePremium :: winnerSelection : ",
      winnerSelection
    );
    let profileForBet = 0;
    let exposureForBet = 0;
    betAmount += bet.betPlaced;
    if (bet.betSide === "back") {
      profileForBet = bet.profit;
      exposureForBet = bet.exposure;
    } else {
      profileForBet = bet.betPlaced;
      exposureForBet = bet.profit;
    }

    console.log("betsLastExposurePremium : profileForBet :: ", profileForBet);
    console.log("betsLastExposurePremium : exposureForBet :: ", exposureForBet);
    winnerSelection.forEach((element) => {
      if (element === bet.subSelection) {
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
  let oldExposure = 0;
  const newExpByNew = Object.keys(oldExp)
    .map((key) => oldExp[key])
    .sort((a, b) => a - b);
  console.log("newExpByNew :: ", newExpByNew);
  if (newExpByNew && newExpByNew.length) {
    oldExposure = newExpByNew[0] < 0 ? newExpByNew[0] : 0;
  } else {
    oldExposure = 0;
  }

  // let exposure = 0;
  // let back = {
  //   exp: 0, // bet
  //   win: 0, // profit
  // };

  // for await (const bet of betList) {
  //   back.exp += bet.exposure;
  //   back.win += bet.profit;
  // }

  // exposure = back.exp;
  return { oldExp, oldExposure };
}

async function currantBetPremium(betDetail, userId) {
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
    subSelection,
    winnerSelection,
  } = betDetail;
  const { oldExp, oldExposure } = await betsLastExposurePremium(
    userId,
    selection,
    matchId,
    type,
    betType
  );

  console.log("currantBetPremium : betDetail :: ");
  console.log(betDetail);
  console.log("currantBetPremium : oldExp :: ");
  console.log(oldExp);

  let profileForBet = 0;
  let exposureForBet = 0;
  if (betSide === "back") {
    profileForBet = profit;
    exposureForBet = exposure;
  } else {
    profileForBet = betPlaced;
    exposureForBet = profit;
  }

  console.log("currantBetPremium : profileForBet :: ", profileForBet);
  console.log("currantBetPremium : exposureForBet :: ", exposureForBet);
  winnerSelection.forEach((element) => {
    if (element === subSelection) {
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

  let newExp = 0;
  let newProfit = 0;

  const newExpByNew = Object.keys(oldExp)
    .map((key) => oldExp[key])
    .sort((a, b) => a - b);
  console.log("newExpByNew :: ", newExpByNew);
  if (newExpByNew && newExpByNew.length) {
    newExp = newExpByNew[0] < 0 ? newExpByNew[0] : 0;
    newProfit = newExpByNew[newExpByNew.length - 1];
  } else {
    newExp = 0;
  }

  // if (oldBets.exposure !== 0) {
  //   // if (betSide === "back" || betSide === "yes") {
  //   oldBets.back.exp += Number(exposure);
  //   oldBets.back.win += Number(profit);
  //   newExp = oldBets.back.exp;
  //   // }
  // } else {
  //   newExp = exposure;
  // }

  console.log(
    "Premium : snewExp, oldExp:oldBets.exposure :: ",
    newExp,
    " == ",
    oldExposure
  );
  return {
    newExp: Math.abs(newExp),
    oldExp: Math.abs(oldExposure),
    profit: newProfit,
  };
}
async function currantBetPremiumRemove(betDetail, userId) {
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
    subSelection,
    winnerSelection,
  } = betDetail;
  const { oldExp, oldExposure } = await betsLastExposurePremium(
    userId,
    selection,
    matchId,
    type,
    betType
  );

  console.log("currantBetPremiumRemove : betDetail :: ");
  console.log(betDetail);
  console.log("currantBetPremiumRemove : oldExp :: ");
  console.log(oldExp);

  let profileForBet = 0;
  let exposureForBet = 0;
  if (betSide === "back") {
    profileForBet = profit;
    exposureForBet = exposure;
  } else {
    profileForBet = betPlaced;
    exposureForBet = profit;
  }

  console.log("currantBetPremium : profileForBet :: ", profileForBet);
  console.log("currantBetPremium : exposureForBet :: ", exposureForBet);
  winnerSelection.forEach((element) => {
    if (element === subSelection) {
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
  });

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
    "currantBetPremiumRemove : snewExp, oldExp:oldBets.exposure :: ",
    newExp,
    " == ",
    oldExposure
  );
  return { newExp: Math.abs(newExp), oldExp: Math.abs(oldExposure) };
}

async function betsLastExposurePremiumForWinningCalculation(
  userId,
  selection,
  matchId,
  type,
  betType
) {
  const query = {
    matchId: mongo.ObjectId(matchId),
    userId: mongo.ObjectId(userId),
    betType,
    selection,
    type,
    deleted: false,
  };

  const userBetList = [];
  const betList = await mongo.bettingApp.model(mongo.models.betsHistory).find({
    query,
  });

  // let exposure = 0;

  console.log("betsLastExposurePremiumForWinningCalculation ::: ");
  console.log(betList);

  for await (const bet of betList) {
    let back = {
      userId,
      selection,
      exp: 0, // bet
      win: 0, // profit
      subSelection: "",
    };

    back.exp = bet.exposure;
    back.win = bet.profit;
    back.subSelection = bet.subSelection;

    userBetList.push(back);
  }

  // exposure = back.exp;
  // return { back, exposure };
  return userBetList;
}

module.exports = {
  calculatExposure,
  currantBet,
  currantBetRemove,
  betsLastExposure,
  currantBetOdds,
  currantBetRemoveOdds,
  betsLastExposureOdds,
  betsLastExposurePremium,
  currantBetPremium,
  currantBetPremiumRemove,
  betsLastExposurePremiumForWinningCalculation,
};
