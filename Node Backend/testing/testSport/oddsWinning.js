const mongo = require("../../config/mongodb");
const betsHistoryData = [
    {
        "_id" : "675c0b259f74d5aea70ef4ca",
        "userId" : "6717f828b9ca0f52c59e8d2c",
        "matchId" : "675b4ed1c04be6bb0b69c54a",
        "type" : "cricket",
        "betType" : "odds",
        "betSide" : "back",
        "betStatus" : "completed",
        "winnerSelection" : [ 
            "Galle Marvels", 
            "Nuwara Eliya Kings"
        ],
        "selection" : "Nuwara Eliya Kings",
        "subSelection" : "",
        "betId" : 0,
        "betPlaced" : 3,
        "stake" : 3,
        "oddsUp" : 4.5,
        "oddsDown" : 25368.66,
        "fancyYes" : 0,
        "fancyNo" : 0,
        "profit" : 10.5,
        "exposure" : 3,
        "tType" : "cancel",
        "deleted" : false,
        "teams" : "",
        "winner" : "cancel",
        "isMatched" : true,
        "oldOdds" : 4.5,
        "isCheat" : false,
        "createdAt" : "2024-12-13T10:23:33.495Z",
        "updatedAt" : "2024-12-13T12:10:24.081Z",
        "__v" : 0
    },
    {
        "_id" : "675c0b259f74d5aea70ef4ca",
        "userId" : "6717f828b9ca0f52c59e8d2c",
        "matchId" : "675b4ed1c04be6bb0b69c54a",
        "type" : "cricket",
        "betType" : "odds",
        "betSide" : "back",
        "betStatus" : "completed",
        "winnerSelection" : [ 
            "Galle Marvels", 
            "Nuwara Eliya Kings"
        ],
        "selection" : "Nuwara Eliya Kings",
        "subSelection" : "",
        "betId" : 0,
        "betPlaced" : 3,
        "stake" : 3,
        "oddsUp" : 4.5,
        "oddsDown" : 25368.66,
        "fancyYes" : 0,
        "fancyNo" : 0,
        "profit" : 10.5,
        "exposure" : 3,
        "tType" : "cancel",
        "deleted" : false,
        "teams" : "",
        "winner" : "cancel",
        "isMatched" : true,
        "oldOdds" : 4.5,
        "isCheat" : false,
        "createdAt" : "2024-12-13T10:23:33.495Z",
        "updatedAt" : "2024-12-13T12:10:24.081Z",
        "__v" : 0
    }
]

async function test() {
    
  const data = await formentWinnerUserDetail(
        'cancel',
        "odds",
        '675b4ed1c04be6bb0b69c54a',
        'cricket'
    );

    console.log("data :: ", JSON.stringify(data));
    
}
test()

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

  // odds and bookmaker
async function winnerUserDetailforOddsAndBook(betType, matchId, type, winner) {
    console.log(new Date(), "call :- winnerUserDetailforOddsAndBook", betType, matchId, type);
    const userBetsDetail = [];
    // const getUserIds = await mongo.bettingApp
    //   .model(mongo.models.betsHistory)
    //   .distinct({
    //     query: { type, matchId: mongo.ObjectId(matchId), betType },
    //     field: "userId",
    //   });
  
    const getUserIds = ['6717f828b9ca0f52c59e8d2c']
    console.log(new Date(), "getUserIds :-");
    console.log(getUserIds);
    for await (const uid of getUserIds) {
      console.log(new Date(), "uid :- ", uid);
    //   const getSelection = await mongo.bettingApp
    //     .model(mongo.models.betsHistory)
    //     .distinct({
    //       query: {
    //         type,
    //         userId: uid,
    //         betType,
    //         matchId: mongo.ObjectId(matchId),
    //       },
    //       field: "selection",
    //     });
    const getSelection = betsHistoryData.map((f)=>f.selection)
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
  
    //   const userInfo = await mongo.bettingApp.model(mongo.models.users).findOne({
    //     query: { _id: mongo.ObjectId(uid) },
    //     select: {
    //       commission: 1,
    //     },
    //   });
  
      const { oldExpAmount } = await betsLastExposureOdds(
        uid,
        matchId,
        type,
        betType
      );
      console.log(new Date(), "newExposure :: ", oldExpAmount);
      const userBetList = {
        userId: uid,
        commission: 0,
        bets: userSelectionBet,
        exposure: oldExpAmount,
      };
      userBetsDetail.push(userBetList);
    }
  
    console.log(new Date(), "res :- winnerUserDetailforOddsAndBook :- ");
    console.log(userBetsDetail);
    return userBetsDetail;
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
  
    let betList = betsHistoryData;
    // if (selection === "Abu Dhabi Knight Riders") {
    // betList = await mongo.bettingApp.model(mongo.models.betsHistory).find({
    //   query,
    // });
  
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
  
  // only for odds and bookmaker
  async function betsLastExposureOdds(userId, matchId, type, betType) {
    // const query = {
    //   matchId: mongo.ObjectId(matchId),
    //   userId: mongo.ObjectId(userId),
    //   betType,
    //   // selection,
    //   type,
    //   deleted: false,
    // };

    // const userInfo = await mongo.bettingApp.model(mongo.models.users).findOne({
    //   query: { _id: mongo.ObjectId(userId) },
    //   select: {
    //     commission: 1,
    //   },
    // });
    const betList = betsHistoryData;
  
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
    });
    return { oldExpAmount, oldExp, commission: 0 };
  }