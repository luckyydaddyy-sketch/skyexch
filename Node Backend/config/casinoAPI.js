const axios = require("axios");
const config = require("./config");
const qs = require("qs");

const instance = axios.create({
  baseURL: config.CASINO_BASE_URL, // "https://kube.artoon.in:32310/",
  // timeout: 1000,
  maxBodyLength: Infinity,
  headers: { "content-type": "application/x-www-form-urlencoded" },
});
// console.log("CASINO_LIMITS :: ",typeof config.CASINO_LIMITS);
// console.log("CASINO_LIMITS :: ",config.CASINO_LIMITS);
// console.log("CASINO_LIMITS :: ",JSON.stringify(config.CASINO_LIMITS));
// console.log("CASINO_LIMITS :: ",JSON.parse(config.CASINO_LIMITS));
// const ff = JSON.parse(config.CASINO_LIMITS);
// console.log("CASINO_LIMITS :: ",typeof config.CASINO_LIMITS);
// console.log("config.CASINO_LIMITS limit : ", ff.SEXYBCRT);
let betLimitList = {
  SEXYBCRT: { LIVE: { limitId: [270101, 270102, 270112] } },
  // SEXYBCRT: { LIVE: { limitId: [123801, 123802, 123803, 123804, 123805, 123806] } },
  // BG: { LIVE: { limitId: ["H1", "H2", "Y2"] } },
  // VENUS: { LIVE: { limitId: [260101, 260102] } },
  // HOTROAD: {LIVE :{ limitId: [100006] } },
  // PP: { LIVE: { limitId: ["G1"] } },
  // SV388: {
  //   LIVE: {
  //     maxbet: 10000,
  //     minbet: 1,
  //     mindraw: 1,
  //     maxdraw: 1000,
  //     matchlimit: 10000,
  //   },
  // },
  // HORSEBOOK: {
  //   LIVE: {
  //     minorMinbet: 5,
  //     minorMaxbet: 500,
  //     minorMaxBetSumPerHorse: 1500,
  //     minbet: 5,
  //     maxbet: 1500,
  //     maxBetSumPerHorse: 3000,
  //   },
  // },
};
// , "HOTROAD": {"LIVE" :{ "limitId": [100006, 100007] } }, HORSEBOOK: {"LIVE": {"minorMinbet": 5,"minorMaxbet": 2500,"minorMaxBetSumPerHorse": 2500,"minbet": 5,"maxbet": 3000,"maxBetSumPerHorse": 3000,},}
if (config.CASINO_LIMITS) {
  betLimitList = JSON.parse(config.CASINO_LIMITS);
}
const platFormWhoNotRequireBetLimit = ["EVOLUTION", "PP", "SPRIBE"];

