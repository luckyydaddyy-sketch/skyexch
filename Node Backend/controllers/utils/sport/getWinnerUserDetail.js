const mongo = require("../../../config/mongodb");
const {
  betsLastExposure,

  betsLastExposurePremiumForWinningCalculation,
  betsLastExposurePremium,
} = require("./getUserBets");

async function getFancyMatchesAmount(
  userId,
  betType,
  matchId,
  type,
  selection
) {
  const betList = await mongo.bettingApp.model(mongo.models.betsHistory).find({
    query: { userId, selection, type, matchId, betType },
  });

  const back = {
    exp: 0,
    win: 0,
  };
  const lay = {
    exp: 0,
    win: 0,
  };
  const betValueDetail = [];
  for (const bet of betList) {
    const betValue = {
      betSide: bet.betSide,
      no: { up: -2, down: -2 },
      yes: { up: -2, down: -2 },
      exp: 0,
      win: 0,
    };

    if (bet.betSide === "yes") {
      betValue.yes.up = bet.fancyYes;
      betValue.yes.down = bet.oddsDown;
      betValue.exp = bet.exposure;
      betValue.win = bet.profit;
    } else if (bet.betSide === "no") {
      betValue.no.up = bet.fancyNo;
      betValue.no.down = bet.oddsDown;
      betValue.exp = bet.profit;
      betValue.win = bet.betPlaced;
    }
    betValueDetail.push(betValue);
    // if (bet.betSide === "yes") {
    //   back.exp += bet.exposure;
    //   back.win += bet.profit;
    // } else if (bet.betSide === "no") {
    //   lay.exp += bet.profit;
    //   lay.win += bet.betPlaced;
    // }
  }
  console.log("getFancyMatchesAmount :::: ", betValueDetail);
  console.log("getFancyMatchesAmount :::: ", back, lay);
  return { betValueDetail };
}

// fancy
async function winnerUserDetailforfancy(betType, matchId, type, selection) {
  const userBetsDetail = [];

  const getUserIds = await mongo.bettingApp
    .model(mongo.models.betsHistory)
    .distinct({
      query: { selection, type, matchId, betType },
      field: "userId",
    });

  for await (const uid of getUserIds) {
    const selectionExp = await betsLastExposure(
      uid,
      selection,
      matchId,
      type,
      betType
    );
    const getFancyMatches = await getFancyMatchesAmount(
      uid,
      betType,
      matchId,
      type,
      selection
    );
    console.log("fancy :: getFancyMatches :: ", getFancyMatches);
    const userBet = {
      userId: uid,
      selection,
      ...selectionExp,
      ...getFancyMatches,
    };
    userBetsDetail.push(userBet);
  }

  return userBetsDetail;
}

// fancy
/*
YES == same value or up value
No = only down value
*/
async function formentWinnerUserDetailForFancy(
  winner,
  betType,
  matchId,
  type,
  selection
) {
  const winnerInfo = await winnerUserDetailforfancy(
    betType,
    matchId,
    type,
    selection
  );

  const winnerUser = [];

  /*
  YES == same value or up value
  No = only down value
  */
  console.log("fancy :: winnerInfo :::: ", winnerInfo);
  for await (const odds of winnerInfo) {
    // console.log("fancy :: odds :::: ", odds);
    // const winInfo = {};
    let win = 0;
    let comm = 0;
    const { exposure, userId, betValueDetail } = odds;

    let winAmount = 0;
    let lostAmount = 0;
    betValueDetail.forEach((value) => {
      // cancel
      if (winner === -2) {
        win = 0;
      } else if (value.betSide === "yes") {
        if (value.yes.up <= winner) {
          winAmount += value.win;
        } else {
          lostAmount += value.exp;
        }
      } else if (value.betSide === "no") {
        if (value.no.up > winner) {
          winAmount += value.win;
        } else {
          lostAmount += value.exp;
        }
      }
    });
    win = winAmount - lostAmount;

    // cancel
    // if (winner === -2) {
    //   win = 0;
    // } else if (odds.betValue.no.up === odds.betValue.yes.up) {
    //   // if both type value is same
    //   let winAmount = 0;
    //   let lostAmount = 0;
    //   // winn lay/no
    //   if (odds.betValue.no.up > winner) {
    //     lostAmount = odds.back.exp;
    //     winAmount = odds.lay.win;
    //   } else if (winner >= odds.betValue.yes.up) {
    //     // winn back/yes
    //     winAmount = odds.back.win;
    //     lostAmount = odds.lay.exp;
    //   }
    //   win = winAmount - lostAmount;
    // } else if (odds.betValue.no.up > winner) {
    //   // winn no/lay
    //   const lostAmount = odds.back.exp;
    //   const winAmount = odds.lay.win;
    //   win = winAmount - lostAmount;
    // } else {
    //   // winn back/yes
    //   const winAmount = odds.back.win;
    //   const lostAmount = odds.lay.exp;
    //   win = winAmount - lostAmount;
    // }

    const winData = {
      userId,
      exposure: Math.abs(exposure),
      winInfo: [{ win, comm }],
    };

    winnerUser.push(winData);
  }

  return winnerUser;
}

// premium
async function winnerUserDetailforPremium(betType, matchId, type, selection) {
  const userBetsDetail = [];
  const getUserIds = await mongo.bettingApp
    .model(mongo.models.betsHistory)
    .distinct({
      query: { selection, type, matchId, betType },
      field: "userId",
    });

  for await (const uid of getUserIds) {
    const selectionExp = await betsLastExposurePremiumForWinningCalculation(
      uid,
      selection,
      matchId,
      type,
      betType
    );
    userBetsDetail.push(selectionExp);
  }

  return userBetsDetail;
}

async function formentWinnerUserDetailforPremium(
  winner,
  // betType,
  matchId,
  type,
  selection
) {
  console.log("call formentWinnerUserDetailforPremium ::-");
  const winnerInfo = await winnerUserDetailforPremium(
    "premium",
    matchId,
    type,
    selection
  );

  console.log("get winnerUserDetailforPremium :-");
  console.log(winnerInfo);
  // console.log(winnerInfo.betValue);

  const winnerUser = [];

  for await (const userMatchs of winnerInfo) {
    let win = 0;
    let comm = 0;
    let exposure = 0;
    let userId = "";

    for await (const match of userMatchs) {
      userId = match.userId;
      if (winner.includes("cancel")) {
        win = 0;
      } else if (winner.includes(match.subSelection)) {
        win += match.win;
      } else {
        win -= match.exp;
      }
    }

    const { oldExposure } = await betsLastExposurePremium(
      userId,
      selection,
      matchId,
      type,
      "premium" //betType
    );
    exposure = Math.abs(oldExposure);

    const winData = {
      userId,
      exposure: Math.abs(exposure),
      winInfo: [{ win, comm }],
    };
    if (userId !== "") winnerUser.push(winData);
  }

  console.log("res :--- formentWinnerUserDetailforPremium : ");
  console.log(winnerUser);
  return winnerUser;
}

module.exports = {
  formentWinnerUserDetailForFancy,
  formentWinnerUserDetailforPremium,
};
