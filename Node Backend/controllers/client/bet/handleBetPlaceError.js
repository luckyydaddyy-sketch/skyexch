const httpStatus = require("http-status");
const CUSTOM_MESSAGE = require("../../../utils/message");
const ApiError = require("../../../utils/ApiError");
const { replaceString } = require("../../../utils/comman/replaceString");
const redis = require("../../../config/redis");
const config = require("../../../config/config");
const { getpages, getPremium, getBookPages, getOddsPages, getFancyPages, getOddsPagesWinner, getBookPagesWinner, getFancyPagesWinner, getPremiumWinner } = require("../../../config/sportsAPI");

async function handleBetPlaceErrorOnOddsValue(sportInfo, betDetail) {
  const { API_CALL_KEY, DETAIL_PAGE_KEY, DETAIL_PRE_KEY, DETAIL_BOOK_KEY, DETAIL_FANCY_KEY } = config;
  // position = 'b1', 'b2', 'b3', 'l1', 'l2', 'l3
  const { betType, sId, pId, position, betSide, oddsUp, fancyYes, fancyNo } =
    betDetail;
  let newOddsUpValue = oddsUp;
  const { gameId, marketId } = sportInfo;
  let flag = false;
  if (["odds", "bookMark", "session"].includes(betType)) {
    console.log(" in if fist-*");
    // const page = {
    //   data: {
    //     t1: [
    //       {
    //         b1: 2.12,
    //         b2: 2.1,
    //         b3: 2.04,
    //         bs1: 1527.27,
    //         bs2: 17655.68,
    //         bs3: 16159.09,
    //         gType: "Match Odds",
    //         inPlay: false,
    //         l1: 2.18,
    //         l2: 2.22,
    //         l3: 2.24,
    //         ls1: 88211.36,
    //         ls2: 9614.77,
    //         ls3: 11028.41,
    //         marketId: "1.210323026",
    //         nat: "Chennai Super Kings",
    //         openDate: "2023-03-31 19:30",
    //         sId: 2954263,
    //         sortPriority: 2,
    //         status: "ACTIVE",
    //       },
    //       {
    //         b1: 1.86,
    //         b2: 1.85,
    //         b3: 1.83,
    //         bs1: 4838.64,
    //         bs2: 99081.82,
    //         bs3: 8267.05,
    //         gType: "Match Odds",
    //         inPlay: false,
    //         l1: 1.89,
    //         l2: 1.9,
    //         l3: 1.91,
    //         ls1: 1136.36,
    //         ls2: 2709.09,
    //         ls3: 17287.5,
    //         marketId: "1.210323026",
    //         nat: "Gujarat Titans",
    //         openDate: "2023-03-31 19:30",
    //         sId: 42821394,
    //         sortPriority: 1,
    //         status: "ACTIVE",
    //       },
    //     ],
    //   },
    // };
    // const page = await getpages(gameId, marketId);
    // if (page.data) {
      console.log(" in if fist-second*");
      if (betType === "odds") {
        // const page = await redis.getValueFromKey(
        //   `${DETAIL_PAGE_KEY}:${gameId}:${marketId}`
        // );
        const page = await getOddsPagesWinner(gameId, marketId);
        console.log(" in if fist-second-therd*");
        if (page && page?.data && page?.data?.t1 && page?.data?.t1?.length > 0) {
          page.data.t1.forEach((ele) => {
            if (ele.sId === sId) {
              console.log("id match :: sId");
              const oddsValue = ele[position];
              if (!["ACTIVE", "OPEN"].includes(ele.status)) {
                throw new ApiError(
                  httpStatus.BAD_REQUEST,
                  CUSTOM_MESSAGE.UN_MATCH_BET_TOTAL_NOT_ALLOWED
                );
              } else if (betSide === "lay") {
                if (oddsUp >= oddsValue) {
                  newOddsUpValue = oddsValue;
                  console.log(" got the value is correct");
                  flag = true;
                } else {
                  throw new ApiError(
                    httpStatus.BAD_REQUEST,
                    CUSTOM_MESSAGE.UN_MATCH_BET_TOTAL_NOT_ALLOWED
                  );
                }
              } else {
                if (oddsUp <= oddsValue) {
                  newOddsUpValue = oddsValue;
                  console.log(" got the value is correct");
                  flag = true;
                } else {
                  throw new ApiError(
                    httpStatus.BAD_REQUEST,
                    CUSTOM_MESSAGE.UN_MATCH_BET_TOTAL_NOT_ALLOWED
                  );
                }
              }
            }
          });
        }
      } else if (betType === "bookMark") {
        // const page = await redis.getValueFromKey(
        //   `${DETAIL_BOOK_KEY}:${gameId}:${marketId}`
        // );
        const page = await getBookPagesWinner(gameId, marketId);
        if (page && page?.data && page?.data?.t2 && page?.data?.t2?.length > 0) {
          page.data.t2.forEach((ele) => {
            if (ele.sId === sId) {
              const oddsValue = ele[position];
              if (!["ACTIVE", "OPEN"].includes(ele.status)) {
                throw new ApiError(
                  httpStatus.BAD_REQUEST,
                  CUSTOM_MESSAGE.UN_MATCH_BET_TOTAL_NOT_ALLOWED
                );
              } else {
                if (oddsUp === oddsValue) {
                  flag = true;
                } else {
                  throw new ApiError(
                    httpStatus.BAD_REQUEST,
                    CUSTOM_MESSAGE.UN_MATCH_BET_TOTAL_NOT_ALLOWED
                  );
                }
              }
            }
          });
        }
      } else if (betType === "session") {
        // const page = await redis.getValueFromKey(
        //   `${DETAIL_FANCY_KEY}:${gameId}:${marketId}`
        // );
        const page = await getFancyPagesWinner(gameId, marketId);
        if (page && page?.data && page?.data?.t3 && page?.data?.t3?.length > 0) {
          page.data.t3.forEach((ele) => {
            if (ele.sId === sId) {
              const oddsValue = ele[position];
              if (!["ACTIVE", "OPEN"].includes(ele.status)) {
                throw new ApiError(
                  httpStatus.BAD_REQUEST,
                  CUSTOM_MESSAGE.UN_MATCH_BET_TOTAL_NOT_ALLOWED
                );
              } else {
                if (oddsUp === oddsValue) {
                  flag = true;
                } else {
                  throw new ApiError(
                    httpStatus.BAD_REQUEST,
                    CUSTOM_MESSAGE.UN_MATCH_BET_TOTAL_NOT_ALLOWED
                  );
                }
              }
            }
          });
        }
      }
    // }
  } else if (betType === "premium") {
    // const page = {
    //   data: {
    //     t4: [
    //       {
    //         gType: "Premium Bet",
    //         id: "305744697",
    //         marketId: "1.210323026",
    //         marketName: "1st innings over 2 - Gujarat Titans total",
    //         sortPriority: 305744697,
    //         status: "ACTIVE",
    //         sub_sb: [
    //           {
    //             nat: "under 5.5",
    //             odds: 2.558,
    //             sId: 1919617962,
    //             sortPriority: 1919617962,
    //           },
    //           {
    //             nat: "over 5.5",
    //             odds: 1.45,
    //             sId: 1919617961,
    //             sortPriority: 1919617961,
    //           },
    //         ],
    //       },
    //       {
    //         gType: "Premium Bet",
    //         id: "305744696",
    //         marketId: "1.210323026",
    //         marketName: "1st innings over 1 - Gujarat Titans total",
    //         sortPriority: 305744696,
    //         status: "ACTIVE",
    //         sub_sb: [
    //           {
    //             nat: "under 5.5",
    //             odds: 2.02,
    //             sId: 1919617960,
    //             sortPriority: 1919617960,
    //           },
    //           {
    //             nat: "over 5.5",
    //             odds: 1.68,
    //             sId: 1919617959,
    //             sortPriority: 1919617959,
    //           },
    //         ],
    //       },
    //       {
    //         gType: "Premium Bet",
    //         id: "305744699",
    //         marketId: "1.210323026",
    //         marketName: "1st innings over 3 - Gujarat Titans total",
    //         sortPriority: 305744699,
    //         status: "ACTIVE",
    //         sub_sb: [
    //           {
    //             nat: "under 6.5",
    //             odds: 2.26,
    //             sId: 1919617966,
    //             sortPriority: 1919617966,
    //           },
    //           {
    //             nat: "over 6.5",
    //             odds: 1.55,
    //             sId: 1919617965,
    //             sortPriority: 1919617965,
    //           },
    //         ],
    //       },
    //     ],
    //   },
    // };
    // const page = await redis.getValueFromKey(
    //   `${DETAIL_PRE_KEY}:${gameId}:${marketId}`
    // );
    const page = await getPremiumWinner(gameId, marketId);
    if (page && page?.data && page?.data?.t4 && page?.data?.t4.length > 0) {
      console.log("get in if pre ::");
      page.data.t4.forEach((prem) => {
        console.log(" prem.id ::  ", prem.id);
        console.log(" prem.id :: pId : ", pId);
        console.log(" prem.id :: sId : ", sId);
        console.log(" prem.id :: prem.id === pId ::  ", prem.id === sId);
        console.log(
          " prem.id :: prem.id === pId.toString() ::  ",
          prem.id === sId.toString()
        );
        if (prem.id === sId.toString()) {
          console.log("get in if pre :: match ");
          console.log("get in if pre :: prem.status ::  ", prem.status);
          if (!["ACTIVE", "OPEN"].includes(prem.status)) {
            console.log("get in if pre :: match filed :: ");
            throw new ApiError(
              httpStatus.BAD_REQUEST,
              CUSTOM_MESSAGE.UN_MATCH_BET_TOTAL_NOT_ALLOWED
            );
          }
          prem.sub_sb.forEach((ele) => {
            console.log("get in if pre :: match filed :: call sub :: ");
            if (ele.sId === pId) {
              console.log(
                "get in if pre :: match filed :: call sub :: match sub"
              );
              const oddsValue = ele.odds;
              if (oddsUp === oddsValue) {
                console.log(
                  "get in if pre :: match filed :: call sub :: match sub :: return trur"
                );
                flag = true;
              } else {
                throw new ApiError(
                  httpStatus.BAD_REQUEST,
                  CUSTOM_MESSAGE.UN_MATCH_BET_TOTAL_NOT_ALLOWED
                );
              }
            }
          });
        }
      });
    }
  }

  if (!flag)
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      CUSTOM_MESSAGE.UN_MATCH_BET_TOTAL_NOT_ALLOWED
    );

  return newOddsUpValue;
}

