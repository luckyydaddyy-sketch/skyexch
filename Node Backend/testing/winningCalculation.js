const mongo = require("../config/mongodb");

function calculatExpostre(oldBets) {
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
    // 3: if lay both amount is high to back(5)
    newExp = oldBets.lay.exp - oldBets.back.win;
  } else if (
    oldBets.back.win > oldBets.lay.win &&
    oldBets.back.exp > oldBets.lay.exp
  ) {
    console.log(" calculatExpostre : 444 :: ");
    // 4: if back both amount is high to lay
    newExp = oldBets.back.exp - oldBets.lay.win;
  } else if (
    oldBets.lay.exp > oldBets.back.exp &&
    oldBets.back.win > oldBets.lay.win
  ) {
    console.log(" calculatExpostre : 555 :: ");
    // 5: if lay expocer high and back win high (3)
    newExp = oldBets.lay.exp - oldBets.back.win;
  } else if (
    oldBets.lay.win > oldBets.back.win &&
    oldBets.back.exp > oldBets.lay.exp
  ) {
    console.log(" calculatExpostre : 666 :: ");
    newExp = oldBets.back.exp - oldBets.lay.win;
  }
  //  else if(oldBets.lay.win > oldBets.back.win && ){

  // }
  console.log(" calculatExpostre : end :: ");
  return newExp;
}

