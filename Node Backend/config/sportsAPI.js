const axios = require("axios").default;
const config = require("./config");
let chennalData = [];
async function getSport(eventType) {
  try {
    if (config.env !== "test") {
      console.log(
        `=== url :: ${config.SPORTS_API_BASE_URL}:${config.SPORTS_API_PORT}/getmatches/?eventType=${eventType}`
      );
      const sport = await axios.get(
        `${config.SPORTS_API_BASE_URL}:${config.SPORTS_API_PORT}/getmatches/?eventType=${eventType}`
      );

      return sport;
    }
  } catch (error) {
    console.error(" Error On sport API :: ", error);
  }
}
async function getpages(gameId, marketId) {
  try {
    if (config.env !== "test") {

      const page = await axios.get(
        `${config.SPORTS_API_BASE_URL}:${config.SPORTS_API_PORT}/getrunners?eventId=${gameId}&marketId=${marketId}`
      );

      return page.data;  // { data : { t1:[], t2:[], t3:[] } }
    }
  } catch (error) {
    console.error(" Error On page API :: ", error);
  }
}

async function getBookPages(gameId, marketId) {
  try {
    if (config.env !== "test") {
      console.log(
        `=== url :getBookPages: ${config.SPORTS_API_BASE_URL}:${config.SPORTS_API_PORT}/getbook?eventId=${gameId}&marketId=${marketId}`
      );
      const page = await axios.get(
        `${config.SPORTS_API_BASE_URL}:${config.SPORTS_API_PORT}/getbook?eventId=${gameId}&marketId=${marketId}`
      );

      return page.data;  // { data : { t2:[] } }
    }
  } catch (error) {
    console.error(" Error On getBookPages API :: ", error);
  }
}

async function getOddsPages(gameId, marketId) {
  try {
    if (config.env !== "test") {
      console.log(
        `=== url :getOddsPages: ${config.SPORTS_API_BASE_URL}:${config.SPORTS_API_PORT}/getodds?eventId=${gameId}&marketId=${marketId}`
      );
      const page = await axios.get(
        `${config.SPORTS_API_BASE_URL}:${config.SPORTS_API_PORT}/getodds?eventId=${gameId}&marketId=${marketId}`
      );

      return page.data;  // { data : { t1:[] } }
    }
  } catch (error) {
    console.error(" Error On getOddsPages API :: ", error);
  }
}

async function getFancyPages(gameId, marketId) {
  try {
    const SPORTS_API_BASE_URL = "http://13.202.196.245";
    const SPORTS_T3_API_PORT = 5005;
    console.log(
      `=== url :getFancyPages: ${config.SPORTS_API_BASE_URL}:${config.SPORTS_T3_API_PORT}/getfancy?eventId=${gameId}&marketId=${marketId}`
      // `=== url :getFancyPages: ${SPORTS_API_BASE_URL}:${SPORTS_T3_API_PORT}/getfancy?eventId=${gameId}&marketId=${marketId}`
    );
    if (config.env !== "test") {
      const page = await axios.get(
        // `${SPORTS_API_BASE_URL}:${SPORTS_T3_API_PORT}/getfancy?eventId=${gameId}&marketId=${marketId}`
        `${config.SPORTS_API_BASE_URL}:${config.SPORTS_T3_API_PORT}/getfancy?eventId=${gameId}&marketId=${marketId}`
      );

      return page.data;  // { data : { t3:[] } }
    }
  } catch (error) {
    console.error(" Error On getFancyPages API :: ", error);
  }
}

// http://3.6.171.38:3005/getpremiumrunners?eventId=31892016&marketId="1.206185069"
async function getPremium(gameId, marketId) {
  try {
    if (config.env !== "test") {
      const premium = await axios.get(
        `${config.SPORTS_API_BASE_URL}:${config.SPORTS_T4_API_PORT}/getpremiumrunners?eventId=${gameId}&marketId=${marketId}`
      );

      return premium.data;
    }
  } catch (error) {
    console.error(" Error On premium API :: ", error);
  }
}

