// const mongo = require("../config/mongodb");

function fancyExposureCalculation(bet, numberArray, oddsValues) {
  const no = bet.fancyNo;
  const yes = bet.fancyYes;

  if (bet.betSide === "yes") {
    if (!oddsValues.includes(yes)) {
      oddsValues.push(yes);
    }
    if (!oddsValues.includes(yes + 1)) {
      oddsValues.push(yes + 1);
    }
    if (!oddsValues.includes(yes - 1)) {
      oddsValues.push(yes - 1);
    }
  } else {
    if (!oddsValues.includes(no)) {
      oddsValues.push(no);
    }
    if (!oddsValues.includes(no + 1)) {
      oddsValues.push(no + 1);
    }
    if (!oddsValues.includes(no - 1)) {
      oddsValues.push(no - 1);
    }
  }

  console.log("max values : oddsValues : ", oddsValues);
  console.log("no value : ", no);
  console.log("yes value : ", yes);
  const maxVal = Math.max(...oddsValues);
  console.log("max values : maxVal : ", maxVal);
  // for (let i = no - 1; i <= yes + 100; i++) {
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

  return numberArray;
}
const betList = [];
const betPlacedList = [
  {
    _id: "648df6ac6ae0427607d1c9d8",
    userId: "648d708fafebd6f134da441b",
    matchId: "648aef88a2386f8fbc718a5e",
    type: "cricket",
    betType: "session",
    betSide: "no",
    betStatus: "completed",
    winnerSelection: ["50 Over SL"],
    selection: "50 Over SL",
    subSelection: "",
    betId: 0,
    betPlaced: 500,
    stake: 500,
    oddsUp: 241,
    oddsDown: 100,
    fancyYes: 244,
    fancyNo: 241,
    profit: 500,
    exposure: 500,
    tType: "win",
    deleted: false,
    teams: "",
    winner: 213,
    createdAt: "2023-06-17T18:08:44.305Z",
    updatedAt: "2023-06-17T18:35:33.827Z",
    __v: 0,
  },
  // {
  //   _id: "648df7d06ae0427607d25ae4",
  //   userId: "648d708fafebd6f134da441b",
  //   matchId: "648aef88a2386f8fbc718a5e",
  //   type: "cricket",
  //   betType: "session",
  //   betSide: "yes",
  //   betStatus: "completed",
  //   winnerSelection: ["50 Over SL"],
  //   selection: "50 Over SL",
  //   subSelection: "",
  //   betId: 0,
  //   betPlaced: 500,
  //   stake: 500,
  //   oddsUp: 215,
  //   oddsDown: 100,
  //   fancyYes: 215,
  //   fancyNo: 213,
  //   profit: 500,
  //   exposure: 500,
  //   tType: "lost",
  //   deleted: false,
  //   teams: "",
  //   winner: 213,
  //   createdAt: "2023-06-17T18:13:36.102Z",
  //   updatedAt: "2023-06-17T18:35:33.827Z",
  //   __v: 0,
  // },
  // {
  //   _id: "648df8006ae0427607d27109",
  //   userId: "648d708fafebd6f134da441b",
  //   matchId: "648aef88a2386f8fbc718a5e",
  //   type: "cricket",
  //   betType: "session",
  //   betSide: "yes",
  //   betStatus: "completed",
  //   winnerSelection: ["1st 4 Wkt GLOU"],
  //   selection: "1st 4 Wkt GLOU",
  //   subSelection: "",
  //   betId: 0,
  //   betPlaced: 20,
  //   stake: 20,
  //   oddsUp: 109,
  //   oddsDown: 80,
  //   fancyYes: 109,
  //   fancyNo: 109,
  //   profit: 16,
  //   exposure: 20,
  //   tType: "lost",
  //   deleted: false,
  //   teams: "",
  //   winner: 57,
  //   createdAt: "2023-06-17T18:14:24.150Z",
  //   updatedAt: "2023-06-17T18:35:33.827Z",
  //   __v: 0,
  // },
  // {
  //   _id: "648df8026ae0427607d272ac",
  //   userId: "648d708fafebd6f134da441b",
  //   matchId: "648aef88a2386f8fbc718a5e",
  //   type: "cricket",
  //   betType: "session",
  //   betSide: "yes",
  //   betStatus: "completed",
  //   winnerSelection: ["1st 4 Wkt GLOU"],
  //   selection: "1st 4 Wkt GLOU",
  //   subSelection: "",
  //   betId: 0,
  //   betPlaced: 20,
  //   stake: 20,
  //   oddsUp: 109,
  //   oddsDown: 80,
  //   fancyYes: 109,
  //   fancyNo: 109,
  //   profit: 16,
  //   exposure: 20,
  //   tType: "lost",
  //   deleted: false,
  //   teams: "",
  //   winner: 57,
  //   createdAt: "2023-06-17T18:14:26.499Z",
  //   updatedAt: "2023-06-17T18:35:33.827Z",
  //   __v: 0,
  // },
  // {
  //   _id: "648df8526ae0427607d2a5d6",
  //   userId: "648d708fafebd6f134da441b",
  //   matchId: "648aef88a2386f8fbc718a5e",
  //   type: "cricket",
  //   betType: "session",
  //   betSide: "yes",
  //   betStatus: "completed",
  //   winnerSelection: ["1st 4 Wkt GLOU"],
  //   selection: "1st 4 Wkt GLOU",
  //   subSelection: "",
  //   betId: 0,
  //   betPlaced: 20,
  //   stake: 20,
  //   oddsUp: 111,
  //   oddsDown: 80,
  //   fancyYes: 111,
  //   fancyNo: 111,
  //   profit: 16,
  //   exposure: 20,
  //   tType: "lost",
  //   deleted: false,
  //   teams: "",
  //   winner: 57,
  //   createdAt: "2023-06-17T18:15:46.616Z",
  //   updatedAt: "2023-06-17T18:35:33.827Z",
  //   __v: 0,
  // },
  // {
  //   _id: "648df8556ae0427607d2a838",
  //   userId: "648d708fafebd6f134da441b",
  //   matchId: "648aef88a2386f8fbc718a5e",
  //   type: "cricket",
  //   betType: "session",
  //   betSide: "yes",
  //   betStatus: "completed",
  //   winnerSelection: ["1st 4 Wkt GLOU"],
  //   selection: "1st 4 Wkt GLOU",
  //   subSelection: "",
  //   betId: 0,
  //   betPlaced: 20,
  //   stake: 20,
  //   oddsUp: 111,
  //   oddsDown: 80,
  //   fancyYes: 111,
  //   fancyNo: 111,
  //   profit: 16,
  //   exposure: 20,
  //   tType: "lost",
  //   deleted: false,
  //   teams: "",
  //   winner: 57,
  //   createdAt: "2023-06-17T18:15:49.860Z",
  //   updatedAt: "2023-06-17T18:35:33.827Z",
  //   __v: 0,
  // },
];

