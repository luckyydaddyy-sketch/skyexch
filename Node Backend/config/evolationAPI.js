const axios = require("axios");
const config = require("./config");
const qs = require("qs");

function getRandomUUID() {
  const str = `xxx-xx-4x-yxxx-xxx-${new Date().getTime()}`;
  return str.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const instance = axios.create({
  baseURL: config.EVOLATION.CASINO_BASE_URL, // "https://kube.artoon.in:32310/",
  // timeout: 1000,
  maxBodyLength: Infinity,
  headers: { "content-type": "application/x-www-form-urlencoded" },
});

const userAuthentication = async (playerDetail) => {
  console.log("userAuthentication ::: playerDetail : ", playerDetail);
  try {
    const requestData = {
      uuid: getRandomUUID(),
      player: {
        id: playerDetail.casinoUserName,
        update: true,
        firstName: playerDetail.firstName,
        lastName: playerDetail.lastName,
        country: "IN",
        nickname: playerDetail.user_name,
        language: "en",
        currency: config.EVOLATION.CURRENCY,
        session: {
          id: getRandomUUID(), // "111ssss3333rrrrr45555",
          // ip: playerDetail.ip,
          ip: "115.246.28.140",
        },
        group: {
          id: getRandomUUID(),
          action: "assign",
        },
      },
      config: {
        game: {
          category: "roulette",
          interface: "view2",
          table: {
            id: "lkcbrbdckjxajdol",
          },
        },
        channel: {
          wrapped: true,
          mobile: false,
        },
      },
    };

    console.log("userAuthentication ::: requestData : ", requestData);
    const member = await instance({
      method: "POST",
      maxBodyLength: Infinity,
      url: `ua/v1/${config.EVOLATION.KEY}/${config.EVOLATION.TOKEN}`,
      headers: {
        "content-type": "application/json",
      },
      // data: JSON.stringify(data),
      // data: qs.stringify(requestData),
      data: requestData,
    });

    console.log("casino : userAuthentication : ", member);
    return member;
  } catch (error) {
    console.log("Error : userAuthentication :: ", error);
    console.log("casino : error : userAuthentication : ", error.data);
  }
};

module.exports = {
  userAuthentication,
};