async function createMember(data) {
  try {
    const { user_name } = data;
    // const ddfdefdf = `${config.CASINO_API_BASE_URL}/wallet/createMember`

    // const betLimitList = {
    //   SEXYBCRT: { LIVE: { limitId: [260101, 260102, 260112, 260118] } },
    //   SV388: {
    //     LIVE: {
    //       maxbet: 10000,
    //       minbet: 1,
    //       mindraw: 1,
    //       matchlimit: 10000,
    //       maxdraw: 1000,
    //     },
    //   },
    //   HORSEBOOK: {
    //     LIVE: {
    //       minbet: 5,
    //       maxbet: 1500,
    //       maxBetSumPerHorse: 3000,
    //       minorMinbet: 5,
    //       minorMaxbet: 500,
    //       minorMaxBetSumPerHorse: 1500,
    //     },
    //   },
    // };

    // dume data
    let createMemberData = {
      cert: config.CASINO_CERT,
      agentId: config.CASINO_USERID,
      userId: user_name,
      currency: config.CASINO_CURRENCY,
      betLimit: JSON.stringify(betLimitList), //betLimitList, // JSON.stringify(betLimitList),
      // betLimit: encodeURIComponent(JSON.stringify(betLimitList)), // JSON.stringify(betLimitList),
      language: "en",
      userName: user_name,
    };

    console.log(
      "casino : createMember ::: createMemberData : ",
      createMemberData
    );

    const member = await instance({
      method: "POST",
      maxBodyLength: Infinity,
      url: "/wallet/createMember",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
      // data: JSON.stringify(data),
      data: qs.stringify(createMemberData),
    });

    console.log("casino : createMember : ", member.data);
    return member.data;
  } catch (error) {
    console.error("Error On createMember API :: ", error);
  }
}
async function login(data) {
  try {
    const { id, user_name, isMobileLogin, domain, casinoDetail } = data;
    console.log("casino login : data :: ", data);
    const externalURL = `https://${domain}`;
    console.log("casino login : externalURL :: ", externalURL);
    const gameForbidden = {};
    let gameType = "";
    let platform = "";
    let gameCode = "";
    if (id !== "loginType") {
      gameForbidden[`${casinoDetail.platform}`] = {};
      gameForbidden[`${casinoDetail.platform}`][`${casinoDetail.gameType}`] = [
        casinoDetail.gameCode === "" ? "ALL" : casinoDetail.gameCode,
      ];

      if (casinoDetail.platform === "SEXYBCRT") {
        // gameForbidden[`${casinoDetail.platform}`][
        //   `${casinoDetail.gameType}`
        // ].push("MX-LIVE-002");
        // gameForbidden[`${casinoDetail.platform}`][
        //   `${casinoDetail.gameType}`
        // ].push("MX-LIVE-003");
        // gameForbidden[`${casinoDetail.platform}`][
        //   `${casinoDetail.gameType}`
        // ].push("MX-LIVE-006");
        // gameForbidden[`${casinoDetail.platform}`][
        //   `${casinoDetail.gameType}`
        // ].push("MX-LIVE-009");
        // gameForbidden[`${casinoDetail.platform}`][
        //   `${casinoDetail.gameType}`
        // ].push("MX-LIVE-010");
        // gameForbidden[`${casinoDetail.platform}`][
        //   `${casinoDetail.gameType}`
        // ].push("MX-LIVE-011");
        // gameForbidden[`${casinoDetail.platform}`][
        //   `${casinoDetail.gameType}`
        // ].push("MX-LIVE-012");
        // gameForbidden[`${casinoDetail.platform}`][
        //   `${casinoDetail.gameType}`
        // ].push("MX-LIVE-014");
        // gameForbidden[`${casinoDetail.platform}`][
        //   `${casinoDetail.gameType}`
        // ].push("MX-LIVE-015");
        // gameForbidden[`${casinoDetail.platform}`][
        //   `${casinoDetail.gameType}`
        // ].push("MX-LIVE-016");
      }

      gameType = casinoDetail.gameType.trim();
      platform = casinoDetail.platform.trim();
    }
    // gameForbidden[`JDB`] = {};
    // gameForbidden[`JDB`][`FH`] = ["ALL"];

    // gameForbidden[`${platform}`][`${gameType}`] = [gameCode];

    console.log("casino login : gameForbidden :: ", gameForbidden);

    // const betLimitList = {
    //   SEXYBCRT: { LIVE: { limitId: [260101, 260102, 260112, 260118] } },
    //   SV388: {
    //     LIVE: {
    //       maxbet: 10000,
    //       minbet: 1,
    //       mindraw: 1,
    //       matchlimit: 10000,
    //       maxdraw: 1000,
    //     },
    //   },
    //   HORSEBOOK: {
    //     LIVE: {
    //       minbet: 5,
    //       maxbet: 1500,
    //       maxBetSumPerHorse: 3000,
    //       minorMinbet: 5,
    //       minorMaxbet: 500,
    //       minorMaxBetSumPerHorse: 1500,
    //     },
    //   },
    // };

    // config.SERVER_PREFIX
    // dume data
    let loginData = {
      cert: config.CASINO_CERT,
      agentId: config.CASINO_USERID,
      userId: user_name,
      isMobileLogin: isMobileLogin,
      externalURL,
      gameForbidden: JSON.stringify(gameForbidden),
      // gameType: "SLOT",
      // platform: "RT",
      gameType,
      platform,
      language: "en",
      betLimit: platFormWhoNotRequireBetLimit.includes(platform)
        ? ""
        : JSON.stringify(betLimitList),
      autoBetMode: "1",
    };

    console.log("casino : login ::: loginData : ", loginData);
    const member = await instance({
      method: "POST",
      url: "/wallet/login",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      data: qs.stringify(loginData),
    });

    console.log("casino : login : ", member.data);
    return member.data;
  } catch (error) {
    console.error("Error On login API :: ", error);
  }
}

