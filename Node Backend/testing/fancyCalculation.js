const mongo = require("../config/mongodb");
// oldBets.back.exp - oldBets.lay.win
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
    oldBets.back.exp >= oldBets.lay.exp
  ) {
    console.log(" calculatExpostre : 444 :: ");
    // 4: if back both amount is high to lay
    newExp = oldBets.back.exp - oldBets.lay.win;
  } else if (
    oldBets.lay.exp > oldBets.back.exp &&
    oldBets.back.win > oldBets.lay.win
  ) {
    console.log(" calculatExpostre : 555 :: ");
    // 5: if lay expocer high and back win high
    newExp = oldBets.lay.exp - oldBets.back.win;
  } else if (
    oldBets.lay.win > oldBets.back.win &&
    oldBets.back.exp > oldBets.lay.exp
  ) {
    console.log(" calculatExpostre : 666 :: ");
    newExp = oldBets.back.exp - oldBets.lay.win;
  }
  console.log(" calculatExpostre : end :: ");
  return newExp;
}

async function betsLastExposure(userId, matchId) {
  const query = {
    matchId: mongo.ObjectId(matchId),
    userId: mongo.ObjectId(userId),
    // betSide: "yes",
    //   betType,
    //   selection,
    //   type,
    //   deleted: false,
  };

  const betList = await mongo.bettingApp.model(mongo.models.betsHistory).find({
    query,
  });

  let arr = [];
  for await (const bet of betList) {
    const selection = bet.selection;
    let back = {
      exp: 0, // bet
      win: 0, // profit
    };
    let lay = {
      exp: 0, // profit -- lost this amount
      win: 0, // bet.
    };

    if (bet.betSide === "yes") {
      back.exp += bet.exposure;
      back.win += bet.profit;
    } else {
      lay.exp += bet.profit;
      lay.win += bet.betPlaced;
    }

    const dublicat = arr.findIndex((ele) => ele.selection === selection);
    if (dublicat === -1) {
      arr.push({
        selection,
        back,
        lay,
      });
    } else {
      arr[dublicat].lay.exp += lay.exp;
      arr[dublicat].lay.win += lay.win;
      arr[dublicat].back.exp += back.exp;
      arr[dublicat].back.win += back.win;
    }
  }
  console.log("arr :1:: ", arr);
  arr = arr.map((ele) => {
    const exposure = calculatExposure({ back: ele.back, lay: ele.lay });

    return {
      selection: ele.selection,
      exposure,
    };
  });
  //   exposure = await calculatExposure({ back, lay });
  console.log("arr ::: ", arr);

  return arr;
}

betsLastExposure("63d90e4f226e4873f39a6f65", "63d6a4053003e38896376ae9");
