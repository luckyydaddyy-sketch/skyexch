import { REHYDRATE } from "redux-persist";
import { getBetTable } from "../common/Funcation";
import Cookies from "universal-cookie";
const cookies = new Cookies();

let initState = {
  test: "",
  userData: {},
  isAuthenticated: false,
  Header: {},
  balance: "",
  webEdit: {},
  matchCount: {},
  getSport: {},
  sportDetails: {},
  betHistory: {},
  exposure: "",
  calcOntime: false,
  calcData: {},
  scoreCard: [],
  marketListDetails: {},
  cricket: {},
  soccer: {},
  tennis: {},
  betHistoryShow: false,
  homeData: {},
};

function skyReducer(state = initState, action) {
  switch (action.type) {
    case "AUTHENTICATION": {
      return { ...state, isAuthenticated: action.payload };
    }
    case "SHOW_BET_HISTORY": {
      return { ...state, betHistoryShow: !state.betHistoryShow };
    }
    case "USER_DATA": {
      return { ...state, userData: action.payload };
    }
    case "HEADER_DETAILS": {
      return {
        ...state,
        Header: action.payload,
        balance: action.payload.balance,
        exposure: action.payload.exposure,
      };
    }
    case "DOMAIN_DETAILS": {
      return { ...state, domainDetails: action.payload };
    }
    case "MARKET_LIST_DETAILS": {
      return { ...state, marketListDetails: action.payload };
    }
    case "EDIT_WEBSITE": {
      return { ...state, webEdit: action.payload };
    }
    case "UPDATE_USER_BALANCE": {
      return {
        ...state,
        balance: action.payload?.balance,
        exposure: action.payload?.exposure,
      };
    }
    case "SET_HOME_DATA": {
      return {
        ...state,
        homeData: action.payload,
      };
    }
    case "SET_IN_PLAY_DETAILS": {
      return {
        ...state,
        inPlayDetail: {
          inPlay: undefined,
          today: undefined,
          tomorrow: undefined,
        },
      };
    }
    case "SET_IN_PLAY_DETAILS_IN_PLAY": {
      return {
        ...state,
        inPlayDetail: { ...state.inPlayDetail, inPlay: action.payload },
      };
    }
    case "SET_IN_PLAY_DETAILS_TODAY": {
      return {
        ...state,
        inPlayDetail: { ...state.inPlayDetail, today: action.payload },
      };
    }
    case "SET_IN_PLAY_DETAILS_TOMORROW": {
      return {
        ...state,
        inPlayDetail: { ...state.inPlayDetail, tomorrow: action.payload },
      };
    }
    case "GET_SCORE_ID": {
      return {
        ...state,
        scoreCard: action.payload,
      };
    }
    case "GET_SPORTS_DETAILS": {
      let sportCopy = action.payload ? { ...action.payload } : {};
      state.sportDetails = action.payload;
      if (
        cookies.get("skyTokenFront") &&
        JSON.stringify(state?.betHistory) !== "{}" &&
        JSON.stringify(action.payload) !== "{}"
      ) {
        // console.log('GET_SPORTS_DETAILS', action.payload);
        console.log(
          ":::::::::::betsHistory",
          JSON.stringify(state?.betHistory) !== "{}"
        );

        // for odds
        let tableCopyActiveId = sportCopy.matchInfo?._id;
        let filteredHIstory = state?.betHistory?.filter(
          (_) => _.matchId._id === tableCopyActiveId
        );
        const OddsTable = state.calcOntime
          ? state.calcData
          : state?.betHistory?.find(
              (_) => _.betType === "odds" && _.matchId._id === tableCopyActiveId
            );
        const profitsOdds = state.calcOntime
          ? filterSportCount(
              filteredHIstory,
              "odds",
              state.calcOntime,
              state.calcData
            )
          : filterSportCount(filteredHIstory, "odds");
        let tableCopy = sportCopy.page?.data[getBetTable("odds")];
        if (OddsTable && OddsTable.winnerSelection) {
          tableCopy.forEach(
            (subElement) => (subElement.betProfit = profitsOdds[subElement.nat])
          );
        }
        sportCopy.page.data[getBetTable("odds")] = tableCopy;

        // for book maker

        let filteredBookHIstory = state?.betHistory?.filter(
          (_) => _.matchId._id === tableCopyActiveId
        );

        const BookMarkTable = state.calcOntime
          ? state.calcData
          : state?.betHistory?.find((_) => _.betType === "bookMark");
        const profitsBookMark = state.calcOntime
          ? filterSportCount(
              filteredBookHIstory,
              "bookMark",
              state.calcOntime,
              state.calcData
            )
          : filterSportCount(filteredBookHIstory, "bookMark");
        let tableCopyBookMark = sportCopy.page?.data[getBetTable("bookMark")];
        if (BookMarkTable) {
          tableCopyBookMark.forEach(
            (subElement) =>
              (subElement.betProfit = profitsBookMark[subElement.nat])
          );
        }

        sportCopy.page.data[getBetTable("bookMark")] = tableCopyBookMark;
        // FOR PRI

        let filteredpremiumHIstory = state?.betHistory?.filter(
          (_) => _.matchId._id === tableCopyActiveId
        );

        const PreTable = state.calcOntime
          ? state.calcData
          : state?.betHistory?.find((_) => _.betType === "premium");
        const profitsPreMark = state.calcOntime
          ? filterSportPreCount(
              filteredpremiumHIstory,
              "premium",
              state.calcOntime,
              state.calcData
            )
          : filterSportPreCount(filteredpremiumHIstory, "premium");
        let tableCopyPre = sportCopy.pre?.data?.t4;
        console.log("::::::::", tableCopyPre);
        console.log(":::::::: profitsPreMark : ", profitsPreMark);
        if (PreTable) {
          tableCopyPre.forEach((subElement) => {
            subElement?.sub_sb.forEach(
              (x) =>
                (x.betProfit = profitsPreMark[subElement?.marketName]
                  ? profitsPreMark[subElement?.marketName][x.nat]
                  : undefined)
            );
          });
        }
        sportCopy.page.data[getBetTable("premium")] = tableCopyPre;

        //for fancy
        // const fancyTable = state?.betHistory?.betsHistory.find(_ => _.betType === "bookMark")
        if (state?.betHistory) {
          // const profitsfancy = betsLastExposure(state?.betHistory)
          const profitsfancy = bookExposer(state?.betHistory);
          // console.log(':::::::::::::bookExposer up', profitsfancyexpo);
          let tableCopyfancy = sportCopy.page?.data[getBetTable("session")];
          if (profitsfancy.length) {
            tableCopyfancy.forEach((subElement) => {
              let findele = profitsfancy.findIndex(
                (_) => _.selection === subElement.nat
              );
              console.log(":::::::::findele");
              if (findele !== -1) {
                subElement.betProfit =
                  profitsfancy[findele].exposure.toFixed(2);
              }
            });
          }
          sportCopy.page.data[getBetTable("session")] = tableCopyfancy;
        }
      }

      return { ...state, sportDetails: sportCopy };
    }
    case "GET_LIVE_MATCH_COUNT": {
      return { ...state, matchCount: action.payload };
    }
    case "GET_SPORTS": {
      return {
        ...state,
        getSport: action.payload,
        [action.payload.type]: action.payload,
      };
    }
    case "GET_SPORTS_LIVE_CALC": {
      return { ...state, ...action.payload };
    }
    case "LIVE_TV": {
      return { ...state, myTv: action.payload };
    }
    case "USER_BET_HISTORY": {
      let sportCopy = state.sportDetails;
      // state.betHistory = action.payload
      console.log("GET_SPORTS_DETAILS", state.sportDetails);
      // console.log(':::::::betsHistory',filterSportCount(action.payload.betsHistory), action.payload.betsHistory )

      // const OddsTable = action?.payload?.betsHistory.find(_ => _.betType === "odds")
      // const profitsOdds = filterSportCount(action?.payload?.betsHistory, 'odds')
      // let tableCopy = sportCopy.page?.data[getBetTable('odds')]
      // if (OddsTable) {
      //     tableCopy.forEach(subElement => {
      //         if (subElement.nat === OddsTable.winnerSelection[0]) {
      //             subElement.betProfit = profitsOdds.left
      //         } else if (subElement.nat === OddsTable.winnerSelection[1]) {
      //             subElement.betProfit = profitsOdds.right
      //         } else if (subElement.nat === OddsTable.winnerSelection[2]) {
      //             subElement.betProfit = profitsOdds.draw
      //         }
      //     });
      // }
      // sportCopy.page.data[getBetTable('odds')] = tableCopy

      // // for book maker
      // const BookMarkTable = action?.payload?.betsHistory.find(_ => _.betType === "bookMark")
      // const profitsBookMark = filterSportCount(action?.payload?.betsHistory, 'bookMark')
      // let tableCopyBookMark = sportCopy.page?.data[getBetTable('bookMark')]
      // if (BookMarkTable) {
      //     tableCopyBookMark.forEach(subElement => {
      //         if (subElement.nat === BookMarkTable.winnerSelection[0]) {
      //             subElement.betProfit = profitsBookMark.left
      //         } else if (subElement.nat === BookMarkTable.winnerSelection[1]) {
      //             subElement.betProfit = profitsBookMark.right
      //         } else if (subElement.nat === BookMarkTable.winnerSelection[2]) {
      //             subElement.betProfit = profitsBookMark.draw
      //         }
      //     });
      // }

      // sportCopy.page.data[getBetTable('bookMark')] = tableCopyBookMark

      // //for fancy
      // // const fancyTable = state?.betHistory?.betsHistory.find(_ => _.betType === "bookMark")
      // const profitsfancy = betsLastExposure(action?.payload?.betsHistory)
      // let tableCopyfancy = sportCopy.page?.data[getBetTable('session')]
      // if (profitsfancy.length) {
      //     tableCopyfancy.forEach(subElement => {
      //         let findele = profitsfancy.findIndex(_ => _.selection === subElement.nat)
      //         console.log(':::::::::findele');
      //         if (findele !== -1) {
      //             subElement.betProfit = profitsfancy[findele].exposure
      //         }
      //     });
      // }

      // sportCopy.page.data[getBetTable('session')] = tableCopyfancy

      // state.sportDetails = sportCopy

      return { ...state, betHistory: action.payload };
    }
    case "MAIN_LOADER": {
      return { ...state, loader: action.payload };
    }
    case "LOGOUT":
      return {
        getSport: {},
        sportDetails: {},
        betHistory: {},
      };
    case REHYDRATE:
      return {
        // ...state,
        // User: action?.payload?.User ? action?.payload?.User : '',
        // getSport: {},
        betHistoryShow: false,
        balance: "",
        scoreCard: [],
        calcOntime: false,
        calcData: {},
        getSport: {},
        cricket: {},
        soccer: {},
        tennis: {},
        sportDetails: {},
        betHistory: {},
      };
    default:
      return { ...state };
  }
}