// get expocer
async function getExpocer(userId, selection, matchId, type, betType) {
  const query = {
    matchId: mongo.ObjectId(matchId),
    userId: mongo.ObjectId(userId),
    betType,
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

  console.log("getExpocer :: userInfo ::: ", userInfo);
  let betList = {};
  // if (selection === "Abu Dhabi Knight Riders") {
  betList = await mongo.bettingApp.model(mongo.models.betsHistory).find({
    query,
  });
  // } else {
  //   betList = betsHistoryNew;
  // }

  const selectionWiseExp = {
    // first here we have selection
    first: {
      back: {
        exp: 0, // bet
        win: 0, // profit
      },
      lay: {
        exp: 0, // profit -- lost this amount
        win: 0, // bet.
      },
    },
    second: {
      back: {
        exp: 0, // bet
        win: 0, // profit
      },
      lay: {
        exp: 0, // profit -- lost this amount
        win: 0, // bet.
      },
    },
  };

  for await (const bet of betList) {
    if (bet.betSide === "back") {
      // update first key values
      if (bet.selection === selection) {
        // selectionWiseExp.first.back;
        selectionWiseExp.first.back.exp += bet.exposure;
        selectionWiseExp.first.back.win += bet.profit;
      } else {
        selectionWiseExp.second.back.exp += bet.exposure;
        selectionWiseExp.second.back.win += bet.profit;
      }
    } else {
      if (bet.selection === selection) {
        selectionWiseExp.first.lay.exp += bet.profit;
        selectionWiseExp.first.lay.win += bet.betPlaced;
      } else {
        selectionWiseExp.second.lay.exp += bet.profit;
        selectionWiseExp.second.lay.win += bet.betPlaced;
      }
    }
  }

  console.log("getExpocer :: selectionWiseExp :: ", selectionWiseExp);
  let exposure = 0;
  let back = {
    exp: selectionWiseExp.first.back.exp + selectionWiseExp.second.lay.exp, // bet
    win: selectionWiseExp.first.back.win + selectionWiseExp.second.lay.win, // profit
  };
  let lay = {
    exp: selectionWiseExp.first.lay.exp + selectionWiseExp.second.back.exp, // profit -- lost this amount
    win: selectionWiseExp.first.lay.win + selectionWiseExp.second.back.win, // bet.
  };
  let betValue = {
    no: { up: -2, down: -2 },
    yes: { up: -2, down: -2 },
  };

  exposure = calculatExpostre({ back, lay });

  console.log("getExpocer ::  betsLastExposure :: ");
  console.log({
    back,
    lay,
    exposure,
    betValue,
    commission: userInfo.commission,
  });
  return exposure;
}

// use for all match // only for odds and bookmaker
async function betsLastExposureOdds(userId, selection, matchId, type, betType) {
  const query = {
    matchId: mongo.ObjectId(matchId),
    userId: mongo.ObjectId(userId),
    betType,
    selection,
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
  // if (selection === "Abu Dhabi Knight Riders") {
  betList = await mongo.bettingApp.model(mongo.models.betsHistory).find({
    query,
  });
  // } else {
  //   betList = betsHistoryNew;
  // }

  const selectionWiseExp = {
    // first here we have selection
    first: {
      back: {
        exp: 0, // bet
        win: 0, // profit
      },
      lay: {
        exp: 0, // profit -- lost this amount
        win: 0, // bet.
      },
    },
    second: {
      back: {
        exp: 0, // bet
        win: 0, // profit
      },
      lay: {
        exp: 0, // profit -- lost this amount
        win: 0, // bet.
      },
    },
  };

  for await (const bet of betList) {
    if (bet.betSide === "back") {
      // update first key values
      // if (bet.selection === selection) {
      // selectionWiseExp.first.back;
      selectionWiseExp.first.back.exp += bet.exposure;
      selectionWiseExp.first.back.win += bet.profit;
      // } else {
      //   selectionWiseExp.second.back.exp += bet.exposure;
      //   selectionWiseExp.second.back.win += bet.profit;
      // }
    } else {
      // if (bet.selection === selection) {
      selectionWiseExp.first.lay.exp += bet.profit;
      selectionWiseExp.first.lay.win += bet.betPlaced;
      // } else {
      //   selectionWiseExp.second.lay.exp += bet.profit;
      //   selectionWiseExp.second.lay.win += bet.betPlaced;
      // }
    }
  }

  console.log("selectionWiseExp :: ", selectionWiseExp);
  let exposure = 0;
  let back = {
    exp: selectionWiseExp.first.back.exp + selectionWiseExp.second.lay.exp, // bet
    win: selectionWiseExp.first.back.win + selectionWiseExp.second.lay.win, // profit
  };
  let lay = {
    exp: selectionWiseExp.first.lay.exp + selectionWiseExp.second.back.exp, // profit -- lost this amount
    win: selectionWiseExp.first.lay.win + selectionWiseExp.second.back.win, // bet.
  };
  let betValue = {
    no: { up: -2, down: -2 },
    yes: { up: -2, down: -2 },
  };

  exposure = calculatExpostre({ back, lay });

  console.log(selection, " ::  betsLastExposure :: ");
  console.log({
    back,
    lay,
    exposure,
    betValue,
    commission: userInfo.commission,
  });
  return { back, lay, exposure, betValue, commission: userInfo.commission };
}

async function winnerUserDetailforOddsAndBook(betType, matchId, type, winner) {
  console.log("call :- winnerUserDetailforOddsAndBook", betType, matchId, type);
  const userBetsDetail = [];
  // const getUserIds = await mongo.bettingApp
  //   .model(mongo.models.betsHistory)
  //   .aggregate({
  //     pipeline: [
  //       { $match: { type, matchId: mongo.ObjectId(matchId), betType } },
  //       { $group: { _id: "$userId", count: { $sum: 1 } } },
  //     ],
  //   });
  const getUserIds = await mongo.bettingApp
    .model(mongo.models.betsHistory)
    .distinct({
      query: { type, matchId: mongo.ObjectId(matchId), betType },
      field: "userId",
    });

  console.log("getUserIds :-");
  console.log(getUserIds);
  for await (const uid of getUserIds) {
    console.log("uid :- ", uid);
    const getSelection = await mongo.bettingApp
      .model(mongo.models.betsHistory)
      .distinct({
        query: {
          type,
          userId: uid,
          betType,
          matchId: mongo.ObjectId(matchId),
        },
        field: "selection",
      });
    console.log("getSelection :-");
    console.log(getSelection);
    const userSelectionBet = [];

    for await (const selection of getSelection) {
      const selectionExp = await betsLastExposureOdds(
        uid,
        selection,
        matchId,
        type,
        betType
      );

      const userBet = {
        // userId: uid,
        selection: selection,
        ...selectionExp,
      };
      userSelectionBet.push(userBet);
    }

    const newExposure = await getExpocer(uid, winner, matchId, type, betType);
    console.log("newExposure :: ", newExposure);
    const userBet = {
      userId: uid,
      // selection: selection,
      bets: userSelectionBet,
      exposure: newExposure,
    };
    userBetsDetail.push(userBet);
  }

  console.log("res :- winnerUserDetailforOddsAndBook :- ");
  console.log(userBetsDetail);
  return userBetsDetail;
}

async function formentWinnerUserDetail(winner, betType, matchId, type) {
  console.log("winnCalcu :: call formentWinnerUserDetail ::-");
  const winnerInfo = await winnerUserDetailforOddsAndBook(
    betType,
    matchId,
    type,
    winner
  );

  console.log("get winnerUserDetailforOddsAndBook :-");
  console.log(JSON.stringify(winnerInfo));
  console.log(winnerInfo);
  // console.log(winnerInfo.betValue);

  // match 1 and 2
  const winnerUser = [];
  for await (const odds of winnerInfo) {
    const winnerMatch = [];
    const { exposure, userId, commission, bets } = odds;
    for (const match of bets) {
      let winInfo = {};
      let win = 0;
      let comm = 0;
      if (winner === "cancel") {
        win = 0;
      } else if (match.selection === winner) {
        // back win
        // match 1b and 2l Or 2b and 1l
        const winAmount = match.back.win;
        const lostAmount = match.lay.exp;
        win = winAmount - lostAmount;
      } else {
        // lay win
        // match 2b and 1l Or 1b and 2l
        const lostAmount = match.back.exp;
        const winAmount = match.lay.win;
        win = winAmount - lostAmount;
      }
      if (betType === "odds" && win > 0) {
        comm = (win * commission) / 100;
        win -= comm;
      }

      winInfo = {
        // userId,
        // exposure,
        win,
        comm,
      };

      winnerMatch.push(winInfo);
    }
    const winData = {
      userId,
      exposure,
      winInfo: winnerMatch,
    };
    winnerUser.push(winData);
  }

  console.log("res :--- formentWinnerUserDetail : ");
  console.log(JSON.stringify(winnerUser));
  console.log(winnerUser);
  return winnerUser;
}

function test(params) {}

formentWinnerUserDetail(
  // "Dhaka Dominators",
  // "Dubai Capitals",
  "cancel",
  "odds",
  "63d640f03003e3889633b1d1",
  "cricket"
);
// winnerUserDetailforOddsAndBook("odds", "63d6a4053003e38896376add", "cricket");
// check old bet exp
// betsLastExposureOdds(
//   "63d7e86768d2273dcf909760",
//   "Fortune Barishal",
//   "63d6a4053003e38896376add",
//   "cricket",
//   "odds"
// );
