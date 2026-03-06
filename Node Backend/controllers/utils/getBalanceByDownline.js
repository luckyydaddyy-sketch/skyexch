const moment = require("moment-timezone");
const mongo = require("../../config/mongodb");
const { GAME_STATUS } = require("../../constants");
const {
  getStartEndDateTime,
  getMonthStartAndEndDateForTodayDate,
  getDateFromStartDate,
} = require("../../utils/comman/date");
const {
  getTotalAmountForAdmin,
  getTotalCommissionForAdmin,
} = require("../admin/report/userProfitLost/getTotalLostWinForUser");

// client = agent
// user = player
async function balanceCalculation(id, balance, credit_ref, status) {
  console.log("balanceCalculation :: id : ", id);
  let agentBalance = 0;
  let clientBalance = 0;
  let exposure = 0;
  let myPl = 0; // my profit lose // cumulative_pl
  let ref_pl = 0; // my profit lose
  let commission = 0;

  const query = {
    whoAdd: id,
  };

  if (status !== "all") {
    query.status = status;
  }

  const agentInfo = await mongo.bettingApp.model(mongo.models.admins).find({
    query,
    select: { remaining_balance: 1 },
  });

  // console.log("balanceCalculation :: agentInfo : ", agentInfo);
  const playerInfo = await mongo.bettingApp.model(mongo.models.users).find({
    query,
    select: {
      remaining_balance: 1,
      exposure: 1,
      commission: 1,
      cumulative_pl: 1,
      ref_pl: 1,
      balance: 1,
      credit_ref: 1,
      _id: 1,
      sportWiningsTotalAmount: 1,
      casinoWiningsTotalAmount: 1,
      sportWiningsTotalAmountMonth: 1,
      casinoWiningsTotalAmountMonth: 1,
    },
  });

  // console.log("balanceCalculation :: playerInfo : ", playerInfo);
  agentInfo.forEach((element) => {
    agentBalance += element.remaining_balance;
  });
  // console.log("balanceCalculation : ref_pl : befor : ", ref_pl);
  playerInfo.forEach((element) => {
    commission = element.commission;
    clientBalance += element.remaining_balance;
    exposure += element.exposure < 0 ? 0 : Number(element.exposure.toFixed(2));
    // exposure += element.exposure;
    // myPl += element.cumulative_pl; // my change
    ref_pl += Number(
      (element.remaining_balance - element.credit_ref).toFixed(2)
    );
    // myPl += element.ref_pl;
    // console.log("balanceCalculation : ref_pl : in for : ", ref_pl);
  });
  const userIds = playerInfo.map((value) => value._id);
  console.time(`satrt : getMyCumulativeProfitLostWithAggrigation`);
  myPl = await getMyCumulativeProfitLostWithAggrigation(userIds, commission);
  console.timeEnd(`satrt : getMyCumulativeProfitLostWithAggrigation`);
  console.log("balanceCalculation : ref_pl : after : ", ref_pl);
  console.log("balanceCalculation : myPl : after : ", myPl);
  let tempMyPl = 0;
  // const tempMyPl = playerInfo.reduce((sum, info) => {
  //   return (
  //     sum +
  //     Number(info?.sportWiningsTotalAmountMonth || 0) +
  //     Number(info?.casinoWiningsTotalAmountMonth || 0)
  //   );
  // }, 0);

  console.log("balanceCalculation : tempMyPl :: ", tempMyPl);
  myPl += tempMyPl;
  console.log("balanceCalculation : myPl : after :tempMyPl: ", myPl, tempMyPl);
  // agentBalance.toFixed(2);
  return {
    agentBalance: Number(agentBalance.toFixed(2)),
    clientBalance: Number(clientBalance.toFixed(2)),
    exposure: Number(exposure.toFixed(2)),
    myPl: Number(myPl.toFixed(2)),
    ref_pl: Number(ref_pl.toFixed(2)),
  };
}