async function doLoginAndLaunchGame(data) {
  try {
    const { user_name, isMobileLogin, domain, gameType, platform, gameCode } =
      data;
    const externalURL = `https://${domain}`;

    // const betLimitList = {
    //   SEXYBCRT: { LIVE: { limitId: [260101, 260102, 260112, 260118] } },
    //   SV388: {
    //     LIVE: {
    //       maxbet: 10000,
    //       minbet: 1,
    //       mindraw: 1,
    //       matchlimit: 10000,
    //       maxdraw: 1000,
    //     },
    //   },
    //   HORSEBOOK: {
    //     LIVE: {
    //       minbet: 5,
    //       maxbet: 1500,
    //       maxBetSumPerHorse: 3000,
    //       minorMinbet: 5,
    //       minorMaxbet: 500,
    //       minorMaxBetSumPerHorse: 1500,
    //     },
    //   },
    // };

    // dume data
    // let gg = {
    //   cert: "CCGH308iLalAafVOdgDD",
    //   agentId: "swapitest",
    //   userId: "testusercny",
    //   gameCode: "MX-LIVE-002",
    //   gameType: "LIVE",
    //   platform: "SEXYBCRT",
    //   isMobileLogin: "false",
    //   externalURL: "https%3A%2F%2Fwww.google.com.tw%2F",
    //   language: "en",
    //   hall: "SEXY",
    //   betLimit:
    //     "%7B%22SEXYBCRT%22%3A%7B%22LIVE%22%3A%7B%22limitId%22%3A%5B280304%2C280306%5D%7D%7D%7D",
    //   autoBetMode: "1",
    //   enableTable: "true",
    //   tid: "1",
    // };

    // CASINO_LIMITS = { "SEXYBCRT": { "LIVE": { "limitId": [120119, 120101, 120102] } }, "HOTROAD": {"LIVE": { "limitId": [100006, 100007] } }, "HORSEBOOK": {"LIVE": {"minorMinbet": 5,"minorMaxbet": 2500,"minorMaxBetSumPerHorse": 2500,"minbet": 5,"maxbet": 3000,"maxBetSumPerHorse": 3000}}}
    // CASINO_LIMITS = {
    //   SEXYBCRT: { LIVE: { limitId: [120119, 120101, 120102] } },
    // };

    const betLimit = await getLimit(platform.trim(), betLimitList, gameType.trim())
    let loginData = {
      cert: config.CASINO_CERT,
      agentId: config.CASINO_USERID,
      userId: user_name,
      isMobileLogin: isMobileLogin,
      externalURL,
      // gameForbidden: JSON.stringify(gameForbidden),
      gameCode,
      gameType: gameType.trim(),
      platform: platform.trim(),
      language: "en",
      betLimit,
      // betLimit:
      //   gameType === "LIVE" && !platFormWhoNotRequireBetLimit.includes(platform)
      //     ? JSON.stringify(betLimitList)
      //     : "",

      // autoBetMode: "1",
      // enableTable: "true",
      // tid: "1",
      // hall: "SEXY",
      // hall: platform,
    };

    console.log("casino : doLoginAndLaunchGame : data : ", loginData);
    const member = await instance({
      method: "POST",
      url: "/wallet/doLoginAndLaunchGame",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      data: qs.stringify(loginData),
    });

    console.log("casino : doLoginAndLaunchGame : data : ", member.data);
    return member.data;
  } catch (error) {
    console.error("Error On doLoginAndLaunchGame API :: ", error);
  }
}
async function updateBetLimit(data) {
  try {
    // dume data

    let gg = {
      cert: "CCGH308iLalAafVOdgDD",
      agentId: "swapitest",
      userId: "testusercny",
      betLimit:
        "%7B%22SEXYBCRT%22%3A%7B%22LIVE%22%3A%7B%22limitId%22%3A%5B280302%2C280306%2C280308%5D%7D%7D%2C%22VENUS%22%3A%7B%22LIVE%22%3A%7B%22limitId%22%3A%5B280302%2C280306%2C280308%5D%7D%7D%7D",
    };

    const member = await instance({
      method: "POST",
      url: "/wallet/updateBetLimit",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      data: JSON.stringify(data),
    });

    console.log("updateBetLimit : data :: ", member.data);
    return member;
  } catch (error) {
    console.error("Error On updateBetLimit API :: ", error);
  }
}

async function logout(data) {
  try {
    // dume data
    let gg = {
      cert: "CCGH308iLalAafVOdgDD",
      agentId: "swapitest",
      userIds: "testusercny%2Ctestusercny1",
    };

    const member = await instance({
      method: "POST",
      url: "/wallet/logout",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      data: JSON.stringify(data),
    });

    console.log("logout : data :: ", member.data);
    return member;
  } catch (error) {
    console.error("Error On logout API :: ", error);
  }
}

async function getTransactionHistoryResult(data) {
  try {
    // dume data
    let gg = {
      cert: "CCGH308iLalAafVOdgDD",
      agentId: "swapitest",
      userId: "testusercny",
      platformTxId: "BAC-999999999",
      platform: "SEXYBCRT",
      roundId: "Mexico-02-GA999999999",
    };

    const member = await instance({
      method: "POST",
      url: "/wallet/getTransactionHistoryResult",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      data: JSON.stringify(data),
    });

    console.log("getTransactionHistoryResult : data :: ", member.data);
    return member;
  } catch (error) {
    console.error("Error On getTransactionHistoryResult API :: ", error);
  }
}