async function handleBetPlaceError(sportInfo, betInfo) {
  const { betType, betPlaced, oddsUp } = betInfo;

  if (oddsUp === 0) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      CUSTOM_MESSAGE.INVALID_BET_AMOUNT
    );
  }

  if (!sportInfo.activeStatus.status)
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      CUSTOM_MESSAGE.UN_MATCH_BET_TOTAL_NOT_ALLOWED
    );

  if (betType === "odds") {
    if (sportInfo.suspend.odds)
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        CUSTOM_MESSAGE.UN_MATCH_BET_TOTAL_NOT_ALLOWED
      );

    if (betPlaced < sportInfo.bet_odds_limit.min)
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        replaceString(
          CUSTOM_MESSAGE.MINIMUM_BET_LIMIT,
          "[amount]",
          sportInfo.bet_odds_limit.min
        )
      );
    if (betPlaced > sportInfo.bet_odds_limit.max)
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        replaceString(
          CUSTOM_MESSAGE.MAXIMUM_BET_LIMIT,
          "[amount]",
          sportInfo.bet_odds_limit.max
        )
      );

    console.log("oddsUp :: ", oddsUp);
    console.log("oddsUp :oddsLimit.max: ", sportInfo.oddsLimit.max);
    console.log("oddsUp :sportInfo.oddsLimit.min: ", sportInfo.oddsLimit.min);
    if (oddsUp > sportInfo.oddsLimit.max || oddsUp < sportInfo.oddsLimit.min)
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        CUSTOM_MESSAGE.ODDS_LIMIT_EXCEED
      );
  }
  if (betType === "bookMark") {
    if (!sportInfo.activeStatus.bookmaker)
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        CUSTOM_MESSAGE.BOOKMAKER_IS_DISABLED_BY_ADMIN
      );
    if (sportInfo.suspend.bookmaker)
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        CUSTOM_MESSAGE.UN_MATCH_BET_TOTAL_NOT_ALLOWED
      );

    if (betPlaced < sportInfo.bet_bookmaker_limit.min)
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        replaceString(
          CUSTOM_MESSAGE.MINIMUM_BET_LIMIT,
          "[amount]",
          sportInfo.bet_bookmaker_limit.min
        )
      );
    if (betPlaced > sportInfo.bet_bookmaker_limit.max)
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        replaceString(
          CUSTOM_MESSAGE.MAXIMUM_BET_LIMIT,
          "[amount]",
          sportInfo.bet_bookmaker_limit.max
        )
      );
  }
  if (betType === "session") {
    if (!sportInfo.activeStatus.fancy)
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        CUSTOM_MESSAGE.SESSION_IS_DISABLED_BY_ADMIN
      );
    if (sportInfo.suspend.fancy)
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        CUSTOM_MESSAGE.UN_MATCH_BET_TOTAL_NOT_ALLOWED
      );

    if (betPlaced < sportInfo.bet_fancy_limit.min)
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        replaceString(
          CUSTOM_MESSAGE.MINIMUM_BET_LIMIT,
          "[amount]",
          sportInfo.bet_fancy_limit.min
        )
      );
    if (betPlaced > sportInfo.bet_fancy_limit.max)
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        replaceString(
          CUSTOM_MESSAGE.MAXIMUM_BET_LIMIT,
          "[amount]",
          sportInfo.bet_fancy_limit.max
        )
      );
  }
  if (betType === "premium") {
    if (!sportInfo.activeStatus.premium)
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        CUSTOM_MESSAGE.PREMIUM_IS_DISABLED_BY_ADMIN
      );
    if (sportInfo.suspend.premium)
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        CUSTOM_MESSAGE.UN_MATCH_BET_TOTAL_NOT_ALLOWED
      );

    if (betPlaced < sportInfo.bet_premium_limit.min)
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        replaceString(
          CUSTOM_MESSAGE.MINIMUM_BET_LIMIT,
          "[amount]",
          sportInfo.bet_premium_limit.min
        )
      );
    if (betPlaced > sportInfo.bet_premium_limit.max)
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        replaceString(
          CUSTOM_MESSAGE.MAXIMUM_BET_LIMIT,
          "[amount]",
          sportInfo.bet_premium_limit.max
        )
      );
  }

  return true;
}

