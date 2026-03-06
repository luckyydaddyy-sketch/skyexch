const mongo = require("../../../../config/mongodb");
const { betsLastExposureOdds } = require("../getUserBets");
const {
  betsLastExposureOddsForWinning,
  getTotalExposure,
} = require("./getTotalExposure");

// odds and bookmaker
async function winnerUserDetailforOddsAndBook(betType, matchId, type, winner) {
  console.log(new Date(), "call :- winnerUserDetailforOddsAndBook", betType, matchId, type);
  const userBetsDetail = [];
  const getUserIds = await mongo.bettingApp
    .model(mongo.models.betsHistory)
    .distinct({
      query: { type, matchId: mongo.ObjectId(matchId), betType },
      field: "userId",
    });

  console.log(new Date(), "getUserIds :-");
  console.log(getUserIds);
  for await (const uid of getUserIds) {
    console.log(new Date(), "uid :- ", uid);
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
    console.log(new Date(), "getSelection :-");
    console.log(getSelection);
    const userSelectionBet = [];

    for await (const selection of getSelection) {
      const selectionExp = await betsLastExposureOddsForWinning(
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

    const userInfo = await mongo.bettingApp.model(mongo.models.users).findOne({
      query: { _id: mongo.ObjectId(uid) },
      select: {
        commission: 1,
      },
    });

    const { oldExpAmount } = await betsLastExposureOdds(
      uid,
      matchId,
      type,
      betType
    );
    console.log(new Date(), "newExposure :: ", oldExpAmount);
    const userBetList = {
      userId: uid,
      commission: userInfo.commission,
      bets: userSelectionBet,
      exposure: oldExpAmount,
    };
    userBetsDetail.push(userBetList);
  }

  console.log(new Date(), "res :- winnerUserDetailforOddsAndBook :- ");
  console.log(userBetsDetail);
  return userBetsDetail;
}

// odds and bookmaker
async function formentWinnerUserDetail(winner, betType, matchId, type) {
  console.log(new Date(), "winUser:: call formentWinnerUserDetail ::- ", matchId);
  const winnerInfo = await winnerUserDetailforOddsAndBook(
    betType,
    matchId,
    type,
    winner
  );

  console.log(new Date(), "get winnerUserDetailforOddsAndBook :-");
  console.log(JSON.stringify(winnerInfo));
  console.log(winnerInfo);
  // console.log(winnerInfo.betValue);

  // match 1 and 2
  const winnerUser = [];
  for await (const odds of winnerInfo) {
    const winnerMatch = [];
    const { exposure, userId, commission, bets } = odds;
    let winInfo = {};
    let win = 0;
    let comm = 0;
    for await (const match of bets) {
      if (winner === "cancel") {
        win = 0;
      } else if (match.selection === winner) {
        console.log(new Date(), "call :b: ", match.selection);
        // match 1b and 2l Or 2b and 1l
        const winAmount = match.back.win;
        const lostAmount = match.lay.exp;
        win += winAmount - lostAmount;
        console.log(new Date(), "win :b: ", win);
      } else {
        console.log(new Date(), "call :l: ", match.selection);
        // match 2b and 1l Or 1b and 2l
        const lostAmount = match.back.exp;
        const winAmount = match.lay.win;
        win += winAmount - lostAmount;
        console.log(new Date(), "win :lay: ", win);
      }
    }

    if (betType === "odds" && win > 0) {
      console.log(new Date(), "comiii : ", commission);
      comm = (win * commission) / 100;
      console.log(new Date(), "comiii :comm: ", comm);
      win -= comm;
      console.log(new Date(), "comiii : win : ", win);
    }

    winInfo = {
      // userId,
      // exposure,
      win,
      comm,
    };

    winnerMatch.push(winInfo);
    const winData = {
      userId,
      exposure: Math.abs(exposure),
      winInfo: winnerMatch,
    };
    winnerUser.push(winData);
  }

  console.log(new Date(), "res :--- formentWinnerUserDetail : ");
  console.log(JSON.stringify(winnerUser));
  console.log(winnerUser);
  return winnerUser;
}

module.exports = {
  winnerUserDetailforOddsAndBook,
  formentWinnerUserDetail,
};
