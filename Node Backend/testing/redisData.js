// const redis = require("redis");
const { FANCY_WINNER_SELECTION } = require("../config/config");
const redis = require("../config/redis");
const multi = require("./secondRedis");
const detailPageKey = "pageDetail";
const detailPremKey = "pagePremDetail";
const apiCallKey = "apiCallKey";
let key = FANCY_WINNER_SELECTION
let value1 = "1st Wkt BAN (2)";
let value2 = "15 Over BAN (2)";
let value3 = "3rd  Wkt BAN (2)";
async function test() {
  console.log("checkKeyIsVailable: 12: ", await redis.checkKeyIsVailable(key, '4th Wkt BAN Run Bhav (2)'));
  // await redis.lPush(key, value1)
  // await redis.lPush(key, value2)
  
  // console.log("checkKeyIsVailable: 12: ", await redis.checkKeyIsVailable(key, value3));
  // console.log("checkKeyIsVailable: 1: ", await redis.checkKeyIsVailable(key, value1));
  // console.log("checkKeyIsVailable: 2: ",await redis.checkKeyIsVailable(key, value2));

  // await redis.lPush(key, value3)
  
  // await redis.lPop(key, value2);

  // console.log("checkKeyIsVailable:w 12: ",await redis.checkKeyIsVailable(key, value3));
  // console.log("checkKeyIsVailable:w 1: ",await redis.checkKeyIsVailable(key, value1));
  // console.log("checkKeyIsVailable:w 2: ",await redis.checkKeyIsVailable(key, value2));


  
  // const getListOfKey = await redis.getListOfKeys(`${apiCallKey}:*`);
  // console.log("getListOfKey :::: ", getListOfKey);
  // await redis.setValueInKeyWithExpiry(`${apiCallKey}:1:2`, {
  //   date: new Date(),
  // });
  // await redis.setValueInKeyWithExpiry(`${apiCallKey}:3:4`, {
  //   date: new Date(),
  // });
  // const getListOfKey1 = await redis.getListOfKeys(`${apiCallKey}:*`);
  // console.log("getListOfKey1 :::: ", getListOfKey1);
  // console.log("getListOfKey ::11:: ", getListOfKey1[0]);
  // setTimeout(() => {
  //   multi.test1();
  // }, 7000);
}

test();
