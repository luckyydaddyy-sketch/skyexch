const { getDate } = require("./date");
const mongo = require("../../config/mongodb");
const moment = require("moment-timezone");
// const { getpages } = require("../../config/sportsAPI");

async function setDetail(matchDetail, type, userId, flag = false) {
  const newData = [];
  const { endDate, startDate } = getDate("yesterday");
  
  const matchArray = Array.isArray(matchDetail) ? matchDetail : matchDetail?.data || [];
  if (matchArray && matchArray.length > 0) {
    // const matchIdsArror = matchArray.map((value) => {
    //   return { marketId: value.marketId, gameId: value.gameId };
    // });

    // const query = {
    //   type,
    //   $or: matchIdsArror,
    //   // marketId: crt.marketId,
    //   // gameId: crt.gameId,
    //   winner: "",
    //   status: true,
    //   startDate: { $gt: endDate },
    // }; // same = 1

    // const allMatchInfo = await mongo.bettingApp
    //   .model(mongo.models.sports)
    //   .find({
    //     query,
    //     select: {
    //       _id: 1,
    //       marketId: 1,
    //       gameId: 1,
    //     },
    //   }); // same = 1

    // console.log("allMatchInfo ::: ", allMatchInfo);
    for await (const crt of matchArray) {
      const query = {
        type,
        marketId: crt.marketId,
        gameId: crt.gameId,
        winner: "",
        status: true,
        "activeStatus.status": true,
        startDate: { $gt: startDate },
      }; // same = 2
      // console.log("sport : matchInfo :: query : ", query);
      const matchInfo = await mongo.bettingApp
        .model(mongo.models.sports)
        .findOne({
          query,
          select: {
            _id: 1,
            type: 1,
            // marketId: 1,
            // gameId: 1,
          },
        }); // same = 2

      // console.log("sport : matchInfo :: ", matchInfo);

      // const indexOfMatch = allMatchInfo.findIndex(
      //   (value) =>
      //     value.marketId === crt.marketId && value.gameId === crt.gameId
      // ); // same = 1

      // console.log("indexOfMatch ::: ", indexOfMatch);
      // if (indexOfMatch !== -1) {
      // same = 1
      crt.type = type;
      if (matchInfo) {
        const pinInfo = await mongo.bettingApp
          .model(mongo.models.pins)
          .findOne({
            query: {
              userId,
              type,
              pin: matchInfo._id,
            },
          });
        crt._id = matchInfo._id;
        crt.pin = pinInfo ? true : false;
        newData.push(crt);
      } else {
        // Match not in MongoDB - fallback to gameId
        crt._id = String(crt.gameId);
        crt.pin = false;
        newData.push(crt);

        if (flag) {
          // not use this section
          const querySL = {
            marketId: crt.marketId,
            gameId: crt.gameId,
            type,
          };
          const matchInfoFromLeage = await mongo.bettingApp
            .model(mongo.models.sportsLeage)
            .findOne({
              query: querySL,
            });
          const document = {
            name: crt.eventName,
            openDate: crt.openDate,
            startDate: new Date(crt.openDate),
            type,
          gameId: crt.gameId,
          marketId: crt.marketId,
          activeStatus: {
            // bookmaker: crt.m1,
            // fancy: crt.f,
            // premium: crt.p,
            bookmaker: true,
            fancy: true,
            premium: true,
            status: false,
          },
          suspend: {
            bookmaker: false,
            fancy: false,
            premium: false,
            odds: false,
          },
          oddsLimit: {
            min: 1,
            max: 2,
          },
          bet_odds_limit: {
            min: 1,
            max: 2,
          },
          bet_bookmaker_limit: {
            min: 1,
            max: 2,
          },
          bet_fancy_limit: {
            min: 1,
            max: 2,
          },
          bet_premium_limit: {
            min: 1,
            max: 2,
          },
        };
        if (!matchInfoFromLeage) {
          await mongo.bettingApp.model(mongo.models.sportsLeage).insertOne({
            document,
          });
        } else {
          await mongo.bettingApp.model(mongo.models.sportsLeage).updateOne({
            query: querySL,
            update: {
              ...document,
              status: false,
            },
          });
        }
        // crt._id = newSport._id;
        // crt.oddsLimit = newSport.oddsLimit;
        // crt.bet_odds_limit = newSport.bet_odds_limit;
        // crt.bet_bookmaker_limit = newSport.bet_bookmaker_limit;
        // crt.bet_fancy_limit = newSport.bet_fancy_limit;
        // crt.bet_premium_limit = newSport.bet_premium_limit;
      }
    }
  }
}
  return newData;
}