async function checkOddsIsMatchOrNot(sportInfo, betDetail) {
  const { betType, sId, position, betSide, oddsUp, } =
    betDetail;
  let newOddsUpValue = oddsUp;
  const { gameId, marketId } = sportInfo;
  const { DETAIL_PAGE_KEY } = config;

  if (["odds"].includes(betType)) {
    console.log("checkOddsIsMatchOrNot: in if fist-*");

    // const page = await getpages(gameId, marketId);
    const page = await getOddsPagesWinner(gameId, marketId);
    // const page = await redis.getValueFromKey(
    //   `${DETAIL_PAGE_KEY}:${gameId}:${marketId}`
    // );
    if (page && page?.data) {
      console.log("checkOddsIsMatchOrNot: in if fist-second-therd*");
      if (page?.data?.t1 && page?.data?.t1.length > 0) {
        page?.data?.t1.forEach((ele) => {
          if (ele.sId === sId) {
            console.log("checkOddsIsMatchOrNot: id match :: sId");
            const oddsValue = ele[position];
           
            if (betSide === "lay") {
              if (oddsUp >= oddsValue) {
                newOddsUpValue = oddsValue;
                console.log("checkOddsIsMatchOrNot: got the value is correct");
              }
            } else {
              if (oddsUp <= oddsValue) {
                newOddsUpValue = oddsValue;
                console.log("checkOddsIsMatchOrNot: got the value is correct");
              }
            }
          }
        });
      }
    }
  }

  return newOddsUpValue;
}
module.exports = { handleBetPlaceError, handleBetPlaceErrorOnOddsValue, checkOddsIsMatchOrNot };

