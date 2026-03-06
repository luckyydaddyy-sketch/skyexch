// const redis = require("redis");
const redis = require("../config/redis");

const detailPageKey = "pageDetail";
const detailPremKey = "pagePremDetail";
const apiCallKey = "apiCallKey";

async function test1() {
  const getListOfKey = await redis.getListOfKeys(`${apiCallKey}:*`);
  console.log("getListOfKey :1::: ", getListOfKey);

  await redis.setValueInKeyWithExpiry(`${apiCallKey}:1:2`, {
    date: new Date(),
  });
  await redis.setValueInKeyWithExpiry(`${apiCallKey}:3:4`, {
    date: new Date(),
  });
  const getListOfKey1 = await redis.getListOfKeys(`${apiCallKey}:*`);
  console.log("getListOfKey1 :1::: ", getListOfKey1);

  console.log("getListOfKey :1:11:: ", getListOfKey1[0]);
}

module.exports = {
  test1,
};