export const reducer = skyReducer;

export function filterSportCount(betsHistory, betType, calcOntime, calcData) {
  let left = 0;
  let right = 0;
  let draw = 0;
  let oldExp = {};

  if (betsHistory) {
    // for await (const bet of betList)
    betsHistory.forEach((bet) => {
      if (bet.betType === betType) {
        const { winnerSelection } = bet;
        console.log(winnerSelection);
        let profileForBet = 0;
        let exposureForBet = 0;
        if (bet.betSide === "back") {
          profileForBet = bet.profit;
          exposureForBet = bet.exposure;
        } else {
          profileForBet = bet.profit;
          exposureForBet = bet.betPlaced;
        }

        console.log("profileForBet :: ", profileForBet);
        console.log("exposureForBet :: ", exposureForBet);
        winnerSelection.forEach((element) => {
          console.log(element, bet, "beeetttt");
          if (element === bet.selection) {
            if (bet.betSide === "back") {
              if (!oldExp[element]) {
                oldExp[element] = profileForBet;
              } else {
                oldExp[element] += profileForBet;
              }
            } else {
              if (!oldExp[element]) {
                oldExp[element] = -profileForBet;
              } else {
                oldExp[element] -= profileForBet;
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
                oldExp[element] = exposureForBet;
              } else {
                oldExp[element] += exposureForBet;
              }
            }
          }
        });
      }
    });
  }
  if (calcOntime && calcData && calcData.betType === betType) {
    const { winnerSelection } = calcData;
    console.log(winnerSelection);
    let profileForBet = 0;
    let exposureForBet = 0;
    if (calcData.betSide === "back") {
      profileForBet = calcData.profit;
      exposureForBet = calcData.exposure;
    } else {
      profileForBet = calcData.profit;
      exposureForBet = calcData.betPlaced;
    }

    console.log("profileForBet :: ", profileForBet);
    console.log("exposureForBet :: ", exposureForBet);
    winnerSelection.forEach((element) => {
      if (element === calcData.selection) {
        if (calcData.betSide === "back") {
          if (!oldExp[element]) {
            oldExp[element] = profileForBet;
          } else {
            oldExp[element] += profileForBet;
          }
        } else {
          if (!oldExp[element]) {
            oldExp[element] = -profileForBet;
          } else {
            oldExp[element] -= profileForBet;
          }
        }
      } else {
        if (calcData.betSide === "back") {
          if (!oldExp[element]) {
            oldExp[element] = -exposureForBet;
          } else {
            oldExp[element] -= exposureForBet;
          }
        } else {
          if (!oldExp[element]) {
            oldExp[element] = exposureForBet;
          } else {
            oldExp[element] += exposureForBet;
          }
        }
      }
    });
  }

  // return { left, right, draw };
  return oldExp;
}

