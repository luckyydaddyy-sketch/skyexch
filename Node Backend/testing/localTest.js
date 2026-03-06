// const { FANCY_WINNER } = require("../config/config");
// const mongo = require("../config/mongodb");
// // require("../config/redis");
// const redis = require("../config/redis");
// [ 'fancy_winner:33296182:1.229251181' ]

// async function test() {
//   const userId = "";
//   const comm = 2.5;
//   const userInfo = await mongo.bettingApp.model(mongo.models.admins).findOne({
//     query: { _id: mongo.ObjectId(userId) },
//     select: {
//       remaining_balance: 1,
//     },
//   });

//   const commissionAdminInfo = await mongo.bettingApp
//   .model(mongo.models.admins)
//   .findOne({
//     query: { _id: userInfo.admin },
//     select: {
//       balance: 1,
//       agent_level: 1,
//       remaining_balance: 1,
//       _id: 1,
//     },
//   });
  
//   console.log(
//     "manageSatementForSport : commissionAdminInfo ::befor : ",
//     commissionAdminInfo
//   );

//   const updateAdminBalnce = {
//     $inc: {
//       balance: comm,
//       remaining_balance: comm,
//     },
//   };

//   await mongo.bettingApp.model(mongo.models.admins).updateOne({
//     query: {
//       _id:  mongo.ObjectId(commissionAdminInfo._id),
//     },
//     update: {
//       $inc: updateAdminBalnce,
//     },
//   });

//   commissionAdminInfo = await mongo.bettingApp
//       .model(mongo.models.admins)
//       .findOne({
//         query: {
//           _id: commissionAdminInfo._id,
//         },
//         select: {
//           balance: 1,
//           remaining_balance: 1,
//           _id: 1,
//         },
//       });

//     console.log(
//       "manageSatementForSport : commissionAdminInfo ::: ",
//       commissionAdminInfo
//     );
// }
// const moment = require('moment-timezone');
function test() {
    // let date = "2024-09-04 20:00";
    // const dd = "2024-09-04 20:00"
    // const today = moment("2024-09-14 19:00").tz('Asia/Dhaka');
    // console.log("todat :: ", today);
    // console.log("todat :: ", new Date(today));
    
  //   let startDate = today.clone();
  //   let endDate = today.clone();
  //   startDate = today.clone().add(1, 'days');
  //   endDate = today.clone().add(1, 'days');

  //   startDate = startDate.startOf('day'); // 00:00:00
  //   endDate = endDate.endOf('day'); // 23:59:59
  
  //   console.log("dfff", startDate < moment.tz(dd, 'Asia/Dhaka') &&
  // endDate > moment.tz(dd,'Asia/Dhaka'));

  // console.log({ startDate, endDate, nn : moment.tz(dd, 'Asia/Dhaka') });
  const sport =/* 1 */
  {
      "cricket" : {
          "oddsLimit" : {
              "min" : 552,
              "max" : 1,
              "maxProfit" : 11,
              "betDelay" : 0,
              "maxPrice" : 0,
              "isShow" : false
          },
          "bet_odds_limit" : {
              "min" : 50,
              "max" : 50,
              "maxProfit" : 0,
              "betDelay" : 0,
              "maxPrice" : 0,
              "isShow" : false
          },
          "bet_bookmaker_limit" : {
              "min" : 5,
              "max" : 0,
              "maxProfit" : 0,
              "betDelay" : 0,
              "maxPrice" : 0,
              "isShow" : false
          },
          "bet_fancy_limit" : {
              "min" : 10,
              "max" : 0,
              "maxProfit" : 0,
              "betDelay" : 0,
              "maxPrice" : 0,
              "isShow" : false
          },
          "bet_premium_limit" : {
              "min" : 2,
              "max" : 0,
              "maxProfit" : 0,
              "betDelay" : 0,
              "maxPrice" : 0,
              "isShow" : false
          }
      },
      "setAutoSportsAdd" : {
          "cricket" : true,
          "soccer" : false,
          "tennis" : false
      },
      "setAutoSportsResult" : {
          "cricket" : true,
          "soccer" : false,
          "tennis" : false
      },
      "soccer" : {
          "oddsLimit" : {
              "min" : 0,
              "max" : 10,
              "maxProfit" : 0,
              "betDelay" : 0,
              "maxPrice" : 0,
              "isShow" : false
          },
          "bet_odds_limit" : {
              "min" : 0,
              "max" : 0,
              "maxProfit" : 0,
              "betDelay" : 0,
              "maxPrice" : 0,
              "isShow" : false
          },
          "bet_bookmaker_limit" : {
              "min" : 0,
              "max" : 0,
              "maxProfit" : 0,
              "betDelay" : 0,
              "maxPrice" : 0,
              "isShow" : false
          },
          "bet_premium_limit" : {
              "min" : 0,
              "max" : 0,
              "maxProfit" : 0,
              "betDelay" : 0,
              "maxPrice" : 0,
              "isShow" : false
          }
      },
      "tennis" : {
          "oddsLimit" : {
              "min" : 0,
              "max" : 0,
              "maxProfit" : 0,
              "betDelay" : 0,
              "maxPrice" : 0,
              "isShow" : false
          },
          "bet_odds_limit" : {
              "min" : 0,
              "max" : 0,
              "maxProfit" : 0,
              "betDelay" : 0,
              "maxPrice" : 0,
              "isShow" : false
          },
          "bet_bookmaker_limit" : {
              "min" : 0,
              "max" : 0,
              "maxProfit" : 0,
              "betDelay" : 0,
              "maxPrice" : 0,
              "isShow" : false
          },
          "bet_premium_limit" : {
              "min" : 0,
              "max" : 0,
              "maxProfit" : 0,
              "betDelay" : 0,
              "maxPrice" : 0,
              "isShow" : false
          }
      },
      
  }
  let type = "soccer";

  const dd = getMySportLimit(sport[type]);

  console.log("dd :: ", dd);
  dd?.bet_premium_limit ? console.log('hi') : console.log('no')
  
  const newObject = Object.fromEntries(
    Object.entries(sport[type]).map(([key, value]) => [key, { min: value.min, max: value.max }])
  );
  
  console.log("newObject :: ", newObject);
  newObject?.bet_fancy_limit ? console.log('hi') : console.log('no')
  
  
}


const getMySportLimit = (sportLimit) =>{
 return Object.keys(sportLimit).map((key)=>{
    const {min, max} = sportLimit[key]
    return{
      [key] : {
        min, max
      }
    }
  })
}
// setTimeout(()=>{
  test();
// }, 2000)