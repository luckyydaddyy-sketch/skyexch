import { REHYDRATE } from 'redux-persist';
import { getBetTable } from '../common/Funcation';

let initState = {
    test: '',
    userData: {},
    isAuthenticated: false,
    Header: {},
    balance: {},
    webEdit: {},
    domainDetails: {},
    home_userCount: {},
    sportDetails: {},
    clickedGame: {},
    betHistory: {},
};

function skyReducer(state = initState, action) {
    switch (action.type) {
        case 'AUTHENTICATION': {
            return { ...state, isAuthenticated: action.payload }
        }
        case 'USER_DATA': {
            return { ...state, userData: action.payload }
        }
        case 'HEADER_DETAILS': {
            return { ...state, Header: action.payload, balance: action.payload.remaining_balance }
        }
        case 'PAYMENT_COUNT': {
            return { ...state, PaymentCount: action.payload }
        }
        case 'DOMAIN_DETAILS': {
            return { ...state, domainDetails: action.payload }
        }
        case 'EDIT_WEBSITE': {
            return { ...state, webEdit: action.payload }
        }
        case 'UPDATE_BALANCE': {
            return { ...state, balance: action.payload }
        }
        case 'GET_USER_COUNT': {
            return { ...state, home_userCount: action.payload }
        }
        case 'GET_SPORTS_DETAILS': {


            let sportCopy = action.payload
            // console.log('GET_SPORTS_DETAILS', action.payload);
            // console.log(':::::::::::betsHistory', OddsTable, OddsTable.winnerSelection)

            // for odds
            const OddsTable = state?.betHistory?.betsHistory.find(_ => _.betType === "odds")
            const profitsOdds = filterSportCount(state?.betHistory?.betsHistory, 'odds')
            console.log('pro::::::::::', profitsOdds);

            let tableCopy = sportCopy.page?.data[getBetTable('odds')]
            if (OddsTable) {
                tableCopy.forEach(subElement =>
                    //     {
                    //     if (subElement.nat === OddsTable.winnerSelection[0]) {
                    //         subElement.betProfit = profitsOdds.left.toFixed(2)
                    //     } else if (subElement.nat === OddsTable.winnerSelection[1]) {
                    //         subElement.betProfit = profitsOdds.right.toFixed(2)
                    //     } else if (subElement.nat === OddsTable.winnerSelection[2]) {
                    //         subElement.betProfit = profitsOdds.draw.toFixed(2)
                    //     }
                    // }
                    subElement.betProfit = profitsOdds[subElement.nat]
                );
            }
            sportCopy.page.data[getBetTable('odds')] = tableCopy


            // for book maker
            const BookMarkTable = state?.betHistory?.betsHistory.find(_ => _.betType === "bookMark")
            const profitsBookMark = filterSportCount(state?.betHistory?.betsHistory, 'bookMark')
            let tableCopyBookMark = sportCopy.page?.data[getBetTable('bookMark')]
            if (BookMarkTable) {
                tableCopyBookMark.forEach(subElement =>
                    //     {
                    //     if (subElement.nat === BookMarkTable.winnerSelection[0]) {
                    //         subElement.betProfit = profitsBookMark.left.toFixed(2)
                    //     } else if (subElement.nat === BookMarkTable.winnerSelection[1]) {
                    //         subElement.betProfit = profitsBookMark.right.toFixed(2)
                    //     } else if (subElement.nat === BookMarkTable.winnerSelection[2]) {
                    //         subElement.betProfit = profitsBookMark.draw.toFixed(2)
                    //     }
                    // }
                    subElement.betProfit = profitsBookMark[subElement.nat]

                );
            }

            sportCopy.page.data[getBetTable('bookMark')] = tableCopyBookMark

            // for pre


            const PreTable = state?.betHistory?.betsHistory?.find(_ => _.betType === "premium")
            const profitsPreMark = filterSportPreCount(state?.betHistory?.betsHistory, 'premium')
            let tableCopyPre = sportCopy.pre?.data[getBetTable('premium')]
            console.log('::::::::', tableCopyPre, profitsPreMark);
            if (PreTable) {
                tableCopyPre.forEach(subElement => {
                    subElement.sub_sb.forEach(x =>
                        x.betProfit = profitsPreMark[x.nat]
                    );
                });
            }
            sportCopy.page.data[getBetTable('premium')] = tableCopyPre



            //for fancy
            // const fancyTable = state?.betHistory?.betsHistory.find(_ => _.betType === "bookMark")
            const profitsfancy = betsLastExposure(state?.betHistory?.betsHistory)
            let tableCopyfancy = sportCopy.page?.data[getBetTable('session')]
            if (profitsfancy.length) {
                tableCopyfancy.forEach(subElement => {
                    let findele = profitsfancy.findIndex(_ => _.selection === subElement.nat)
                    console.log(':::::::::findele');
                    if (findele !== -1) {
                        subElement.betProfit = profitsfancy[findele].exposure.toFixed(2)
                    }
                });
            }

            sportCopy.page.data[getBetTable('session')] = tableCopyfancy

            return { ...state, sportDetails: sportCopy }
        }
        case 'USER_BET_HISTORY': {

            // let sportCopy = state.sportDetails
            // // console.log('GET_SPORTS_DETAILS', state.sportDetails);
            // // debugger
            // // // console.log(':::::::betsHistory',filterSportCount(action.payload.betsHistory), action.payload.betsHistory )
            // // if (action.payload.pageData !== {}) {

            // // const OddsTable = action?.payload?.betsHistory.find(_ => _.betType === "odds")
            // // const profitsOdds = filterSportCount(action?.payload?.betsHistory, 'odds')
            // // let tableCopy = sportCopy.page?.data[getBetTable('odds')]
            // // if (OddsTable) {
            // //     tableCopy.forEach(subElement => {
            // //         if (subElement.nat === OddsTable.winnerSelection[0]) {
            // //             subElement.betProfit = profitsOdds.left
            // //         } else if (subElement.nat === OddsTable.winnerSelection[1]) {
            // //             subElement.betProfit = profitsOdds.right
            // //         } else if (subElement.nat === OddsTable.winnerSelection[2]) {
            // //             subElement.betProfit = profitsOdds.draw
            // //         }
            // //     });
            // // }
            // // sportCopy.page.data[getBetTable('odds')] = tableCopy


            // //     // for book maker
            // //     const BookMarkTable = action?.payload?.betsHistory.find(_ => _.betType === "bookMark")
            // //     const profitsBookMark = filterSportCount(action?.payload?.betsHistory, 'bookMark')
            // //     let tableCopyBookMark = sportCopy.page?.data[getBetTable('bookMark')]
            // //     if (BookMarkTable) {
            // //         tableCopyBookMark.forEach(subElement => {
            // //             if (subElement.nat === BookMarkTable.winnerSelection[0]) {
            // //                 subElement.betProfit = profitsBookMark.left
            // //             } else if (subElement.nat === BookMarkTable.winnerSelection[1]) {
            // //                 subElement.betProfit = profitsBookMark.right
            // //             } else if (subElement.nat === BookMarkTable.winnerSelection[2]) {
            // //                 subElement.betProfit = profitsBookMark.draw
            // //             }
            // //         });
            // //     }

            // //     sportCopy.page.data[getBetTable('bookMark')] = tableCopyBookMark



            // //     //for fancy
            // //     // const fancyTable = state?.betHistory?.betsHistory.find(_ => _.betType === "bookMark")
            // //     const profitsfancy = betsLastExposure(action?.payload?.betsHistory)
            // //     let tableCopyfancy = sportCopy.page?.data[getBetTable('session')]
            // //     if (profitsfancy.length) {
            // //         tableCopyfancy.forEach(subElement => {
            // //             let findele = profitsfancy.findIndex(_ => _.selection === subElement.nat)
            // //             console.log(':::::::::findele');
            // //             if (findele !== -1) {
            // //                 subElement.betProfit = profitsfancy[findele].exposure
            // //             }
            // //         });
            // //     }

            // //     sportCopy.page.data[getBetTable('session')] = tableCopyfancy


            // //     state.sportDetails = sportCopy

            // // }


            return { ...state, betHistory: action.payload }
        }
        case 'CLICKED_GAME': {
            return { ...state, clickedGame: action.payload }
        }
        case REHYDRATE:
            return {
                ...state,
                // sportDetails: {},
                // User: action?.payload?.User ? action?.payload?.User : '',
            }
        default:
            return { ...state };
    }
}

