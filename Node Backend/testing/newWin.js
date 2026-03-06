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
      balance: 1,
      remaining_balance: 1,
      exposure: 1,
    },
  });

  console.log(" :: userInfo ::: ", userInfo);
  let betList = {};
  //   if (selection === "Abu Dhabi Knight Riders") {
  betList = await mongo.bettingApp.model(mongo.models.betsHistory).find({
    query,
  });
  //   } else {
  //     betList = betsHistoryNew;
  //   }
  const selection = betList[0].selection;
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

betsLastExposureOdds(
  "63d7e86768d2273dcf909760",
  "63d640f03003e3889633b1d1",
  "cricket",
  "odds"
);