// if (betType === "odds") {
//   if (sportInfo.suspend.odds)
//     throw new ApiError(
//       httpStatus.BAD_REQUEST,
//       CUSTOM_MESSAGE.UN_MATCH_BET_TOTAL_NOT_ALLOWED
//     );

//   if (betPlaced < sportInfo.bet_odds_limit.min)
//     throw new ApiError(
//       httpStatus.BAD_REQUEST,
//       replaceString(
//         CUSTOM_MESSAGE.MINIMUM_BET_LIMIT,
//         "[amount]",
//         sportInfo.bet_odds_limit.min
//       )
//     );
//   if (betPlaced > sportInfo.bet_odds_limit.max)
//     throw new ApiError(
//       httpStatus.BAD_REQUEST,
//       replaceString(
//         CUSTOM_MESSAGE.MINIMUM_BET_LIMIT,
//         "[amount]",
//         sportInfo.bet_odds_limit.max
//       )
//     );

//   console.log("oddsUp :: ", oddsUp);
//   console.log("oddsUp :oddsLimit.max: ", sportInfo.oddsLimit.max);
//   console.log("oddsUp :sportInfo.oddsLimit.min: ", sportInfo.oddsLimit.min);
//   if (oddsUp > sportInfo.oddsLimit.max || oddsUp < sportInfo.oddsLimit.min)
//     throw new ApiError(
//       httpStatus.BAD_REQUEST,
//       CUSTOM_MESSAGE.ODDS_LIMIT_EXCEED
//     );
// }
// if (betType === "bookMark") {
//   if (sportInfo.activeStatus.bookmaker)
//     throw new ApiError(
//       httpStatus.BAD_REQUEST,
//       CUSTOM_MESSAGE.BOOKMAKER_IS_DISABLED_BY_ADMIN
//     );
//   if (sportInfo.suspend.bookmaker)
//     throw new ApiError(
//       httpStatus.BAD_REQUEST,
//       CUSTOM_MESSAGE.UN_MATCH_BET_TOTAL_NOT_ALLOWED
//     );