// async function setDetailForGetMainSportEvent(matchDetail, type) {
//   const newData = [];
//   const { endDate } = getDate("yesterday");
//   if (matchDetail && matchDetail.data)
//     for await (const crt of matchDetail.data) {
//       const query = {
//         marketId: crt.marketId,
//         gameId: crt.gameId,
//         type,
//         winner: "",
//         status: true,
//         startDate: { $gt: endDate },
//       };
//       const matchInfo = await mongo.bettingApp
//         .model(mongo.models.sports)
//         .findOne({
//           query,
//         });

//       if (matchInfo) {
//         crt._id = matchInfo._id;
//         // crt.oddsLimit = matchInfo.oddsLimit;
//         // crt.bet_odds_limit = matchInfo.bet_odds_limit;
//         // crt.bet_bookmaker_limit = matchInfo.bet_bookmaker_limit;
//         // crt.bet_fancy_limit = matchInfo.bet_fancy_limit;
//         // crt.bet_premium_limit = matchInfo.bet_premium_limit;
//         newData.push(crt);
//       }
//     }
//   return newData;
// }

async function setDetailNewForInPlayAndCount(
  matchDetail,
  type,
  filter,
  userId,
  flag = false
) {
  const newData = [];
  const { endDate, startDate } = getDate("yesterday");

  const matchArray = Array.isArray(matchDetail) ? matchDetail : matchDetail?.data || [];
  if (matchArray && matchArray.length > 0) {
    const matchIdsArror = matchArray.map((value) => {
      return { marketId: value.marketId, gameId: value.gameId };
    });

    const query = {
      type,
      $or: matchIdsArror,
      // marketId: crt.marketId,
      // gameId: crt.gameId,
      winner: "",
      status: true,
      "activeStatus.status": true,
      startDate: { $gt: startDate },
    }; // same = 1

    const allMatchInfo = await mongo.bettingApp
      .model(mongo.models.sports)
      .find({
        query,
        select: {
          _id: 1,
          marketId: 1,
          gameId: 1,
        },
      }); // same = 1

    // console.log("allMatchInfo ::: ", allMatchInfo);
    for await (const crt of matchArray) {
      crt.type = type;
      // const query = {
      //   type,
      //   marketId: crt.marketId,
      //   gameId: crt.gameId,
      //   winner: "",
      //   status: true,
      //   startDate: { $gt: endDate },
      // }; // same = 2
      // const matchInfo = await mongo.bettingApp
      //   .model(mongo.models.sports)
      //   .findOne({
      //     query,
      //     select: {
      //       _id: 1,
      //       // marketId: 1,
      //       // gameId: 1,
      //     },
      //   }); // same = 2

      const indexOfMatch = allMatchInfo.findIndex(
        (value) =>
          value.marketId === crt.marketId && value.gameId === crt.gameId
      ); // same = 1

      // console.log("indexOfMatch ::: ", indexOfMatch);
      if (indexOfMatch !== -1) {
        const matchInfo = allMatchInfo[indexOfMatch]; // same = 1
        if (userId && userId !== "") {
          const pinInfo = await mongo.bettingApp
            .model(mongo.models.pins)
            .findOne({
              query: {
                userId,
                type,
                pin: matchInfo._id,
              },
            });
          crt.pin = pinInfo ? true : false;
        } else {
          crt.pin = false;
        }
        // same = 1
        // if (matchInfo) {
        // same = 2

        // console.log("matchInfo ::: ", matchInfo);
        crt._id = matchInfo._id;
        // crt.oddsLimit = matchInfo.oddsLimit;
        // crt.bet_odds_limit = matchInfo.bet_odds_limit;
        // crt.bet_bookmaker_limit = matchInfo.bet_bookmaker_limit;
        // crt.bet_fancy_limit = matchInfo.bet_fancy_limit;
        // crt.bet_premium_limit = matchInfo.bet_premium_limit;
        const { endDate, startDate } = await getDate(filter);

        if (filter === "play" && crt.inPlay) {
          // console.log("setFilterDetail : call --- play");
          newData.push(crt);
        } else if (
          filter === "today" &&
          !crt.inPlay &&
          // startDate < new Date(crt.openDate) &&
          // endDate > new Date(crt.openDate)
          startDate < moment.tz(crt.openDate, "Asia/Dhaka") &&
          endDate > moment.tz(crt.openDate, "Asia/Dhaka")
        ) {
          // console.log("setFilterDetail : call --- today");
          newData.push(crt);
        } else if (
          filter === "tomorrow" &&
          // startDate < new Date(crt.openDate) &&
          // endDate > new Date(crt.openDate)
          startDate < moment.tz(crt.openDate, "Asia/Dhaka") &&
          endDate > moment.tz(crt.openDate, "Asia/Dhaka")
        ) {
          // console.log("setFilterDetail : call --- tomorrow");
          newData.push(crt);
        }

        // newData.push(crt);
      } else if (flag) {
        // not use this section
        const querySL = {
          marketId: crt.marketId,
          gameId: crt.gameId,
          type,
        };
        const matchInfoFromLeage = await mongo.bettingApp
          .model(mongo.models.sportsLeage)
          .findOne({
            query: querySL,
          });
        // data.data
        // const page = await getpages(crt.gameId, crt.marketId);
        // if (page && page.data && page.data.data) {
        // }
        const document = {
          name: crt.eventName,
          openDate: crt.openDate,
          startDate: new Date(crt.openDate),
          type,
          gameId: crt.gameId,
          marketId: crt.marketId,
          activeStatus: {
            // bookmaker: crt.m1,
            // fancy: crt.f,
            // premium: crt.p,
            bookmaker: true,
            fancy: true,
            premium: true,
            status: false,
          },
          suspend: {
            bookmaker: false,
            fancy: false,
            premium: false,
            odds: false,
          },
          oddsLimit: {
            min: 1,
            max: 2,
          },
          bet_odds_limit: {
            min: 1,
            max: 2,
          },
          bet_bookmaker_limit: {
            min: 1,
            max: 2,
          },
          bet_fancy_limit: {
            min: 1,
            max: 2,
          },
          bet_premium_limit: {
            min: 1,
            max: 2,
          },
        };
        if (!matchInfoFromLeage) {
          await mongo.bettingApp.model(mongo.models.sportsLeage).insertOne({
            document,
          });
        } else {
          await mongo.bettingApp.model(mongo.models.sportsLeage).updateOne({
            query: querySL,
            update: {
              ...document,
              status: false,
            },
          });
        }
        // crt._id = newSport._id;
        // crt.oddsLimit = newSport.oddsLimit;
        // crt.bet_odds_limit = newSport.bet_odds_limit;
        // crt.bet_bookmaker_limit = newSport.bet_bookmaker_limit;
        // crt.bet_fancy_limit = newSport.bet_fancy_limit;
        // crt.bet_premium_limit = newSport.bet_premium_limit;
      }
    }
  }
  return newData;
}