async function getScoreBoardId(gameId) {
  try {
    const scoreId = await axios.get(
      `https://multiexch.com/VRN/v1/api/scoreid/get?eventid=${gameId}`
      // `${config.SPORTS_API_BASE_URL}:3005/getpremiumrunners?eventId=${gameId}&marketId=${marketId}`
    );

    return scoreId.data;
  } catch (error) {
    console.error(" Error On getScoreBoardId API :: ", error);
  }
}
async function getChannelIds() {
  try {
    const scoreId = await axios.get(
      // `https://ss247.life/api/13eb1ef122caaff1a8398292ef0a4f67f52eb748/streaminfo.php`
      // `https://e765432.xyz/static/69fb31e65e4ed5d6eaebf3b8b0e0e6a715c77cc6/geteventlist.php`
      `https://tv.yourapi.live/queryEventsWithMarket?id=4`
    );

    chennalData = scoreId.data?.data?.events || [];
    // console.log("chennalData :: ", chennalData);
    // getChennelId(Number(33497872))
  } catch (error) {
    console.error(" Error On getChannelIds API :: ", error);
  }
}

async function getChennelId(gameId) {
  // const channelIdData = chennalData.find((value) => value.MatchID === gameId);
  const channelIdData = chennalData.find((value) => value.id === gameId);
  console.log("chennalData :: ", channelIdData);
  return channelIdData;
}

// http://13.202.196.245:5005/
async function getBookPagesWinner(gameId, marketId) {
  try {
    // const SPORTS_API_BASE_URL = "http://13.202.196.245";
    // const SPORTS_API_PORT = 5005;
    if (config.env !== "test") {
      console.log(
        `=== url :getBookPages: ${config.SPORTS_API_BASE_URL}:${config.SPORTS_API_PORT}/getbook?eventId=${gameId}&marketId=${marketId}`
      );
      const page = await axios.get(
        `${config.SPORTS_API_BASE_URL}:${config.SPORTS_API_PORT}/getbook?eventId=${gameId}&marketId=${marketId}`
      );

      return page.data;  // { data : { t2:[] } }
    }
  } catch (error) {
    console.error(" Error On getBookPages API :: ", error);
  }
}

async function getOddsPagesWinner(gameId, marketId) {
  try {
    // const SPORTS_API_BASE_URL = "http://13.202.196.245";
    // const SPORTS_API_PORT = 5005;
    if (config.env !== "test") {
      console.log(
        `=== url :getOddsPages: ${config.SPORTS_API_BASE_URL}:${config.SPORTS_API_PORT}/getodds?eventId=${gameId}&marketId=${marketId}`
      );
      const page = await axios.get(
        `${config.SPORTS_API_BASE_URL}:${config.SPORTS_API_PORT}/getodds?eventId=${gameId}&marketId=${marketId}`
      );

      return page.data;  // { data : { t1:[] } }
    }
  } catch (error) {
    console.error(" Error On getOddsPages API :: ", error);
  }
}

async function getFancyPagesWinner(gameId, marketId) {
  try {
    // const SPORTS_API_BASE_URL = "http://13.202.196.245";
    // const SPORTS_T3_API_PORT = 5005;
    console.log(
      `=== url :getFancyPages: ${config.SPORTS_API_BASE_URL}:${config.SPORTS_T3_API_PORT}/getfancy?eventId=${gameId}&marketId=${marketId}`
    );
    if (config.env !== "test") {
      const page = await axios.get(
        `${config.SPORTS_API_BASE_URL}:${config.SPORTS_T3_API_PORT}/getfancy?eventId=${gameId}&marketId=${marketId}`
      );

      return page.data;  // { data : { t3:[] } }
    }
  } catch (error) {
    console.error(" Error On getFancyPages API :: ", error);
  }
}

// http://3.6.171.38:3005/getpremiumrunners?eventId=31892016&marketId="1.206185069"
async function getPremiumWinner(gameId, marketId) {
  try {
    // const SPORTS_API_BASE_URL = "http://13.202.196.245";
    // const SPORTS_T3_API_PORT = 5005;
    if (config.env !== "test") {
      const premium = await axios.get(
        `${config.SPORTS_API_BASE_URL}:${config.SPORTS_T3_API_PORT}/getpremiumrunners?eventId=${gameId}&marketId=${marketId}`
      );

      return premium.data;
    }
  } catch (error) {
    console.error(" Error On premium API :: ", error);
  }
}

module.exports = {
  getSport,
  getpages,
  getPremium,
  getScoreBoardId,
  getChannelIds,
  getChennelId,
  getOddsPages,
  getBookPages,
  getFancyPages,
  getPremium,
  getOddsPagesWinner,
  getBookPagesWinner,
  getFancyPagesWinner,
  getPremiumWinner,
};