async function getSummaryByBetTimeHour(data) {
  try {
    // dume data
    let gg = {
      cert: "CCGH308iLalAafVOdgDD",
      agentId: "swapitest",
      startTime: "2021-03-24T16%2B08%3A00",
      endTime: "2021-03-24T17%2B08%3A00",
      platform: "SEXYBCRT",
      gameType: "LIVE",
      gameCode: "MX-LIVE-001",
    };

    const member = await instance({
      method: "POST",
      url: "/wallet/getSummaryByBetTimeHour",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      data: JSON.stringify(data),
    });

    console.log("getSummaryByBetTimeHour : data :: ", member.data);
    return member;
  } catch (error) {
    console.error("Error On getSummaryByBetTimeHour API :: ", error);
  }
}

async function resubmitCancelbetNotification(data) {
  try {
    // dume data
    let gg = {
      cert: "CCGH308iLalAafVOdgDD",
      agentId: "swapitest",
      platform: "SEXYBCRT",
      platformTxIds: "BAC-116090421",
    };

    const member = await instance({
      method: "POST",
      url: "/wallet/resubmitCancelbetNotification",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      data: JSON.stringify(data),
    });

    console.log("resubmitCancelbetNotification : data :: ", member.data);
    return member;
  } catch (error) {
    console.error("Error On resubmitCancelbetNotification API :: ", error);
  }
}

async function getTransactionHistoryResultAll(data) {
  try {
    // dume data
    let gg = {
      cert: "CCGH308iLalAafVOdgDD",
      agentId: "swapitest",
      platform: "HORSEBOOK",
      gameType: "LIVE",
    };

    const member = await instance({
      method: "POST",
      url: "/wallet/getTransactionHistoryResultAll",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      data: JSON.stringify(data),
    });

    console.log("getTransactionHistoryResultAll : data :: ", member.data);
    return member;
  } catch (error) {
    console.error("Error On getTransactionHistoryResultAll API :: ", error);
  }
}

async function checkStatus(data) {
  try {
    // dume data
    let gg = {
      cert: "CCGH308iLalAafVOdgDD",
      agentId: "swapitest",
      platform: "PG",
      gameType: "Slot",
      gameCode: "PG-SLOT-009",
    };

    const member = await instance({
      method: "POST",
      url: "/wallet/checkStatus",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      data: JSON.stringify(data),
    });

    console.log("checkStatus : data :: ", member.data);
    return member;
  } catch (error) {
    console.error("Error On checkStatus API :: ", error);
  }
}

async function getPromotionSummary(data) {
  try {
    // dume data
    let gg = {
      cert: "CCGH308iLalAafVOdgDD",
      agentId: "swapitest",
      startTimeHr: "2021-03-23T12%2B08%3A00",
      endTimeHr: "2021-03-23T13%2B08%3A00",
      currency: "THB",
      platform: "SEXYBCRT'",
    };

    const member = await instance({
      method: "POST",
      url: "/wallet/getPromotionSummary",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      data: JSON.stringify(data),
    });

    console.log("getPromotionSummary : data :: ", member.data);
    return member;
  } catch (error) {
    console.error("Error On getPromotionSummary API :: ", error);
  }
}

async function updatePlayerStatus(data) {
  try {
    // dume data
    let gg = {
      cert: "CCGH308iLalAafVOdgDD",
      agentId: "swapitest",
      userId: "testusercny",
      status: "active",
    };

    const member = await instance({
      method: "POST",
      url: "/wallet/updatePlayerStatus",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      data: JSON.stringify(data),
    });

    console.log("updatePlayerStatus : data :: ", member.data);
    return member;
  } catch (error) {
    console.error("Error On updatePlayerStatus API :: ", error);
  }
}

async function queryBetLimit(data) {
  try {
    // dume data
    let gg = {
      cert: "CCGH308iLalAafVOdgDD",
      agentId: "swapitest",
      userId: "testusercny",
      platform: "SEXYBCRT",
      gameType: "LIVE",
    };

    const member = await instance({
      method: "POST",
      url: "/wallet/queryBetLimit",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      data: JSON.stringify(data),
    });

    console.log("queryBetLimit : data :: ", member.data);
    return member;
  } catch (error) {
    console.error("Error On queryBetLimit API :: ", error);
  }
}

async function getLimit(platform, limitData, gameType) {
  const platformArray = Object.keys(limitData).map((keys) => keys);
  if (platformArray.includes(platform) && gameType === "LIVE" && !platFormWhoNotRequireBetLimit.includes(platform)) {
    const pLimitTemp = limitData[platform];
    const newObject = {};

    newObject[`${platform}`] = pLimitTemp;

    return JSON.stringify(newObject);
  }
  return "";
}

module.exports = {
  createMember,
  login,
  doLoginAndLaunchGame,
  updateBetLimit,
  logout,
  getTransactionHistoryResult,
  getSummaryByBetTimeHour,
  resubmitCancelbetNotification,
  getTransactionHistoryResultAll,
  checkStatus,
  getPromotionSummary,
  updatePlayerStatus,
  queryBetLimit,
};
