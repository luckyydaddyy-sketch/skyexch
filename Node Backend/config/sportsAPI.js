const axios = require("axios").default;
const config = require("./config");
let chennalData = [];

// Local in-memory cache to aggressively prevent rate limits
const memoryCache = {};

async function fetchWithCache(url, ttlMs = 2000) {
  const now = Date.now();
  if (memoryCache[url] && (now - memoryCache[url].timestamp < ttlMs)) {
    return memoryCache[url].data;
  }
  
  if (memoryCache[url] && memoryCache[url].promise) {
    return memoryCache[url].promise;
  }

  // Ensure it exists before setting promise
  memoryCache[url] = memoryCache[url] || {};

  const promise = axios.get(url, { timeout: 3000 }).then(res => {
    memoryCache[url] = { timestamp: Date.now(), data: res.data };
    return res.data;
  }).catch(err => {
    // Keep error cached longer (5s) so we don't spam a dying endpoint that is timing out
    memoryCache[url] = { timestamp: Date.now() - ttlMs + 5000, data: null };
    delete memoryCache[url].promise;
    return null; // Suppress throwing to avoid UnhandledPromiseRejection crashes in background loops
  });

  memoryCache[url].promise = promise;
  return promise;
}
async function getSport(eventType) {
  try {
    if (config.env !== "test") {
      console.log(
        `=== url :: ${config.SPORTS_API_BASE_URL}:${config.SPORTS_API_PORT}/getmatches/?eventType=${eventType}`
      );
      const sport = await axios.get(
        `${config.SPORTS_API_BASE_URL}:${config.SPORTS_API_PORT}/getmatches/?eventType=${eventType}`,
        { timeout: 3000 }
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

      const page = await fetchWithCache(
        `${config.SPORTS_API_BASE_URL}:${config.SPORTS_API_PORT}/getrunners?eventId=${gameId}&marketId=${marketId}`,
        2000
      );

      return page;  // { data : { t1:[], t2:[], t3:[] } }
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
      const page = await fetchWithCache(
        `${config.SPORTS_API_BASE_URL}:${config.SPORTS_API_PORT}/getbook?eventId=${gameId}&marketId=${marketId}`,
        2000
      );

      return page;  // { data : { t2:[] } }
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
      const page = await fetchWithCache(
        `${config.SPORTS_API_BASE_URL}:${config.SPORTS_API_PORT}/getodds?eventId=${gameId}&marketId=${marketId}`,
        2000
      );

      return page;  // { data : { t1:[] } }
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
      const page = await fetchWithCache(
        `${config.SPORTS_API_BASE_URL}:${config.SPORTS_T3_API_PORT}/getfancy?eventId=${gameId}&marketId=${marketId}`,
        2000
      );

      return page;  // { data : { t3:[] } }
    }
  } catch (error) {
    console.error(" Error On getFancyPages API :: ", error);
  }
}

// http://3.6.171.38:3005/getpremiumrunners?eventId=31892016&marketId="1.206185069"
async function getPremium(gameId, marketId) {
  try {
    if (config.env !== "test") {
      const premium = await fetchWithCache(
        `${config.SPORTS_API_BASE_URL}:${config.SPORTS_T4_API_PORT}/getpremiumrunners?eventId=${gameId}&marketId=${marketId}`,
        3000
      );

      return premium;
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

// ─────────────────────────────────────────────────────────────────
//  9W GateKeeper – FastOdds API  (https://app.fastodds.online)
//  Auth: IP Whitelisting only — no token needed in code.
//  Ensure your server IP is whitelisted in the FastOdds admin panel.
// ─────────────────────────────────────────────────────────────────

const FASTODDS_BASE = config.FASTODDS_BASE_URL || "https://app.fastodds.online";

/**
 * GET /api/v1/events/list/:sportId
 * Dynamic event list filtered by sport.
 *   sportId: 4 = Cricket, 1 = Soccer, 2 = Tennis
 */
async function getFastSport(sportId) {
  try {
    console.log(`=== [FastOdds] getFastSport sportId=${sportId}`);
    const res = await axios.get(`${FASTODDS_BASE}/api/v1/events/list/${sportId}`);
    const fastData = res.data?.data || [];

    // Convert new FastOdds structure to legacy structure
    const mapped = fastData.map(ev => {
      const m = ev.market || (ev.markets && ev.markets.length > 0 ? ev.markets[0] : null);
      const sels = m?.selections || [];

      // ── Reorder selections: Draw in middle, teams as 1st & last ──
      let first = null, middle = null, last = null;

      if (sels.length === 3) {
        // Find the Draw selection by matching "draw" in runnerName (case-insensitive)
        const drawIndex = sels.findIndex(s =>
          s.runnerName && s.runnerName.toLowerCase().includes("draw")
        );

        if (drawIndex !== -1) {
          // Draw found → place in middle
          middle = sels[drawIndex];
          // Remaining two selections sorted by sortPriority (lower = first)
          const others = sels.filter((_, i) => i !== drawIndex);
          others.sort((a, b) => (a.sortPriority || 0) - (b.sortPriority || 0));
          first = others[0];
          last = others[1];
        } else {
          // No Draw found → keep original order by sortPriority
          const sorted = [...sels].sort((a, b) => (a.sortPriority || 0) - (b.sortPriority || 0));
          first = sorted[0];
          middle = sorted[1];
          last = sorted[2];
        }
      } else if (sels.length === 2) {
        // 2 selections → 1st and last, middle = 0 0
        const sorted = [...sels].sort((a, b) => (a.sortPriority || 0) - (b.sortPriority || 0));
        first = sorted[0];
        middle = null; // will produce 0 0
        last = sorted[1];
      } else if (sels.length === 1) {
        first = sels[0];
      }

      return {
        gameId: ev.id || ev.eventId,
        marketId: m?.marketId || "",
        eventName: ev.name,
        openDate: ev.openDate,
        inPlay: ev.isInPlay === 1,
        m1: ev.hasBookMakerMarkets || false,
        f: ev.hasFancyBetMarkets || false,
        p: ev.hasSportsBookMarkets || false,
        eid: ev.eventType,
        back1: first?.availableToBack?.[0]?.price || 0,
        lay1: first?.availableToLay?.[0]?.price || 0,
        back2: middle?.availableToBack?.[0]?.price || 0,
        lay2: middle?.availableToLay?.[0]?.price || 0,
        back3: last?.availableToBack?.[0]?.price || 0,
        lay3: last?.availableToLay?.[0]?.price || 0,
      };
    }).filter(ev => ev.marketId); // Only keep events with a valid marketId

    return { data: mapped };
  } catch (error) {
    console.error(" [FastOdds] Error getFastSport :: ", error?.message);
    return { data: [] };
  }
}

/**
 * GET /api/v1/inplay/count
 * Fast cached count of all live in-play sports events.
 */
async function getFastInplayCount() {
  try {
    console.log(`=== [FastOdds] getFastInplayCount`);
    const res = await axios.get(`${FASTODDS_BASE}/api/v1/inplay/count`);
    return res.data;
  } catch (error) {
    console.error(" [FastOdds] Error getFastInplayCount :: ", error?.message);
  }
}

/**
 * GET /api/v1/inplay/events
 * Delta-sync endpoint for live in-play event updates.
 */
async function getFastInplayEvents() {
  try {
    console.log(`=== [FastOdds] getFastInplayEvents`);
    const res = await axios.get(`${FASTODDS_BASE}/api/v1/inplay/events`);
    return res.data;
  } catch (error) {
    console.error(" [FastOdds] Error getFastInplayEvents :: ", error?.message);
  }
}

/**
 * GET /api/v1/today/events
 * Delta-sync endpoint for all events scheduled for today.
 */
async function getFastTodayEvents() {
  try {
    console.log(`=== [FastOdds] getFastTodayEvents`);
    const res = await axios.get(`${FASTODDS_BASE}/api/v1/today/events`);
    return res.data;
  } catch (error) {
    console.error(" [FastOdds] Error getFastTodayEvents :: ", error?.message);
  }
}

/**
 * GET /api/v1/tomorrow/events
 * Delta-sync endpoint for all events scheduled for tomorrow.
 */
async function getFastTomorrowEvents() {
  try {
    console.log(`=== [FastOdds] getFastTomorrowEvents`);
    const res = await axios.get(`${FASTODDS_BASE}/api/v1/tomorrow/events`);
    return res.data;
  } catch (error) {
    console.error(" [FastOdds] Error getFastTomorrowEvents :: ", error?.message);
  }
}

/**
 * GET /api/v1/odds/sportsbook/:eventId
 * Live sportsbook odds for a specific event.
 */
async function getFastSportsbookOdds(eventId) {
  try {
    console.log(`=== [FastOdds] getFastSportsbookOdds eventId=${eventId}`);
    const res = await fetchWithCache(`${FASTODDS_BASE}/api/v1/odds/sportsbook/${eventId}`, 2000);
    return res;
  } catch (error) {
    console.error(" [FastOdds] Error getFastSportsbookOdds :: ", error?.message);
  }
}

/**
 * GET /api/v1/odds/fancy/:eventId
 * Real-time fancy / session odds for a specific event.
 */
async function getFastFancyOdds(eventId) {
  try {
    console.log(`=== [FastOdds] getFastFancyOdds eventId=${eventId}`);
    const res = await fetchWithCache(`${FASTODDS_BASE}/api/v1/odds/fancy/${eventId}`, 2000);
    return res;
  } catch (error) {
    console.error(" [FastOdds] Error getFastFancyOdds :: ", error?.message);
  }
}

/**
 * GET /api/v1/odds/bookmaker/:eventId
 * Live Bookmaker-style odds for a specific event.
 */
async function getFastBookmakerOdds(eventId) {
  try {
    console.log(`=== [FastOdds] getFastBookmakerOdds eventId=${eventId}`);
    const res = await fetchWithCache(`${FASTODDS_BASE}/api/v1/odds/bookmaker/${eventId}`, 2000);
    return res;
  } catch (error) {
    console.error(" [FastOdds] Error getFastBookmakerOdds :: ", error?.message);
  }
}

/**
 * GET /api/v1/odds/full/:eventId
 * Comprehensive Betfair market odds including full depth.
 */
async function getFastFullOdds(eventId) {
  try {
    console.log(`=== [FastOdds] getFastFullOdds eventId=${eventId}`);
    const res = await fetchWithCache(`${FASTODDS_BASE}/api/v1/odds/full/${eventId}`, 4000);
    return res;
  } catch (error) {
    console.error(" [FastOdds] Error getFastFullOdds :: ", error?.message);
  }
}

/**
 * GET /api/v1/event/markets/:sportId/:eventId
 * Retrieve available markets for a specific sport and event.
 */
async function getFastMarkets(sportId, eventId) {
  try {
    console.log(`=== [FastOdds] getFastMarkets sportId=${sportId} eventId=${eventId}`);
    const res = await axios.get(`${FASTODDS_BASE}/api/v1/event/markets/${sportId}/${eventId}`);
    return res.data;
  } catch (error) {
    console.error(" [FastOdds] Error getFastMarkets :: ", error?.message);
  }
}

/**
 * GET /glivestreaming/v1/glive/:matchId
 * SkyExchange live streaming by matchId.
 */
async function getFastGLive(matchId) {
  try {
    console.log(`=== [FastOdds] getFastGLive matchId=${matchId}`);
    const res = await axios.get(`${FASTODDS_BASE}/glivestreaming/v1/glive/${matchId}`);
    return res.data;
  } catch (error) {
    console.error(" [FastOdds] Error getFastGLive :: ", error?.message);
  }
}

/**
 * GET /glivestreaming/v1/event/:eventId
 * SkyExchange real-time event stream by eventId.
 */
async function getFastGLiveByEvent(eventId) {
  try {
    console.log(`=== [FastOdds] getFastGLiveByEvent eventId=${eventId}`);
    const res = await axios.get(`${FASTODDS_BASE}/glivestreaming/v1/event/${eventId}`);
    return res.data;
  } catch (error) {
    console.error(" [FastOdds] Error getFastGLiveByEvent :: ", error?.message);
  }
}

module.exports = {
  // ── Legacy functions (kept for backward compatibility) ──
  getSport,
  getpages,
  getPremium,
  getScoreBoardId,
  getChannelIds,
  getChennelId,
  getOddsPages,
  getBookPages,
  getFancyPages,
  getOddsPagesWinner,
  getBookPagesWinner,
  getFancyPagesWinner,
  getPremiumWinner,

  // ── FastOdds (9W GateKeeper) functions ──
  getFastSport,
  getFastInplayCount,
  getFastInplayEvents,
  getFastTodayEvents,
  getFastTomorrowEvents,
  getFastSportsbookOdds,
  getFastFancyOdds,
  getFastBookmakerOdds,
  getFastFullOdds,
  getFastMarkets,
  getFastGLive,
  getFastGLiveByEvent,
};
