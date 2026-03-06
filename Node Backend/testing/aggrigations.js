// db.getCollection('statements').aggregate(
//     [
//         {
//            $match : {"userId" : ObjectId("65570886b2baef4a15223c29"), matchId : { $ne : null }
//                }
//         },
//         {
//             $group: {
//                 _id : null,
//                 totalAmountWin: {
//                         $sum : "$credit"
//                     },
//                  totalAmountLost: {
//                         $sum : "$debit"
//                     }
//                 }
//         },
//         {
//              $project: {
//                 totalAmount: {
//                         $subtract: ["$totalAmountWin", "$totalAmountLost"]
//                     }
//         }
//         }
//     ]
//     )

// odds: {
//     $sum: {
//       $cond: {
//         if: {
//           $and: [
//             { $ne: ["$winner", ""] },
//             { $ne: ["$winner", "cancel"] },
//             { $eq: ["$betType", "odds"] },
//           ],
//         },
//         then: {
//           $switch: {
//             branches: [
//               {
//                 case: { $eq: ["$betSide", "back"] },
//                 then: {
//                   $cond: {
//                     if: { $eq: ["$selection", "$winner"] },
//                     then: "$profit",
//                     else: { $subtract: [0, "$exposure"] },
//                   },
//                 },
//               },
//               {
//                 case: { $eq: ["$betSide", "lay"] },
//                 then: {
//                   $cond: {
//                     if: { $ne: ["$selection", "$winner"] },
//                     then: "$betPlaced",
//                     else: { $subtract: [0, "$exposure"] },
//                   },
//                 },
//               },
//             ],
//             default: 0,
//           },
//         },
//         else: 0,
//       },
//     },
//   },
//   bookMark: {
//     $sum: {
//       $cond: {
//         if: {
//           $and: [
//             { $ne: ["$winner", ""] },
//             { $ne: ["$winner", "cancel"] },
//             { $eq: ["$betType", "bookMark"] },
//           ],
//         },
//         then: {
//           $switch: {
//             branches: [
//               {
//                 case: { $eq: ["$betSide", "back"] },
//                 then: {
//                   $cond: {
//                     if: { $eq: ["$selection", "$winner"] },
//                     then: "$profit",
//                     else: { $subtract: [0, "$exposure"] },
//                   },
//                 },
//               },
//               {
//                 case: { $eq: ["$betSide", "lay"] },
//                 then: {
//                   $cond: {
//                     if: { $ne: ["$selection", "$winner"] },
//                     then: "$betPlaced",
//                     else: { $subtract: [0, "$exposure"] },
//                   },
//                 },
//               },
//             ],
//             default: 0,
//           },
//         },
//         else: 0,
//       },
//     },
//   },
//   Session: {
//     $sum: {
//       $cond: {
//         if: {
//           $and: [
//             { $ne: ["$winner", ""] },
//             { $ne: ["$winner", -2] },
//             { $eq: ["$betType", "session"] },
//           ],
//         },
//         then: {
//           $switch: {
//             branches: [
//               {
//                 case: { $eq: ["$betSide", "yes"] },
//                 then: {
//                   $cond: {
//                     if: { $lte: ["$oddsUp", "$winner"] },
//                     then: "$profit",
//                     else: { $subtract: [0, "$exposure"] },
//                   },
//                 },
//               },
//               {
//                 case: { $eq: ["$betSide", "no"] },
//                 then: {
//                   $cond: {
//                     if: { $gt: ["$oddsUp", "$winner"] },
//                     then: "$betPlaced",
//                     else: { $subtract: [0, "$profit"] },
//                   },
//                 },
//               },
//             ],
//             default: 0,
//           },
//         },
//         else: 0,
//       },
//     },
//   },
//   Premium: {
//     $sum: {
//       $cond: {
//         if: {
//           $and: [
//             { $ne: ["$winner", ""] },
//             { $ne: ["$winner", "cancel"] },
//             { $eq: ["$betType", "premium"] },
//           ],
//         },
//         then: {
//           $cond: {
//             if: { $eq: ["$subSelection", "$winner"] },
//             then: "$profit",
//             else: { $subtract: [0, "$exposure"] },
//           },
//         },
//         else: 0,
//       },
//     },
//   },