export function filterSportPreCount(
  betsHistory,
  betType,
  calcOntime,
  calcData
) {
  let left = 0;
  let right = 0;
  let draw = 0;
  let oldExp = {};

  if (betsHistory) {
    // for await (const bet of betList)
    betsHistory.forEach((bet) => {
      if (bet.betType === betType) {
        oldExp[bet.selection] = {};
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
          if (element === bet.subSelection) {
            if (!oldExp[bet.selection][element]) {
              oldExp[bet.selection][element] = profileForBet;
            } else {
              oldExp[bet.selection][element] += profileForBet;
            }
          } else {
            if (!oldExp[bet.selection][element]) {
              oldExp[bet.selection][element] = -exposureForBet;
            } else {
              oldExp[bet.selection][element] -= exposureForBet;
            }
          }
        });
      }
    });
  }
  if (calcOntime && calcData && calcData.betType === betType) {
    const { winnerSelection } = calcData;
    console.log(winnerSelection);
    oldExp[calcData.selection] = {};
    let profileForBet = 0;
    let exposureForBet = 0;
    if (calcData.betSide === "back") {
      profileForBet = calcData.profit;
      exposureForBet = calcData.exposure;
    } else {
      profileForBet = calcData.betPlaced;
      exposureForBet = calcData.profit;
    }

    console.log("profileForBet :: ", profileForBet);
    console.log("exposureForBet :: ", exposureForBet);
    winnerSelection.forEach((element) => {
      if (element === calcData.subSelection) {
        if (!oldExp[calcData.selection][element]) {
          oldExp[calcData.selection][element] = profileForBet;
        } else {
          oldExp[calcData.selection][element] += profileForBet;
        }
      } else {
        if (!oldExp[calcData.selection][element]) {
          oldExp[calcData.selection][element] = -exposureForBet;
        } else {
          oldExp[calcData.selection][element] -= exposureForBet;
        }
      }
    });
  }

  // return { left, right, draw };
  return oldExp;
}