function playerCalculation(balance, credit_ref) {
  return balance - credit_ref;
}
// get cumulative_pl
async function getMyCumulativeProfitLostWithAggrigation(userIds, commission) {
  // console.log("userIds ::: ", userIds);
  let myPl = 0;
  console.time("starrt:::getMyCumulativeProfitLostWithAggrigation");
  // for await (const userId of userIds) {
  //   const query = {
  //     userId,
  //     deleted: false,
  //     // betStatus: "completed",
  //     // winner: { $ne: "cancel" },
  //     winner: { $nin: ["cancel", ""] },
  //   };

  //   const casinoQuery = {
  //     userObjectId: userId,
  //     winLostAmount: { $ne: 0 },
  //   };

  //   const userInfoAgent = await mongo.bettingApp
  //     .model(mongo.models.betsHistory)
  //     .aggregate({
  //       pipeline: [
  //         {
  //           $match: query,
  //         },
  //         {
  //           $group: {
  //             _id: "$matchId",
  //             odds: {
  //               $sum: {
  //                 $cond: {
  //                   if: {
  //                     $and: [
  //                       {
  //                         $and: [
  //                           {
  //                             $ne: ["$winner", ""],
  //                           },
  //                           {
  //                             $ne: ["$winner", "cancel"],
  //                           },
  //                         ],
  //                       },
  //                       {
  //                         $eq: ["$betType", "odds"],
  //                       },
  //                       {
  //                         $eq: ["$betSide", "back"],
  //                       },
  //                       {
  //                         $eq: ["$selection", "$winner"],
  //                       },
  //                     ],
  //                   },
  //                   then: "$profit",
  //                   else: {
  //                     $cond: {
  //                       if: {
  //                         $and: [
  //                           {
  //                             $and: [
  //                               {
  //                                 $ne: ["$winner", ""],
  //                               },
  //                               {
  //                                 $ne: ["$winner", "cancel"],
  //                               },
  //                             ],
  //                           },
  //                           {
  //                             $eq: ["$betType", "odds"],
  //                           },
  //                           {
  //                             $eq: ["$betSide", "back"],
  //                           },
  //                           {
  //                             $ne: ["$selection", "$winner"],
  //                           },
  //                         ],
  //                       },
  //                       then: {
  //                         $subtract: [0, "$exposure"],
  //                       },
  //                       else: {
  //                         $cond: {
  //                           if: {
  //                             $and: [
  //                               {
  //                                 $and: [
  //                                   {
  //                                     $ne: ["$winner", ""],
  //                                   },
  //                                   {
  //                                     $ne: ["$winner", "cancel"],
  //                                   },
  //                                 ],
  //                               },
  //                               {
  //                                 $eq: ["$betType", "odds"],
  //                               },
  //                               {
  //                                 $eq: ["$betSide", "lay"],
  //                               },
  //                               {
  //                                 $ne: ["$selection", "$winner"],
  //                               },
  //                             ],
  //                           },
  //                           then: "$betPlaced",
  //                           else: {
  //                             $cond: {
  //                               if: {
  //                                 $and: [
  //                                   {
  //                                     $and: [
  //                                       {
  //                                         $ne: ["$winner", ""],
  //                                       },
  //                                       {
  //                                         $ne: ["$winner", "cancel"],
  //                                       },
  //                                     ],
  //                                   },
  //                                   {
  //                                     $eq: ["$betType", "odds"],
  //                                   },
  //                                   {
  //                                     $eq: ["$betSide", "lay"],
  //                                   },
  //                                   {
  //                                     $eq: ["$selection", "$winner"],
  //                                   },
  //                                 ],
  //                               },
  //                               then: {
  //                                 $subtract: [0, "$exposure"],
  //                               },
  //                               else: 0,
  //                             },
  //                           },
  //                         },
  //                       },
  //                     },
  //                   },
  //                 },
  //               },
  //             },
  //             bookMark: {
  //               $sum: {
  //                 $cond: {
  //                   if: {
  //                     $and: [
  //                       {
  //                         $and: [
  //                           {
  //                             $ne: ["$winner", ""],
  //                           },
  //                           {
  //                             $ne: ["$winner", "cancel"],
  //                           },
  //                         ],
  //                       },
  //                       {
  //                         $eq: ["$betType", "bookMark"],
  //                       },
  //                       {
  //                         $eq: ["$betSide", "back"],
  //                       },
  //                       {
  //                         $eq: ["$selection", "$winner"],
  //                       },
  //                     ],
  //                   },
  //                   then: "$profit",
  //                   else: {
  //                     $cond: {
  //                       if: {
  //                         $and: [
  //                           {
  //                             $and: [
  //                               {
  //                                 $ne: ["$winner", ""],
  //                               },
  //                               {
  //                                 $ne: ["$winner", "cancel"],
  //                               },
  //                             ],
  //                           },
  //                           {
  //                             $eq: ["$betType", "bookMark"],
  //                           },
  //                           {
  //                             $eq: ["$betSide", "back"],
  //                           },
  //                           {
  //                             $ne: ["$selection", "$winner"],
  //                           },
  //                         ],
  //                       },
  //                       then: {
  //                         $subtract: [0, "$exposure"],
  //                       },
  //                       else: {
  //                         $cond: {
  //                           if: {
  //                             $and: [
  //                               {
  //                                 $and: [
  //                                   {
  //                                     $ne: ["$winner", ""],
  //                                   },
  //                                   {
  //                                     $ne: ["$winner", "cancel"],
  //                                   },
  //                                 ],
  //                               },
  //                               {
  //                                 $eq: ["$betType", "bookMark"],
  //                               },
  //                               {
  //                                 $eq: ["$betSide", "lay"],
  //                               },
  //                               {
  //                                 $ne: ["$selection", "$winner"],
  //                               },
  //                             ],
  //                           },
  //                           then: "$betPlaced",
  //                           else: {
  //                             $cond: {
  //                               if: {
  //                                 $and: [
  //                                   {
  //                                     $and: [
  //                                       {
  //                                         $ne: ["$winner", ""],
  //                                       },
  //                                       {
  //                                         $ne: ["$winner", "cancel"],
  //                                       },
  //                                     ],
  //                                   },
  //                                   {
  //                                     $eq: ["$betType", "bookMark"],
  //                                   },
  //                                   {
  //                                     $eq: ["$betSide", "lay"],
  //                                   },
  //                                   {
  //                                     $eq: ["$selection", "$winner"],
  //                                   },
  //                                 ],
  //                               },
  //                               then: {
  //                                 $subtract: [0, "$exposure"],
  //                               },
  //                               else: 0,
  //                             },
  //                           },
  //                         },
  //                       },
  //                     },
  //                   },
  //                 },
  //               },
  //             },
  //             Session: {
  //               $sum: {
  //                 $cond: {
  //                   if: {
  //                     $and: [
  //                       {
  //                         $and: [
  //                           {
  //                             $ne: ["$winner", ""],
  //                           },
  //                           {
  //                             $ne: ["$winner", -2],
  //                           },
  //                         ],
  //                       },
  //                       {
  //                         $eq: ["$betType", "session"],
  //                       },
  //                       {
  //                         $eq: ["$betSide", "yes"],
  //                       },
  //                       {
  //                         $lte: ["$oddsUp", "$winner"],
  //                       },
  //                     ],
  //                   },
  //                   then: "$profit",
  //                   else: {
  //                     $cond: {
  //                       if: {
  //                         $and: [
  //                           {
  //                             $and: [
  //                               {
  //                                 $ne: ["$winner", ""],
  //                               },
  //                               {
  //                                 $ne: ["$winner", -2],
  //                               },
  //                             ],
  //                           },
  //                           {
  //                             $eq: ["$betType", "session"],
  //                           },
  //                           {
  //                             $eq: ["$betSide", "yes"],
  //                           },
  //                           {
  //                             $gt: ["$oddsUp", "$winner"],
  //                           },
  //                         ],
  //                       },
  //                       then: {
  //                         $subtract: [0, "$exposure"],
  //                       },
  //                       else: {
  //                         $cond: {
  //                           if: {
  //                             $and: [
  //                               {
  //                                 $and: [
  //                                   {
  //                                     $ne: ["$winner", ""],
  //                                   },
  //                                   {
  //                                     $ne: ["$winner", -2],
  //                                   },
  //                                 ],
  //                               },
  //                               {
  //                                 $eq: ["$betType", "session"],
  //                               },
  //                               {
  //                                 $eq: ["$betSide", "no"],
  //                               },
  //                               {
  //                                 $gt: ["$oddsUp", "$winner"],
  //                               },
  //                             ],
  //                           },
  //                           then: "$betPlaced",
  //                           else: {
  //                             $cond: {
  //                               if: {
  //                                 $and: [
  //                                   {
  //                                     $and: [
  //                                       {
  //                                         $ne: ["$winner", ""],
  //                                       },
  //                                       {
  //                                         $ne: ["$winner", -2],
  //                                       },
  //                                     ],
  //                                   },
  //                                   {
  //                                     $eq: ["$betType", "session"],
  //                                   },
  //                                   {
  //                                     $eq: ["$betSide", "no"],
  //                                   },
  //                                   {
  //                                     $lte: ["$oddsUp", "$winner"],
  //                                   },
  //                                 ],
  //                               },
  //                               then: {
  //                                 $subtract: [0, "$profit"],
  //                               },
  //                               else: 0,
  //                             },
  //                           },
  //                         },
  //                       },
  //                     },
  //                   },
  //                 },
  //               },
  //             },
  //             Premium: {
  //               $sum: {
  //                 $cond: {
  //                   if: {
  //                     $and: [
  //                       {
  //                         $and: [
  //                           {
  //                             $ne: ["$winner", ""],
  //                           },
  //                           {
  //                             $ne: ["$winner", "cancel"],
  //                           },
  //                         ],
  //                       },
  //                       {
  //                         $eq: ["$betType", "premium"],
  //                       },
  //                       {
  //                         $eq: ["$betSide", "back"],
  //                       },
  //                       {
  //                         $eq: ["$subSelection", "$winner"],
  //                       },
  //                     ],
  //                   },
  //                   then: "$profit",
  //                   else: {
  //                     $cond: {
  //                       if: {
  //                         $and: [
  //                           {
  //                             $and: [
  //                               {
  //                                 $ne: ["$winner", ""],
  //                               },
  //                               {
  //                                 $ne: ["$winner", "cancel"],
  //                               },
  //                             ],
  //                           },
  //                           {
  //                             $eq: ["$betType", "premium"],
  //                           },
  //                           {
  //                             $eq: ["$betSide", "back"],
  //                           },
  //                           {
  //                             $ne: ["$subSelection", "$winner"],
  //                           },
  //                         ],
  //                       },
  //                       then: {
  //                         $subtract: [0, "$exposure"],
  //                       },
  //                       else: 0,
  //                     },
  //                   },
  //                 },
  //               },
  //             },
  //           },
  //         },
  //         {
  //           $project: {
  //             bookMark: 1,
  //             Session: 1,
  //             Premium: 1,
  //             odds: 1,
  //             oddsNew: {
  //               $cond: {
  //                 if: {
  //                   $gt: ["$odds", 0],
  //                 },
  //                 then: {
  //                   $subtract: [
  //                     "$odds",
  //                     {
  //                       $multiply: [
  //                         "$odds",
  //                         {
  //                           $divide: [commission, 100],
  //                         },
  //                       ],
  //                     },
  //                   ],
  //                 },
  //                 else: "$odds",
  //               },
  //             },
  //             rake: {
  //               $cond: {
  //                 if: {
  //                   $gt: ["$odds", 0],
  //                 },
  //                 then: {
  //                   $multiply: [
  //                     "$odds",
  //                     {
  //                       $divide: [commission, 100],
  //                     },
  //                   ],
  //                 },
  //                 else: 0,
  //               },
  //             },
  //           },
  //         },
  //         {
  //           $project: {
  //             totalAmount: {
  //               $sum: ["$bookMark", "$Session", "$Premium", "$oddsNew"],
  //             },
  //             rake: 1,
  //           },
  //         },
  //         {
  //           $group: {
  //             _id: "null",
  //             amount: {
  //               $sum: "$totalAmount",
  //             },
  //             rake: {
  //               $sum: "$rake",
  //             },
  //           },
  //         },
  //       ],
  //     });

  //   const casinoHisab = await mongo.bettingApp
  //     .model(mongo.models.casinoMatchHistory)
  //     .aggregate({
  //       pipeline: [
  //         {
  //           $match: casinoQuery,
  //         },
  //         {
  //           $group: {
  //             _id: null,
  //             totalAmountWin: {
  //               $sum: {
  //                 $cond: {
  //                   if: { $eq: ["$gameStatus", GAME_STATUS.WIN] },
  //                   then: "$winLostAmount",
  //                   else: 0,
  //                 },
  //               },
  //             },
  //             totalAmountLost: {
  //               $sum: {
  //                 $cond: {
  //                   if: { $eq: ["$gameStatus", GAME_STATUS.LOSE] },
  //                   then: "$winLostAmount",
  //                   else: 0,
  //                 },
  //               },
  //             },
  //           },
  //         },
  //         {
  //           $project: {
  //             totalAmount: {
  //               $subtract: ["$totalAmountWin", "$totalAmountLost"],
  //             },
  //           },
  //         },
  //       ],
  //     });
  //   console.log("casinoHisab :::: ", casinoHisab);
  //   console.log("userInfoAgent :::: ", userInfoAgent);
  //   if (userInfoAgent && userInfoAgent.length > 0 && userInfoAgent[0].amount) {
  //     myPl += userInfoAgent[0].amount;
  //   }
  //   if (casinoHisab && casinoHisab.length > 0 && casinoHisab[0].totalAmount) {
  //     myPl += casinoHisab[0].totalAmount;
  //   }
  // }

  const tempPL = await getMyCumulativeProfitLost(userIds, commission);
  console.timeEnd("starrt:::getMyCumulativeProfitLostWithAggrigation");
  return tempPL;
}
async function getOnePlayerMyCumulativeProfitLostWithAggrigation(
  userId,
  commission,
  isUseDate = true
) {
  let myPl = 0;
  console.time("starrt:::getOnePlayerMyCumulativeProfitLostWithAggrigation");

  // const query = {
  //   userId,
  //   deleted: false,
  //   // betStatus: "completed",
  //   winner: { $nin: ["cancel", ""] },
  // };

  // const casinoQuery = {
  //   userObjectId: userId,
  //   winLostAmount: { $ne: 0 },
  // };

  // const userInfoAgent = await mongo.bettingApp
  //   .model(mongo.models.betsHistory)
  //   .aggregate({
  //     pipeline: [
  //       {
  //         $match: query,
  //       },
  //       {
  //         $group: {
  //           _id: "$matchId",
  //           odds: {
  //             $sum: {
  //               $cond: {
  //                 if: {
  //                   $and: [
  //                     {
  //                       $and: [
  //                         {
  //                           $ne: ["$winner", ""],
  //                         },
  //                         {
  //                           $ne: ["$winner", "cancel"],
  //                         },
  //                       ],
  //                     },
  //                     {
  //                       $eq: ["$betType", "odds"],
  //                     },
  //                     {
  //                       $eq: ["$betSide", "back"],
  //                     },
  //                     {
  //                       $eq: ["$selection", "$winner"],
  //                     },
  //                   ],
  //                 },
  //                 then: "$profit",
  //                 else: {
  //                   $cond: {
  //                     if: {
  //                       $and: [
  //                         {
  //                           $and: [
  //                             {
  //                               $ne: ["$winner", ""],
  //                             },
  //                             {
  //                               $ne: ["$winner", "cancel"],
  //                             },
  //                           ],
  //                         },
  //                         {
  //                           $eq: ["$betType", "odds"],
  //                         },
  //                         {
  //                           $eq: ["$betSide", "back"],
  //                         },
  //                         {
  //                           $ne: ["$selection", "$winner"],
  //                         },
  //                       ],
  //                     },
  //                     then: {
  //                       $subtract: [0, "$exposure"],
  //                     },
  //                     else: {
  //                       $cond: {
  //                         if: {
  //                           $and: [
  //                             {
  //                               $and: [
  //                                 {
  //                                   $ne: ["$winner", ""],
  //                                 },
  //                                 {
  //                                   $ne: ["$winner", "cancel"],
  //                                 },
  //                               ],
  //                             },
  //                             {
  //                               $eq: ["$betType", "odds"],
  //                             },
  //                             {
  //                               $eq: ["$betSide", "lay"],
  //                             },
  //                             {
  //                               $ne: ["$selection", "$winner"],
  //                             },
  //                           ],
  //                         },
  //                         then: "$betPlaced",
  //                         else: {
  //                           $cond: {
  //                             if: {
  //                               $and: [
  //                                 {
  //                                   $and: [
  //                                     {
  //                                       $ne: ["$winner", ""],
  //                                     },
  //                                     {
  //                                       $ne: ["$winner", "cancel"],
  //                                     },
  //                                   ],
  //                                 },
  //                                 {
  //                                   $eq: ["$betType", "odds"],
  //                                 },
  //                                 {
  //                                   $eq: ["$betSide", "lay"],
  //                                 },
  //                                 {
  //                                   $eq: ["$selection", "$winner"],
  //                                 },
  //                               ],
  //                             },
  //                             then: {
  //                               $subtract: [0, "$exposure"],
  //                             },
  //                             else: 0,
  //                           },
  //                         },
  //                       },
  //                     },
  //                   },
  //                 },
  //               },
  //             },
  //           },
  //           bookMark: {
  //             $sum: {
  //               $cond: {
  //                 if: {
  //                   $and: [
  //                     {
  //                       $and: [
  //                         {
  //                           $ne: ["$winner", ""],
  //                         },
  //                         {
  //                           $ne: ["$winner", "cancel"],
  //                         },
  //                       ],
  //                     },
  //                     {
  //                       $eq: ["$betType", "bookMark"],
  //                     },
  //                     {
  //                       $eq: ["$betSide", "back"],
  //                     },
  //                     {
  //                       $eq: ["$selection", "$winner"],
  //                     },
  //                   ],
  //                 },
  //                 then: "$profit",
  //                 else: {
  //                   $cond: {
  //                     if: {
  //                       $and: [
  //                         {
  //                           $and: [
  //                             {
  //                               $ne: ["$winner", ""],
  //                             },
  //                             {
  //                               $ne: ["$winner", "cancel"],
  //                             },
  //                           ],
  //                         },
  //                         {
  //                           $eq: ["$betType", "bookMark"],
  //                         },
  //                         {
  //                           $eq: ["$betSide", "back"],
  //                         },
  //                         {
  //                           $ne: ["$selection", "$winner"],
  //                         },
  //                       ],
  //                     },
  //                     then: {
  //                       $subtract: [0, "$exposure"],
  //                     },
  //                     else: {
  //                       $cond: {
  //                         if: {
  //                           $and: [
  //                             {
  //                               $and: [
  //                                 {
  //                                   $ne: ["$winner", ""],
  //                                 },
  //                                 {
  //                                   $ne: ["$winner", "cancel"],
  //                                 },
  //                               ],
  //                             },
  //                             {
  //                               $eq: ["$betType", "bookMark"],
  //                             },
  //                             {
  //                               $eq: ["$betSide", "lay"],
  //                             },
  //                             {
  //                               $ne: ["$selection", "$winner"],
  //                             },
  //                           ],
  //                         },
  //                         then: "$betPlaced",
  //                         else: {
  //                           $cond: {
  //                             if: {
  //                               $and: [
  //                                 {
  //                                   $and: [
  //                                     {
  //                                       $ne: ["$winner", ""],
  //                                     },
  //                                     {
  //                                       $ne: ["$winner", "cancel"],
  //                                     },
  //                                   ],
  //                                 },
  //                                 {
  //                                   $eq: ["$betType", "bookMark"],
  //                                 },
  //                                 {
  //                                   $eq: ["$betSide", "lay"],
  //                                 },
  //                                 {
  //                                   $eq: ["$selection", "$winner"],
  //                                 },
  //                               ],
  //                             },
  //                             then: {
  //                               $subtract: [0, "$exposure"],
  //                             },
  //                             else: 0,
  //                           },
  //                         },
  //                       },
  //                     },
  //                   },
  //                 },
  //               },
  //             },
  //           },
  //           Session: {
  //             $sum: {
  //               $cond: {
  //                 if: {
  //                   $and: [
  //                     {
  //                       $and: [
  //                         {
  //                           $ne: ["$winner", ""],
  //                         },
  //                         {
  //                           $ne: ["$winner", -2],
  //                         },
  //                       ],
  //                     },
  //                     {
  //                       $eq: ["$betType", "session"],
  //                     },
  //                     {
  //                       $eq: ["$betSide", "yes"],
  //                     },
  //                     {
  //                       $lte: ["$oddsUp", "$winner"],
  //                     },
  //                   ],
  //                 },
  //                 then: "$profit",
  //                 else: {
  //                   $cond: {
  //                     if: {
  //                       $and: [
  //                         {
  //                           $and: [
  //                             {
  //                               $ne: ["$winner", ""],
  //                             },
  //                             {
  //                               $ne: ["$winner", -2],
  //                             },
  //                           ],
  //                         },
  //                         {
  //                           $eq: ["$betType", "session"],
  //                         },
  //                         {
  //                           $eq: ["$betSide", "yes"],
  //                         },
  //                         {
  //                           $gt: ["$oddsUp", "$winner"],
  //                         },
  //                       ],
  //                     },
  //                     then: {
  //                       $subtract: [0, "$exposure"],
  //                     },
  //                     else: {
  //                       $cond: {
  //                         if: {
  //                           $and: [
  //                             {
  //                               $and: [
  //                                 {
  //                                   $ne: ["$winner", ""],
  //                                 },
  //                                 {
  //                                   $ne: ["$winner", -2],
  //                                 },
  //                               ],
  //                             },
  //                             {
  //                               $eq: ["$betType", "session"],
  //                             },
  //                             {
  //                               $eq: ["$betSide", "no"],
  //                             },
  //                             {
  //                               $gt: ["$oddsUp", "$winner"],
  //                             },
  //                           ],
  //                         },
  //                         then: "$betPlaced",
  //                         else: {
  //                           $cond: {
  //                             if: {
  //                               $and: [
  //                                 {
  //                                   $and: [
  //                                     {
  //                                       $ne: ["$winner", ""],
  //                                     },
  //                                     {
  //                                       $ne: ["$winner", -2],
  //                                     },
  //                                   ],
  //                                 },
  //                                 {
  //                                   $eq: ["$betType", "session"],
  //                                 },
  //                                 {
  //                                   $eq: ["$betSide", "no"],
  //                                 },
  //                                 {
  //                                   $lte: ["$oddsUp", "$winner"],
  //                                 },
  //                               ],
  //                             },
  //                             then: {
  //                               $subtract: [0, "$profit"],
  //                             },
  //                             else: 0,
  //                           },
  //                         },
  //                       },
  //                     },
  //                   },
  //                 },
  //               },
  //             },
  //           },
  //           Premium: {
  //             $sum: {
  //               $cond: {
  //                 if: {
  //                   $and: [
  //                     {
  //                       $and: [
  //                         {
  //                           $ne: ["$winner", ""],
  //                         },
  //                         {
  //                           $ne: ["$winner", "cancel"],
  //                         },
  //                       ],
  //                     },
  //                     {
  //                       $eq: ["$betType", "premium"],
  //                     },
  //                     {
  //                       $eq: ["$betSide", "back"],
  //                     },
  //                     {
  //                       $eq: ["$subSelection", "$winner"],
  //                     },
  //                   ],
  //                 },
  //                 then: "$profit",
  //                 else: {
  //                   $cond: {
  //                     if: {
  //                       $and: [
  //                         {
  //                           $and: [
  //                             {
  //                               $ne: ["$winner", ""],
  //                             },
  //                             {
  //                               $ne: ["$winner", "cancel"],
  //                             },
  //                           ],
  //                         },
  //                         {
  //                           $eq: ["$betType", "premium"],
  //                         },
  //                         {
  //                           $eq: ["$betSide", "back"],
  //                         },
  //                         {
  //                           $ne: ["$subSelection", "$winner"],
  //                         },
  //                       ],
  //                     },
  //                     then: {
  //                       $subtract: [0, "$exposure"],
  //                     },
  //                     else: 0,
  //                   },
  //                 },
  //               },
  //             },
  //           },
  //         },
  //       },
  //       {
  //         $project: {
  //           bookMark: 1,
  //           Session: 1,
  //           Premium: 1,
  //           odds: 1,
  //           oddsNew: {
  //             $cond: {
  //               if: {
  //                 $gt: ["$odds", 0],
  //               },
  //               then: {
  //                 $subtract: [
  //                   "$odds",
  //                   {
  //                     $multiply: [
  //                       "$odds",
  //                       {
  //                         $divide: [commission, 100],
  //                       },
  //                     ],
  //                   },
  //                 ],
  //               },
  //               else: "$odds",
  //             },
  //           },
  //           rake: {
  //             $cond: {
  //               if: {
  //                 $gt: ["$odds", 0],
  //               },
  //               then: {
  //                 $multiply: [
  //                   "$odds",
  //                   {
  //                     $divide: [commission, 100],
  //                   },
  //                 ],
  //               },
  //               else: 0,
  //             },
  //           },
  //         },
  //       },
  //       {
  //         $project: {
  //           totalAmount: {
  //             $sum: ["$bookMark", "$Session", "$Premium", "$oddsNew"],
  //           },
  //           rake: 1,
  //         },
  //       },
  //       {
  //         $group: {
  //           _id: "null",
  //           amount: {
  //             $sum: "$totalAmount",
  //           },
  //           rake: {
  //             $sum: "$rake",
  //           },
  //         },
  //       },
  //     ],
  //   });

  // const casinoHisab = await mongo.bettingApp
  //   .model(mongo.models.casinoMatchHistory)
  //   .aggregate({
  //     pipeline: [
  //       {
  //         $match: casinoQuery,
  //       },
  //       {
  //         $group: {
  //           _id: null,
  //           totalAmountWin: {
  //             $sum: {
  //               $cond: {
  //                 if: { $eq: ["$gameStatus", GAME_STATUS.WIN] },
  //                 then: "$winLostAmount",
  //                 else: 0,
  //               },
  //             },
  //           },
  //           totalAmountLost: {
  //             $sum: {
  //               $cond: {
  //                 if: { $eq: ["$gameStatus", GAME_STATUS.LOSE] },
  //                 then: "$winLostAmount",
  //                 else: 0,
  //               },
  //             },
  //           },
  //         },
  //       },
  //       {
  //         $project: {
  //           totalAmount: {
  //             $subtract: ["$totalAmountWin", "$totalAmountLost"],
  //           },
  //         },
  //       },
  //     ],
  //   });
  // console.log(
  //   "casinoHisab :getOnePlayerMyCumulativeProfitLostWithAggrigation::: ",
  //   casinoHisab
  // );
  // console.log(
  //   "userInfoAgent :getOnePlayerMyCumulativeProfitLostWithAggrigation::: ",
  //   userInfoAgent
  // );
  // if (userInfoAgent && userInfoAgent.length > 0 && userInfoAgent[0].amount) {
  //   myPl += userInfoAgent[0].amount;
  // }
  // if (casinoHisab && casinoHisab.length > 0 && casinoHisab[0].totalAmount) {
  //   myPl += casinoHisab[0].totalAmount;
  // }

  myPl = getOnePlayerCumulativeProfitLost(userId, commission, isUseDate);
  console.timeEnd("starrt:::getOnePlayerMyCumulativeProfitLostWithAggrigation");
  return myPl;
}
async function getMyCumulativeProfitLost(userIds, commission) {
  let myPl = 0;

  console.log("getMyCumulativeProfitLost ::userIds: ", userIds.length);
  const total = await getTotalAmountForAdmin(userIds);
  console.log("getMyCumulativeProfitLost ::total: ", total);
  // myPl += total;
  const { startDate, endDate } = await getStartDateForAggrigations();
  console.log("getMyCumulativeProfitLost :: startDate", startDate, endDate);

  const query = {
    userId: { $in: userIds },
    deleted: false,
    // betStatus: "completed",
    winner: { $ne: "cancel" },
    updatedAt: { $lte: endDate, $gte: startDate },
  };
  // console.log("getMyCumulativeProfitLost:: query:", query);

  const casinoQuery = {
    userObjectId: { $in: userIds },
    winLostAmount: { $ne: 0 },
    updatedAt: { $lte: endDate, $gte: startDate },
  };

  console.time("starrt:::getMyCumulativeProfitLost:db");
  const betsInfo = await mongo.bettingApp.model(mongo.models.betsHistory).find({
    query,
    select: {
      _id: 1,
      betType: 1,
      winner: 1,
      selection: 1,
      betSide: 1,
      matchId: 1,
      userId: 1,
      profit: 1,
      betPlaced: 1,
      exposure: 1,
      fancyYes: 1,
      fancyNo: 1,
      oddsUp: 1,
      subSelection: 1,
    },
  });
  console.timeEnd("starrt:::getMyCumulativeProfitLost:db");
  console.log("betsInfo.leg :: ", betsInfo.length);

  let oddsAmount1 = {};
  console.time("starrt:::getMyCumulativeProfitLost:db:forEach");
  betsInfo.forEach((bet) => {
    // for (const bet of betsInfo) {
    if (bet.betType === "odds" || bet.betType === "bookMark") {
      if (bet.winner !== "" && bet.winner !== "cancel") {
        if (bet.selection === bet.winner) {
          // new
          if (bet.betSide === "back") {
            let commi = 0;
            if (bet.betType === "odds") {
              // commi = (bet.profit * commission) / 100;

              if (oddsAmount1[`${bet.matchId}-${bet.userId}`]) {
                oddsAmount1[`${bet.matchId}-${bet.userId}`] += bet.profit;
              } else {
                oddsAmount1[`${bet.matchId}-${bet.userId}`] = bet.profit;
              }
            }
            myPl += bet.profit - commi;
          } else {
            myPl -= bet.profit;

            if (bet.betType === "odds") {
              if (oddsAmount1[`${bet.matchId}-${bet.userId}`]) {
                oddsAmount1[`${bet.matchId}-${bet.userId}`] -= bet.profit;
              } else {
                oddsAmount1[`${bet.matchId}-${bet.userId}`] = -bet.profit;
              }
            }
          }
        } else if (bet.selection !== bet.winner) {
          // new
          if (bet.betSide === "lay") {
            let commi = 0;
            if (bet.betType === "odds") {
              // commi = (bet.betPlaced * commission) / 100;

              if (oddsAmount1[`${bet.matchId}-${bet.userId}`]) {
                oddsAmount1[`${bet.matchId}-${bet.userId}`] += bet.betPlaced;
              } else {
                oddsAmount1[`${bet.matchId}-${bet.userId}`] = bet.betPlaced;
              }
            }
            myPl += bet.betPlaced - commi;
          } else {
            myPl -= bet.exposure;

            if (bet.betType === "odds") {
              if (oddsAmount1[`${bet.matchId}-${bet.userId}`]) {
                oddsAmount1[`${bet.matchId}-${bet.userId}`] -= bet.exposure;
              } else {
                oddsAmount1[`${bet.matchId}-${bet.userId}`] = -bet.exposure;
              }
            }
          }
        }
      }
    } else if (bet.betType === "session") {
      if (bet.winner !== "" && bet.winner !== -2) {
        if (bet.fancyYes === bet.fancyNo) {
          if (bet.betSide === "yes") {
            if (bet.oddsUp <= Number(bet.winner)) {
              myPl += bet.profit;
            } else {
              myPl -= bet.exposure;
            }
          } else {
            if (bet.oddsUp > Number(bet.winner)) {
              myPl += bet.betPlaced;
            } else {
              myPl -= bet.profit;
            }
          }
        } else {
          if (bet.betSide === "yes") {
            if (bet.oddsUp <= Number(bet.winner)) {
              myPl += bet.profit;
            } else {
              myPl -= bet.exposure;
            }
          } else {
            if (bet.oddsUp > Number(bet.winner)) {
              myPl += bet.betPlaced;
            } else {
              myPl -= bet.profit;
            }
          }
        }
      }
    } else if (bet.betType === "premium") {
      if (bet.winner !== "" && !bet.winner.includes("cancel")) {
        if (bet.winner.includes(bet.subSelection)) {
          myPl += bet.profit;
        } else if (!bet.winner.includes(bet.subSelection)) {
          myPl -= bet.exposure;
        }
      }
    }
  });
  console.timeEnd("starrt:::getMyCumulativeProfitLost:db:forEach");

  // console.log("oddsAmount1 :: ", oddsAmount1);
  Object.keys(oddsAmount1).forEach((key) => {
    if (oddsAmount1[key] > 0) {
      const commi = (oddsAmount1[key] * commission) / 100;
      // console.log("commi :: ", commi);
      myPl -= commi;
    }
  });

  console.log("myPl:: sport: BET", myPl);

  console.log("casinoBetsInfo :: ");
  console.time("casinoBetsInfo ::start ");
  const casinoBetsInfo = await mongo.bettingApp
    .model(mongo.models.casinoMatchHistory)
    .find({
      query: casinoQuery,
      select: {
        _id: 1,
        gameStatus: 1,
        winLostAmount: 1,
        // userObjectId: 1,
      },
    });
  console.timeEnd("casinoBetsInfo ::start ");
  console.log("casinoBetsInfo.leg :: ", casinoBetsInfo.length);
  // for await (const casinoBet of casinoBetsInfo) {
  //   const betStateMent = await mongo.bettingApp
  //     .model(mongo.models.statements)
  //     .find({
  //       query: {
  //         userId: casinoBet.userObjectId,
  //         casinoMatchId: casinoBet._id,
  //       },
  //       select: {
  //         credit: 1,
  //         userId: 1,
  //         debit: 1,
  //       },
  //     });

  //   betStateMent.forEach((betState) => {
  //     if (betState.credit !== 0) {
  //       myPl += betState.credit;
  //     } else if (betState.debit !== 0) {
  //       myPl -= betState.debit;
  //     }
  //   });
  // }
  casinoBetsInfo.forEach((casinoBet) => {
    // for (const casinoBet of casinoBetsInfo) {
    if (casinoBet.gameStatus === GAME_STATUS.WIN) {
      myPl += casinoBet.winLostAmount;
    } else if (casinoBet.gameStatus === GAME_STATUS.LOSE) {
      myPl -= casinoBet.winLostAmount;
    }
    // }
  });

  return myPl + total;
}
async function getOnePlayerCumulativeProfitLost(userId, commission, isUseDate) {
  let myPl = 0;
  // const total = await getTotalAmountForAdmin([userId]);
  const total = await getTotalCommissionForAdmin(userId);
  console.log(userId, " : getOnePlayerCumulativeProfitLost: total:: ", total);

  const { startDate, endDate } = await getStartDateForAggrigations();
  const query = {
    userId: userId,
    deleted: false,
    // betStatus: "completed",
    winner: { $ne: "cancel" },
  };

  const casinoQuery = {
    userObjectId: userId,
    winLostAmount: { $ne: 0 },
  };
  if (isUseDate) {
    console.log("dates : startDate: ", startDate);
    console.log("dates : endDate: ", endDate);

    query.updatedAt = { $gte: startDate, $lte: endDate };
    casinoQuery.updatedAt = { $gte: startDate, $lte: endDate };
  }
  const betsInfo = await mongo.bettingApp.model(mongo.models.betsHistory).find({
    query,
    select: {
      _id: 1,
      betType: 1,
      winner: 1,
      selection: 1,
      betSide: 1,
      matchId: 1,
      userId: 1,
      profit: 1,
      betPlaced: 1,
      exposure: 1,
      fancyYes: 1,
      fancyNo: 1,
      oddsUp: 1,
      subSelection: 1,
    },
  });

  console.log("betsInfo.leg :: ", betsInfo.length);

  let oddsAmount1 = {};

  for await (const bet of betsInfo) {
    if (bet.betType === "odds" || bet.betType === "bookMark") {
      if (bet.winner !== "" && bet.winner !== "cancel") {
        if (bet.selection === bet.winner) {
          // new
          if (bet.betSide === "back") {
            let commi = 0;
            if (bet.betType === "odds") {
              // commi = (bet.profit * commission) / 100;

              if (oddsAmount1[`${bet.matchId}-${bet.userId}`]) {
                oddsAmount1[`${bet.matchId}-${bet.userId}`] += bet.profit;
              } else {
                oddsAmount1[`${bet.matchId}-${bet.userId}`] = bet.profit;
              }
            }
            myPl += bet.profit - commi;
          } else {
            myPl -= bet.profit;

            if (bet.betType === "odds") {
              if (oddsAmount1[`${bet.matchId}-${bet.userId}`]) {
                oddsAmount1[`${bet.matchId}-${bet.userId}`] -= bet.profit;
              } else {
                oddsAmount1[`${bet.matchId}-${bet.userId}`] = -bet.profit;
              }
            }
          }
        } else if (bet.selection !== bet.winner) {
          // new
          if (bet.betSide === "lay") {
            let commi = 0;
            if (bet.betType === "odds") {
              // commi = (bet.betPlaced * commission) / 100;

              if (oddsAmount1[`${bet.matchId}-${bet.userId}`]) {
                oddsAmount1[`${bet.matchId}-${bet.userId}`] += bet.betPlaced;
              } else {
                oddsAmount1[`${bet.matchId}-${bet.userId}`] = bet.betPlaced;
              }
            }
            myPl += bet.betPlaced - commi;
          } else {
            myPl -= bet.exposure;

            if (bet.betType === "odds") {
              if (oddsAmount1[`${bet.matchId}-${bet.userId}`]) {
                oddsAmount1[`${bet.matchId}-${bet.userId}`] -= bet.exposure;
              } else {
                oddsAmount1[`${bet.matchId}-${bet.userId}`] = -bet.exposure;
              }
            }
          }
        }
      }
    } else if (bet.betType === "session") {
      if (bet.winner !== "" && bet.winner !== -2) {
        if (bet.fancyYes === bet.fancyNo) {
          if (bet.betSide === "yes") {
            if (bet.oddsUp <= Number(bet.winner)) {
              myPl += bet.profit;
            } else {
              myPl -= bet.exposure;
            }
          } else {
            if (bet.oddsUp > Number(bet.winner)) {
              myPl += bet.betPlaced;
            } else {
              myPl -= bet.profit;
            }
          }
        } else {
          if (bet.betSide === "yes") {
            if (bet.oddsUp <= Number(bet.winner)) {
              myPl += bet.profit;
            } else {
              myPl -= bet.exposure;
            }
          } else {
            if (bet.oddsUp > Number(bet.winner)) {
              myPl += bet.betPlaced;
            } else {
              myPl -= bet.profit;
            }
          }
        }
      }
    } else if (bet.betType === "premium") {
      if (bet.winner !== "" && !bet.winner.includes("cancel")) {
        if (bet.winner.includes(bet.subSelection)) {
          myPl += bet.profit;
        } else if (!bet.winner.includes(bet.subSelection)) {
          myPl -= bet.exposure;
        }
      }
    }
  }

  let tempCommi = 0;

  // console.log("oddsAmount1 :: ", oddsAmount1);
  Object.keys(oddsAmount1).forEach((key) => {
    if (oddsAmount1[key] > 0) {
      const commi = (oddsAmount1[key] * commission) / 100;
      // console.log("commi :: ", commi);
      myPl -= commi;
      tempCommi += commi;
    }
  });

  // const casinoBetsInfo = await mongo.bettingApp
  //   .model(mongo.models.casinoMatchHistory)
  //   .find({
  //     query: casinoQuery,
  //     select: {
  //       _id: 1,
  //       gameStatus: 1,
  //       winLostAmount: 1,
  //     },
  //   });

  // console.log("casinoBetsInfo.leg :: ", casinoBetsInfo.length);

  // for await (const casinoBet of casinoBetsInfo) {
  //   if (casinoBet.gameStatus === GAME_STATUS.WIN) {
  //     myPl += casinoBet.winLostAmount;
  //   } else if (casinoBet.gameStatus === GAME_STATUS.LOSE) {
  //     myPl -= casinoBet.winLostAmount;
  //   }
  // }

  return total + tempCommi;
}

async function getStartDateForAggrigations() {
  let date = new Date();
  const lastRecord = await mongo.bettingApp
    .model(mongo.models.daysWiseBetTotalAmount)
    .findOne({
      sort: { dayDate: -1 },
      select: {
        dayDate: 1,
      },
    });
  if (lastRecord) {
    date = moment(new Date(lastRecord.dayDate)).tz("Asia/Dhaka");
    // .add(1, "month");
  }

  const { endDate, startDate } = getDateFromStartDate(new Date(date));

  return { endDate, startDate };
}

module.exports = {
  balanceCalculation,
  playerCalculation,
  getOnePlayerMyCumulativeProfitLostWithAggrigation,
  getStartDateForAggrigations,
};