async function betsLastExposure(userId, selection, matchId, type, betType) {
  const query = {
    matchId: matchId,
    userId: userId,
    betType,
    selection,
    type,
    deleted: false,
  };

  // const betList = await mongo.bettingApp.model(mongo.models.betsHistory).find({
  //   query,
  // });

  let exposure = 0;

  let betValue = {
    no: { up: -2, down: -2 },
    yes: { up: -2, down: -2 },
  };
  let oddsValues = [];
  betList.forEach((value) => {
    if (value.betSide === "yes") {
      if (!oddsValues.includes(value.fancyYes)) {
        oddsValues.push(value.fancyYes);
      }
      if (!oddsValues.includes(value.fancyYes + 1)) {
        oddsValues.push(value.fancyYes + 1);
      }
      if (!oddsValues.includes(value.fancyYes - 1)) {
        oddsValues.push(value.fancyYes - 1);
      }
    } else {
      if (!oddsValues.includes(value.fancyNo)) {
        oddsValues.push(value.fancyNo);
      }
      if (!oddsValues.includes(value.fancyNo + 1)) {
        oddsValues.push(value.fancyNo + 1);
      }
      if (!oddsValues.includes(value.fancyNo - 1)) {
        oddsValues.push(value.fancyNo - 1);
      }
    }
  });

  let numberArray = {};
  console.log(" betsLastExposure :  betList ::: ", betList);
  for await (const bet of betList) {
    numberArray = await fancyExposureCalculation(bet, numberArray, oddsValues);
    betValue.yes.up = bet.fancyYes;
    betValue.yes.down = bet.oddsDown;
    betValue.no.up = bet.fancyNo;
    betValue.no.down = bet.oddsDown;
  }

  const newExpByNew = Object.keys(numberArray)
    .map((key) => numberArray[key])
    .sort((a, b) => a - b);
  console.log("newExpByNew :: ", newExpByNew);
  if (newExpByNew && newExpByNew.length) {
    exposure = newExpByNew[0];
  }

  console.log("exposure ::: ", exposure);

  console.log("fancy : fancy : : betsLastExposure :: ");
  console.log({ numberArray, exposure, betValue, commission: 0 });
  return { numberArray, exposure, betValue, commission: 0, oddsValues };
}