async function setFilterDetail(matchDetail, type, filter) {
  // console.log(`setFilterDetail :: type :: ${type} :: filter :: ${filter}`);
  // console.log("setFilterDetail :: matchDetail ::: ");
  // console.log(matchDetail);
  const res = await setDetailNewForInPlayAndCount(matchDetail, type, filter);
  // console.log("setFilterDetail in_play :: res :::: ", new Date());
  // console.log(res);
  const newData = [];
  const { endDate, startDate } = await getDate(filter);

  for await (const crt of res) {
    if (filter === "play" && crt.inPlay) {
      // console.log("setFilterDetail : call --- play");
      newData.push(crt);
    } else if (
      filter === "today" &&
      !crt.inPlay &&
      // startDate < new Date(crt.openDate) &&
      // endDate > new Date(crt.openDate)
      startDate < moment.tz(crt.openDate, "Asia/Dhaka") &&
      endDate > moment.tz(crt.openDate, "Asia/Dhaka")
    ) {
      // console.log("setFilterDetail : call --- today");
      newData.push(crt);
    } else if (
      filter === "tomorrow" &&
      // startDate < new Date(crt.openDate) &&
      // endDate > new Date(crt.openDate)
      startDate < moment.tz(crt.openDate, "Asia/Dhaka") &&
      endDate > moment.tz(crt.openDate, "Asia/Dhaka")
    ) {
      // console.log("setFilterDetail : call --- tomorrow");
      newData.push(crt);
    }
  }
  // console.log("setFilterDetail :: return :: ");
  // console.log(newData);
  return res;
}
async function setFilterDetailsPearData(matchDetail, type, filter) {
  // console.log(`setFilterDetail :: type :: ${type} :: filter :: ${filter}`);
  // console.log("setFilterDetail :: matchDetail ::: ");
  // console.log(matchDetail);
  // const res = await setDetailNewForInPlayAndCount(matchDetail, type, filter);
  // console.log("setFilterDetail in_play :: res :::: ", new Date());
  // console.log(res);
  try {
    const yesterdayDate = getDate("yesterday");
    const todayDate = getDate("today");
    const tomorrowDate = getDate("tomorrow");

    const dayWiseData = {
      inplay: 0,
      today: 0,
      tomorrow: 0,
    };
    const matchArray = Array.isArray(matchDetail) ? matchDetail : matchDetail?.data || [];
    for await (const crt of matchArray) {
      // const matchDetail = await mongo.bettingApp
      //   .model(mongo.models.sports)
      //   .findOne({
      //     query:{
      //       type,
      //       gameId : crt.gameId,
      //       marketId: crt.marketId,
      //       winner: "",
      //       status: true,
      //       "activeStatus.status": true,
      //       startDate: { $gt: yesterdayDate.startDate },
      //     },
      //     select: {
      //       _id: 1
      //     },
      //   });
      // if(matchDetail){

      if (crt.inPlay) {
        // console.log("setFilterDetail : call --- play");
        // newData.push(crt);
        dayWiseData.inplay += 1;
      } else if (
        !crt.inPlay &&
        // todayDate.startDate < new Date(crt.openDate) &&
        // todayDate.endDate > new Date(crt.openDate)
        todayDate.startDate < moment.tz(crt.openDate, "Asia/Dhaka") &&
        todayDate.endDate > moment.tz(crt.openDate, "Asia/Dhaka")
      ) {
        // console.log("setFilterDetail : call --- today");
        // newData.push(crt);
        dayWiseData.today += 1;
      } else if (
        // tomorrowDate.startDate < new Date(crt.openDate) &&
        // tomorrowDate.endDate > new Date(crt.openDate)
        tomorrowDate.startDate < moment.tz(crt.openDate, "Asia/Dhaka") &&
        tomorrowDate.endDate > moment.tz(crt.openDate, "Asia/Dhaka")
      ) {
        // console.log("setFilterDetail : call --- tomorrow");
        // newData.push(crt);
        dayWiseData.tomorrow += 1;
      }
      // }
    }
    // console.log("setFilterDetail :: return :: ");
    // console.log(newData);
    return dayWiseData;
  } catch (error) {
    console.error("setFilterDetailsPearData: error: ", error);
  }
}
module.exports = {
  setDetail,
  setFilterDetail,
  setDetailNewForInPlayAndCount,
  setFilterDetailsPearData,
};