const bookExposer = (betList) => {
  let arr = [];
  let oddsValues = [];
  for (const bet of betList) {
    let numberArray = {};
    if (bet.betType === "session") {
      if (oddsValues.length === 0) {
        betList.forEach((values) => {
          if (values.betSide === "yes") {
            if (!oddsValues.includes(values.fancyYes)) {
              oddsValues.push(values.fancyYes);
            }
            if (!oddsValues.includes(values.fancyYes + 1)) {
              oddsValues.push(values.fancyYes + 1);
            }
            if (!oddsValues.includes(values.fancyYes - 1)) {
              oddsValues.push(values.fancyYes - 1);
            }
          } else {
            if (!oddsValues.includes(values.fancyNo)) {
              oddsValues.push(values.fancyNo);
            }
            if (!oddsValues.includes(values.fancyNo + 1)) {
              oddsValues.push(values.fancyNo + 1);
            }
            if (!oddsValues.includes(values.fancyNo - 1)) {
              oddsValues.push(values.fancyNo - 1);
            }
          }
        });
      }
      const no = bet.fancyNo ? bet.fancyNo : 1;
      const yes = bet.fancyYes ? bet.fancyYes : 1;
      const selection = bet.selection;
      console.log("no value : ", no);
      console.log("yes value : ", yes);
      const maxVal = Math.max(...oddsValues);
      //   for (let i = no - 1; i <= yes + 1; i++) {
      for (let i = 0; i <= maxVal + 1000; i++) {
        if (bet.betSide === "yes") {
          if (yes <= i) {
            if (!numberArray[i]) {
              numberArray[i] = bet.profit;
            } else {
              numberArray[i] += bet.profit;
            }
          } else {
            if (!numberArray[i]) {
              numberArray[i] = -bet.exposure;
            } else {
              numberArray[i] -= bet.exposure;
            }
          }
        } else if (bet.betSide === "no") {
          if (no > i) {
            if (!numberArray[i]) {
              numberArray[i] = bet.betPlaced;
            } else {
              numberArray[i] += bet.betPlaced;
            }
          } else {
            if (!numberArray[i]) {
              numberArray[i] = -bet.profit;
            } else {
              numberArray[i] -= bet.profit;
            }
          }
        }
      }
      console.log(":::::::::book number", numberArray);
      const dublicat = arr.findIndex((ele) => ele.selection === selection);
      if (dublicat === -1) {
        arr.push({
          selection,
          numberArray,
        });
      } else {
        // const f = arr[dublicat].numberArray;

        // arr[dublicat].numberArray = Object.keys(
        //   arr[dublicat].numberArray
        // ).reduce((acc, key) => {
        //   const val1 = arr[dublicat].numberArray[key];
        //   const val2 = numberArray[key] || 0;
        //   acc[key] = val1 + val2;
        //   return acc;
        // }, {});
        arr = arr.map((obj, index) => {
          console.log("obj.selection :: ", obj.selection);
          console.log("selection :: ", selection);
          console.log(
            "(obj.selection === selection)",
            obj.selection === selection
          );
          if (obj.selection === selection) {
            const newObj = {
              ...obj,
              numberArray: Object.keys(obj.numberArray).reduce((acc, key) => {
                const val1 = obj.numberArray[key];
                const val2 = numberArray[key] || 0;
                acc[key] = val1 + val2;
                return acc;
              }, {}),
            };
            return newObj;
          }
          return obj;
        });
        console.log(":::::::::::::bookExposer result", arr);
      }
    }
  }
  arr = arr.map((item) => {
    return {
      ...item,
      exposure: getexpo(item?.numberArray),
    };
  });
  return arr;
};

