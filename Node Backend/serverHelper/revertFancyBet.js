const { getDate, getStartEndDateTime } = require("../utils/comman/date");
const mongo = require("../config/mongodb");
const rollBackWinner = require("../controllers/admin/setting/fancyHistory/rollBackWinner");
const deleteBet = require("../controllers/admin/riskManager/deleteBet");
// const redis = require("../config/redis");
const redLock = require("../config/redLock");
const { manageSatementAfterRemoveScript } = require("./fixSatementData");

const rollBackFancyBet = async () => {
  const { startDate, endDate } = getStartEndDateTime(
    new Date("Thu Oct 25 2024 21:39:04 GMT+0530 (India Standard Time)"),
    new Date("Thu Oct 25 2024 21:39:04 GMT+0530 (India Standard Time)")
  );
  console.log("dateObject :: ", { startDate, endDate });

  const findBetsQuery = {
    betStatus: "completed",
    betType: "session",
    createdAt: {
      $gte: startDate,
      $lte: endDate,
    },
  };
  // findBetsQuery.createdAt = {
  //     $gte: startDate,
  //     $lte: endDate,
  //   };
  console.log("findBetsQuery: ", findBetsQuery);

  const betsInfo = await mongo.bettingApp
    .model(mongo.models.betsHistory)
    .findOne({
      query: findBetsQuery,
      select: {
        _id: 1,
        matchId: 1,
        selection: 1,
        // betType: 1,
      },
      // limit: 1,
    });

  console.log("betsInfo: ", betsInfo);

  // const newBets = await betsInfo.reduce((acc, current) => {
  //   // Check if there's an object in `acc` with the same `id` and `selection`
  //   if (
  //     !acc.some(
  //       (item) =>
  //         item.matchId.toString() === current.matchId.toString() &&
  //         item.selection === current.selection
  //     )
  //   ) {
  //     acc.push(current);
  //   }
  //   return acc;
  // }, []);

  // console.log("newBets:: ", newBets.length);
  // console.log("newBets:: ", newBets);

  // for await (const bet of newBets)
  if (betsInfo) {
    console.log("isRollback :: start : ", betsInfo);
    const isRollback = await rollBackWinner.handler({
      body: {
        id: betsInfo.matchId,
        selection: betsInfo.selection,
      },
    });

    console.log("isRollback :: ", isRollback, betsInfo);

    if (isRollback && isRollback?.msg) {
      console.log("bet is rollback done");
      const dataReturn = await deleteBets(betsInfo.matchId, betsInfo.selection);
      console.log("All Users Bet remove it.", { dataReturn });

      setTimeout(() => {
        rollBackFancyBet();
      }, 3000);
    }
  }

  console.log("script done");
};

// const deleteBets = async (matchId, selection) => {
const deleteBets = async () => {
  const { startDate, endDate } = getStartEndDateTime(
    new Date("Thu Oct 25 2024 21:39:04 GMT+0530 (India Standard Time)"),
    new Date("Thu Oct 25 2024 21:39:04 GMT+0530 (India Standard Time)")
  );
  console.log("dateObject :: ", { startDate, endDate });

  const query = {
    // betStatus: { $ne: "completed" },
    deleted: true,
    betType: "session",
    createdAt: {
      $gte: startDate,
      $lte: endDate,
    },
  };

  // const query = {
  //   matchId,
  //   selection,
  //   deleted: false,
  //   betStatus: { $ne: "completed" },
  // };

  const betsInfo = await mongo.bettingApp
    .model(mongo.models.betsHistory)
    .distinct({
      query: query,
      field: "userId",
    });

  for await (const betId of betsInfo) {
    // const deleteBetData = await deleteBet.handler({
    //   body: {
    //     id: betId,
    //     flag: true,
    //   },
    //   user: { userId: betId },
    // });
    // if (deleteBetData && deleteBetData.msg) {
    //   console.log("bet is deleted : ", deleteBetData, betId);
    // }
    const statementsSet = await manageSatementAfterRemoveScript(startDate, betId);
    if (statementsSet) {
      console.log("statementsSet is done");
    }else{
      console.log("statementsSet is not done");
    }
    
  }

  console.log('statementsSet script completed');
  
  // return true;
  
};

async function test() {
  await redLock.initializeRedlock();
  deleteBets();
}

test();
