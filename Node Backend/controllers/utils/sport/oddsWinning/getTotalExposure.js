const mongo = require("../../../../config/mongodb");
const { calculatExposure } = require("../getUserBets");

async function getTotalExposure(userId, matchId, type, betType) {
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

  exposure = calculatExposure({ back, lay });

  console.log(selection, " ::  betsLastExposure :: ");
  console.log({
    back,
    lay,
    exposure,
    betValue,
    commission: userInfo.commission,
  });
  return exposure;
}

async function betsLastExposureOddsForWinning(
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

  let betList = {};
  // if (selection === "Abu Dhabi Knight Riders") {
  betList = await mongo.bettingApp.model(mongo.models.betsHistory).find({
    query,
  });

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
      selectionWiseExp.first.back.exp += bet.exposure;
      selectionWiseExp.first.back.win += bet.profit;
    } else {
      selectionWiseExp.first.lay.exp += bet.profit;
      selectionWiseExp.first.lay.win += bet.betPlaced;
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

  // exposure = calculatExpostre({ back, lay });

  console.log(selection, " ::  betsLastExposure :: ");
  console.log({
    back,
    lay,
    // exposure,
    // betValue,
    // commission: userInfo.commission,
  });
  return { back, lay };
}

module.exports = { getTotalExposure, betsLastExposureOddsForWinning };