export const reducer = skyReducer;



function filterSportCount(betsHistory, betType) {
    let left = 0;
    let right = 0;
    let draw = 0;
    let oldExp = {}

    if (betsHistory) {
        // for await (const bet of betList) 
        betsHistory.forEach((bet) => {
            if (bet.betType === betType && !bet.deleted) {

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
                                oldExp[element] = -profileForBet;
                            } else {
                                oldExp[element] -= profileForBet;
                            }
                        }
                        else {
                            if (!oldExp[element]) {
                                oldExp[element] = exposureForBet;
                            } else {
                                oldExp[element] += exposureForBet;
                            }
                        }
                    } else {
                        if (bet.betSide === "back") {
                            if (!oldExp[element]) {
                                oldExp[element] = exposureForBet;
                            } else {
                                oldExp[element] += exposureForBet;
                            }
                        }
                        else {
                            if (!oldExp[element]) {
                                oldExp[element] = -profileForBet;
                            } else {
                                oldExp[element] -= profileForBet;
                            }
                        }

                    }
                });
            }
        })
    }

    return oldExp

}

function filterSportPreCount(betsHistory, betType) {
    let left = 0;
    let right = 0;
    let draw = 0;
    let oldExp = {}

    if (betsHistory) {
        // for await (const bet of betList) 
        betsHistory.forEach((bet) => {
            if (bet.betType === betType && !bet.deleted) {

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

                console.log("profileForBet pre :: ", profileForBet);
                console.log("exposureForBet pre :: ", exposureForBet, winnerSelection, bet.selection);
                winnerSelection.forEach((element) => {
                    console.log('::::::pre', element, bet);
                    if (element === bet.subSelection) {
                        if (!oldExp[element]) {
                            oldExp[element] = -profileForBet;
                        } else {
                            oldExp[element] -= profileForBet;
                        }
                    } else {
                        if (!oldExp[element]) {
                            oldExp[element] = exposureForBet;
                        } else {
                            oldExp[element] += exposureForBet;
                        }
                    }
                });
            }
        })
    }

    return oldExp

}


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

// return user exposure
/*
    if value return 20 this user exposure and admin winning
*/ function betsLastExposure(betList) {
    let arr = [];
    for (const bet of betList) {
        if (bet.betType === 'session') {
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
    }
    console.log("arr :1:: ", arr);
    arr = arr.map((ele) => {
        const exposure = calculatExposure({ back: ele.back, lay: ele.lay });
        return {
            selection: ele.selection,
            exposure,
        };
    });

    console.log("arr ::: ", arr);

    return arr;
}