//   if (betPlaced < sportInfo.bet_bookmaker_limit.min)
//     throw new ApiError(
//       httpStatus.BAD_REQUEST,
//       replaceString(
//         CUSTOM_MESSAGE.MINIMUM_BET_LIMIT,
//         "[amount]",
//         sportInfo.bet_bookmaker_limit.min
//       )
//     );
//   if (betPlaced > sportInfo.bet_bookmaker_limit.max)
//     throw new ApiError(
//       httpStatus.BAD_REQUEST,
//       replaceString(
//         CUSTOM_MESSAGE.MINIMUM_BET_LIMIT,
//         "[amount]",
//         sportInfo.bet_bookmaker_limit.max
//       )
//     );
// }
// if (betType === "session") {
//   if (sportInfo.activeStatus.fancy)
//     throw new ApiError(
//       httpStatus.BAD_REQUEST,
//       CUSTOM_MESSAGE.SESSION_IS_DISABLED_BY_ADMIN
//     );
//   if (sportInfo.suspend.fancy)
//     throw new ApiError(
//       httpStatus.BAD_REQUEST,
//       CUSTOM_MESSAGE.UN_MATCH_BET_TOTAL_NOT_ALLOWED
//     );

//   if (betPlaced < sportInfo.bet_fancy_limit.min)
//     throw new ApiError(
//       httpStatus.BAD_REQUEST,
//       replaceString(
//         CUSTOM_MESSAGE.MINIMUM_BET_LIMIT,
//         "[amount]",
//         sportInfo.bet_fancy_limit.min
//       )
//     );
//   if (betPlaced > sportInfo.bet_fancy_limit.max)
//     throw new ApiError(
//       httpStatus.BAD_REQUEST,
//       replaceString(
//         CUSTOM_MESSAGE.MINIMUM_BET_LIMIT,
//         "[amount]",
//         sportInfo.bet_fancy_limit.max
//       )
//     );
// }
// if (betType === "premium") {
//   if (sportInfo.activeStatus.premium)
//     throw new ApiError(
//       httpStatus.BAD_REQUEST,
//       CUSTOM_MESSAGE.PREMIUM_IS_DISABLED_BY_ADMIN
//     );
//   if (sportInfo.suspend.premium)
//     throw new ApiError(
//       httpStatus.BAD_REQUEST,
//       CUSTOM_MESSAGE.UN_MATCH_BET_TOTAL_NOT_ALLOWED
//     );

//   if (betPlaced < sportInfo.bet_premium_limit.min)
//     throw new ApiError(
//       httpStatus.BAD_REQUEST,
//       replaceString(
//         CUSTOM_MESSAGE.MINIMUM_BET_LIMIT,
//         "[amount]",
//         sportInfo.bet_premium_limit.min
//       )
//     );
//   if (betPlaced > sportInfo.bet_premium_limit.max)
//     throw new ApiError(
//       httpStatus.BAD_REQUEST,
//       replaceString(
//         CUSTOM_MESSAGE.MINIMUM_BET_LIMIT,
//         "[amount]",
//         sportInfo.bet_premium_limit.max
//       )
//     );
// }