const getexpo = (numberArray) => {
  let exposure = 0;
  const newExpByNew = Object.keys(numberArray)
    .map((key) => numberArray[key])
    .sort((a, b) => a - b);
  console.log("newExpByNew :: ", newExpByNew);
  if (newExpByNew && newExpByNew.length) {
    exposure = newExpByNew[0];
  }
  return exposure;
};

export const bookExposerGetPopup = (betList) => {
  let numberArray = {};
  let selection = "";
  for (const bet of betList) {
    if (bet.betType === "session") {
      const no = bet.fancyNo ? bet.fancyNo : 1;
      const yes = bet.fancyYes ? bet.fancyYes : 1;
      selection = bet.selection;
      console.log("no value : ", no);
      console.log("yes value : ", yes);
      for (let i = no - 1; i <= yes + 1; i++) {
        if (bet.betSide === "yes") {
          if (yes <= i) {
            if (!numberArray[i]) {
              numberArray[i] = bet.profit;
            } else {
              numberArray[i] += bet.profit;
            }
          } else {
            if (!numberArray[i]) {
              numberArray[i] = -bet.exposure;
            } else {
              numberArray[i] -= bet.exposure;
            }
          }
        } else if (bet.betSide === "no") {
          if (no > i) {
            if (!numberArray[i]) {
              numberArray[i] = bet.betPlaced;
            } else {
              numberArray[i] += bet.betPlaced;
            }
          } else {
            if (!numberArray[i]) {
              numberArray[i] = -bet.profit;
            } else {
              numberArray[i] -= bet.profit;
            }
          }
        }
      }
    }
  }
  return numberArray;
};