async function currantBet(betDetail, userId) {
  const {
    matchId,
    type,
    betType,
    betSide,
    selection,
    betPlaced,
    stake,
    oddsUp,
    oddsDown,
    profit,
    exposure,
  } = betDetail;
  const oldBets = await betsLastExposure(
    userId,
    selection,
    matchId,
    type,
    betType
  );

  console.log("currantBet : fancy : : betDetail :: ");
  console.log(betDetail);
  console.log("currantBet : fancy : oldBets :: ");
  console.log(oldBets);
  let newExp = 0;

  let { betValue, numberArray, oddsValues } = oldBets;

  numberArray = await fancyExposureCalculation(
    betDetail,
    numberArray,
    oddsValues
  );

  console.log("currantBet : numberArray ::: new : ", numberArray);
  const newExpByNew = Object.keys(numberArray)
    .map((key) => numberArray[key])
    .sort((a, b) => a - b);
  console.log("newExpByNew :: ", newExpByNew);
  if (newExpByNew && newExpByNew.length) {
    newExp = newExpByNew[0];
  }

  console.log("exposure ::newExp: ", newExp);

  console.log(
    "currantBet :fancy :: newExp, oldExp:oldBets.exposure :: ",
    newExp,
    " == ",
    oldBets.exposure
  );
  return { newExp: Math.abs(newExp), oldExp: Math.abs(oldBets.exposure) };
}

let balance = 53.2;
let exposure = 0;
async function placeBet(body, userId) {
  console.log("placeBet : balance ::: ", balance);
  console.log("placeBet : exposure ::: ", exposure);
  const betExp = await currantBet(body, userId);

  console.log("placeBet : betExp ::: ", betExp);
  const { newExp, oldExp } = betExp;
  const userNewBalance = balance + oldExp - newExp;
  console.log("placeBet : userNewBalance ::: ", userNewBalance);
  if (userNewBalance < 0) {
    console.log(" user blance is to low");
  }

  console.log("placeBet : balance ::11111: ", balance);
  console.log("placeBet : exposure ::11111: ", exposure);

  balance += oldExp;
  exposure -= oldExp;

  console.log("placeBet : balance ::22222: ", balance);
  console.log("placeBet : exposure ::22222: ", exposure);

  balance -= newExp;
  exposure += newExp;
  console.log("placeBet : balance ::33333: ", balance);
  console.log("placeBet : exposure ::33333: ", exposure);

  return { balance, exposure };
}

// placeBet(betPlacedList[0], betPlacedList[0].userId);
async function test() {
  for await (const list of betPlacedList) {
    const data = await placeBet(list, list.userId);
    console.log(" test ::: data :: ", data);
    betList.push(list);
  }
}

// test();

const bookExposer = (betList) => {
  let arr = [];
  let oddsValues = [];
  for (const bet of betList) {
    let numberArray = {};
    if (bet.betType === "session") {
      if (oddsValues.length === 0)
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

async function test1() {
  const data = await bookExposer(betPlacedList);
  console.log(data);
}

test1();
