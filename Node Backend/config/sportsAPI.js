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
  console.log("==getScoreBoardId=> Received gameId:", gameId);
  try {
    // 1. Try Legacy API for CKEX Scoreboard
    try {
      console.log(`==getScoreBoardId=> Fetching Legacy ID for: ${gameId}`);
      const scoreIdRes = await axios.get(
        `https://multiexch.com/VRN/v1/api/scoreid/get?eventid=${gameId}`,
        { timeout: 3000 }
      );
      
      if (scoreIdRes.data && scoreIdRes.data.result && scoreIdRes.data.result.length > 0) {
        const score_id = scoreIdRes.data.result[0].score_id;
        console.log(`==getScoreBoardId=> Legacy ID found: ${score_id}`);
        if (score_id) {
          return {
            result: [{
              scoreCardURL: `https://live.ckex.xyz/lmt/preview.html?matchId=${score_id}`
            }]
          };
        }
      } else {
        console.log(`==getScoreBoardId=> No Legacy ID found for: ${gameId}`);
      }
    } catch (e) {
      console.error("CKEX Legacy API Error:", e.message);
    }

    // 2. Fallback to 9tens API Logic
    console.log(`==getScoreBoardId=> Falling back to 9tens for: ${gameId}`);
    const response = await axios.get(
      `https://apiv2.9tens.live:5010/v1/spb/get-scorecard?eventId=${gameId}`,
      { timeout: 3000 }
    );

    if (response.data && response.data.status && response.data.data) {
      console.log(`==getScoreBoardId=> 9tens Success for: ${gameId}`);
      return {
        result: [response.data.data]
      };
    } else {
      console.log(`==getScoreBoardId=> 9tens returned no data for: ${gameId}`);
    }

    return { result: [] };
  } catch (error) {
    console.error(" Error On getScoreBoardId API :: ", error.message);
    return { result: [] };
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
const FASTODDS_STREAM_BASE = "https://fastodds.online/live";

/**
 * G-Live Streaming API (fastodds.online)
 */
async function getGLiveStream(eventId) {
  try {
    console.log(`=== [FastOdds] getGLiveStream eventId=${eventId}`);
    const res = await axios.get(`${FASTODDS_STREAM_BASE}/glivestreaming/v1/event/${eventId}`, { timeout: 5000 });
    return res.data;
  } catch (error) {
    console.error(` [FastOdds] Error getGLiveStream for eventId=${eventId} :: `, error?.message);
    return null;
  }
}

/**
 * GET /api/v1/events/list/:sportId
 * Dynamic event list filtered by sport (FastOdds Adapter).
 */
async function getFastOddsSportAdapter(sportId) {
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
        pf: false,
        tv: ev.tv === 1,
        eid: ev.eventType,
        back1: first?.availableToBack?.[0]?.price || 0,
        lay1: first?.availableToLay?.[0]?.price || 0,
        back2: middle?.availableToBack?.[0]?.price || 0,
        lay2: middle?.availableToLay?.[0]?.price || 0,
        back3: last?.availableToBack?.[0]?.price || 0,
        lay3: last?.availableToLay?.[0]?.price || 0,
        scores: ev.scores || "",
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
async function getFastOddsInplayEventsAdapter() {
  try {
    console.log(`=== [FastOdds] getFastOddsInplayEvents`);
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
async function getFastOddsTodayEventsAdapter() {
  try {
    console.log(`=== [FastOdds] getFastOddsTodayEvents`);
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
async function getFastOddsTomorrowEventsAdapter() {
  try {
    console.log(`=== [FastOdds] getFastOddsTomorrowEvents`);
    const res = await axios.get(`${FASTODDS_BASE}/api/v1/tomorrow/events`);
    return res.data;
  } catch (error) {
    console.error(" [FastOdds] Error getFastTomorrowEvents :: ", error?.message);
  }
}

/**
 * GET /api/v1/odds/sportsbook/:eventId
 * Live sportsbook odds for a specific event (Adapter).
 */
async function getFastSportsbookOddsAdapter(eventId) {
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
 * Real-time fancy / session odds for a specific event (Adapter).
 */
async function getFastFancyOddsAdapter(eventId) {
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
 * Live Bookmaker-style odds for a specific event (Adapter).
 */
async function getFastBookmakerOddsAdapter(eventId) {
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
 * Comprehensive Betfair market odds including full depth (Adapter).
 */
async function getFastFullOddsAdapter(eventId) {
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

// ─────────────────────────────────────────────────────────────────
//  API Gateway Layer & Helper
// ─────────────────────────────────────────────────────────────────

async function getActiveProvider() {
  const redis = require('./redis');
  const DB = require('./mongodb');
  
  let activeProvider = "FASTODDS";
  
  if (redis && redis.getValueFromKey) {
      const cached = await redis.getValueFromKey('ACTIVE_SPORTS_PROVIDER');
      if (cached) activeProvider = cached;
  }

  if (!activeProvider || activeProvider === "null") {
      if (DB.models && DB.models.apiProviders) {
          const dbProvider = await DB.models.apiProviders.findOne();
          if (dbProvider && dbProvider.activeSportsProvider) {
              activeProvider = dbProvider.activeSportsProvider;
              if (redis && redis.setValueInKey) {
                  redis.setValueInKey('ACTIVE_SPORTS_PROVIDER', activeProvider);
              }
          }
      }
  }
  return activeProvider;
}

// Global Match Catalog Gateway
async function getFastSport(sportId) {
  try {
    const activeProvider = await getActiveProvider();

    if (activeProvider === "NINE_WICKET") {
        console.log(`=== [Gateway] Routing to 9WICKET for sportId=${sportId}`);
        return await getNineWicketSportAdapter(sportId);
    }
    
    return await getFastOddsSportAdapter(sportId);
  } catch (e) {
    console.error(" [Gateway] Error in getFastSport Gateway :: ", e);
    return await getFastOddsSportAdapter(sportId);
  }
}

// Odds Gateways
async function getFastFullOdds(eventId, marketId) {
  try {
    const activeProvider = await getActiveProvider();
    if (activeProvider === "NINE_WICKET") {
      return await getNineWicketFullOddsAdapter(eventId, marketId);
    }
    return await getFastFullOddsAdapter(eventId);
  } catch (e) {
    return await getFastFullOddsAdapter(eventId);
  }
}

async function getFastBookmakerOdds(eventId) {
  try {
    const activeProvider = await getActiveProvider();
    if (activeProvider === "NINE_WICKET") {
      return await getNineWicketBookmakerOddsAdapter(eventId);
    }
    return await getFastBookmakerOddsAdapter(eventId);
  } catch (e) {
    return await getFastBookmakerOddsAdapter(eventId);
  }
}

async function getFastFancyOdds(eventId) {
  try {
    const activeProvider = await getActiveProvider();
    if (activeProvider === "NINE_WICKET") {
      return await getNineWicketFancyOddsAdapter(eventId);
    }
    return await getFastFancyOddsAdapter(eventId);
  } catch (e) {
    return await getFastFancyOddsAdapter(eventId);
  }
}

async function getFastSportsbookOdds(eventId) {
  try {
    const activeProvider = await getActiveProvider();
    if (activeProvider === "NINE_WICKET") {
       return { data: [] }; // 9Wicket might not have a separate premium sportsbook endpoint
    }
    return await getFastSportsbookOddsAdapter(eventId);
  } catch (e) {
    return await getFastSportsbookOddsAdapter(eventId);
  }
}

// Time-based Event Gateways
async function getFastInplayEvents() {
  try {
    const activeProvider = await getActiveProvider();
    if (activeProvider === "NINE_WICKET") return await getNineWicketInplayEventsAdapter();
    return await getFastOddsInplayEventsAdapter();
  } catch (e) {
    return await getFastOddsInplayEventsAdapter();
  }
}

async function getFastTodayEvents() {
  try {
    const activeProvider = await getActiveProvider();
    if (activeProvider === "NINE_WICKET") return await getNineWicketTodayEventsAdapter();
    return await getFastOddsTodayEventsAdapter();
  } catch (e) {
    return await getFastOddsTodayEventsAdapter();
  }
}

async function getFastTomorrowEvents() {
  try {
    const activeProvider = await getActiveProvider();
    if (activeProvider === "NINE_WICKET") return await getNineWicketTomorrowEventsAdapter();
    return await getFastOddsTomorrowEventsAdapter();
  } catch (e) {
    return await getFastOddsTomorrowEventsAdapter();
  }
}

// ─────────────────────────────────────────────────────────────────
//  9Wicket API Adapters (Provider 2)
// ─────────────────────────────────────────────────────────────────
const NINE_WICKET_BASE = "https://fastodds.online/live/nw/v1";

async function getNineWicketSportAdapter(sportId) {
  try {
    console.log(`=== [9Wicket] getSport sportId=${sportId}`);
    const res = await axios.get(`${NINE_WICKET_BASE}/sport/${sportId}`);
    // Extract events safely and map them right here for UI caching
    const mapped = mapNineWicketEventsRoot(res.data);
    return { data: mapped };
  } catch (error) {
    console.error(" [9Wicket] Error getNineWicketSportAdapter :: ", error?.message);
    return { data: [] };
  }
}

// Reusable mapper for all 9Wicket Event endpoints
function mapNineWicketEventsRoot(nwData) {
    if (!nwData || !nwData.events) return [];
    
    return nwData.events.map(ev => {
      const m = ev.market || (ev.markets && ev.markets.length > 0 ? ev.markets[0] : null);
      const sels = m?.selections || [];

      let first = null, middle = null, last = null;
      if (sels.length === 3) {
        const drawIndex = sels.findIndex(s => s.runnerName && s.runnerName.toLowerCase().includes("draw"));
        if (drawIndex !== -1) {
          middle = sels[drawIndex];
          const others = sels.filter((_, i) => i !== drawIndex);
          others.sort((a, b) => (a.sortPriority || 0) - (b.sortPriority || 0));
          first = others[0];
          last = others[1];
        } else {
          const sorted = [...sels].sort((a, b) => (a.sortPriority || 0) - (b.sortPriority || 0));
          first = sorted[0]; middle = sorted[1]; last = sorted[2];
        }
      } else if (sels.length === 2) {
        const sorted = [...sels].sort((a, b) => (a.sortPriority || 0) - (b.sortPriority || 0));
        first = sorted[0]; middle = null; last = sorted[1];
      } else if (sels.length === 1) {
        first = sels[0];
      }

      const eventName = ev.name || ev.eventName || "";

      return {
        gameId: ev.id || ev.eventId,
        marketId: m?.marketId || "",
        eventName: eventName,
        openDate: ev.openDate || ev.openDateStr,
        inPlay: ev.isInPlay === 1,
        // 9Wicket specific market booleans
        m1: (ev.hasBookMakerMarkets || ev.hasInPlayBookMakerMarkets) || false,
        f: (ev.hasFancyBetMarkets || ev.hasInPlayFancyBetMarkets) || false,
        p: (ev.hasSportsBookMarkets || ev.haspremiumMarkets || ev.hasGeniusSportsMarkets) || false,
        pf: ev.hasGeniusSportsMarkets || false,
        tv: (ev.tv === 1 || (ev.streamingChannel && ev.streamingChannel !== "0" && ev.streamingChannel !== 0)) || false,
        // SRL & Virtual Detection for E-Cricket icon
        ematch: (eventName.includes('SRL') || eventName.includes('Virtual') || eventName.includes('(V)') || (ev.competitionName && ev.competitionName.includes('Virtual'))) ? 1 : 0,
        eid: ev.eventType,
        back1: first?.availableToBack?.[0]?.price || 0,
        lay1: first?.availableToLay?.[0]?.price || 0,
        back2: middle?.availableToBack?.[0]?.price || 0,
        lay2: middle?.availableToLay?.[0]?.price || 0,
        back3: last?.availableToBack?.[0]?.price || 0,
        lay3: last?.availableToLay?.[0]?.price || 0,
        scores: ev.scores || "",
        sportradarApiSiteEventId: ev.sportradarApiSiteEventId || "",
      };
    }).filter(ev => ev.marketId);
}

/**
 * Get Sportradar Token from FastOdds
 * Caches in Redis for ~2 hours
 */
async function getSportradarToken(forceRefresh = false) {
    const redis = require("./redis");
    const REDIS_KEY = "SPORTRADAR_AUTH_TOKEN";
    try {
        // 1. Check Redis Cache (Skip if forceRefresh)
        if (!forceRefresh) {
            const cachedToken = await redis.getValueFromKey(REDIS_KEY);
            if (cachedToken) {
                console.log("=== [Sportradar] Using cached token:", cachedToken.substring(0, 8) + "...");
                return cachedToken;
            }
        } else {
            console.log("=== [Sportradar] Force refreshing token...");
        }

        // 2. Fetch New Token
        console.log("=== [Sportradar] Fetching new auth token from FastOdds");
        const res = await axios.get(`${FASTODDS_BASE}/api/v1/auth/sportradar/token`);
        if (res.data && res.data.success && res.data.token) {
            const token = res.data.token;
            // Cache for 110 minutes (6600 seconds) to be safe before 2h expiry
            await redis.setValueInKey(REDIS_KEY, token, 6600);
            return token;
        }
    } catch (error) {
        console.error(" [Sportradar] Error fetching token :: ", error?.message);
    }
    return null;
}

/**
 * Get Sportradar Event Details from Fallback API
 */
async function getSportradarEventDetails(gameId, isRetry = false) {
    try {
        const token = await getSportradarToken(isRetry);
        if (!token) return null;

        console.log(`=== [Sportradar] Fetching fallback details for event ${gameId}`);
        const res = await axios.post("https://api.mysportsfeed.io/api/v1/feed/get-sr-event-details", {
            token: token,
            eventId: gameId.toString()
        }, { timeout: 5000 });

        if (res.data && res.data.status === "RS_OK" && res.data.srEventDetails) {
            console.log(`=== [Sportradar] Successfully got details for ${gameId}: ${res.data.srEventDetails.srEventId}`);
            return res.data.srEventDetails;
        } else if (res.data && res.data.errorDescription && res.data.errorDescription.includes("Token") && !isRetry) {
            console.warn(`=== [Sportradar] Token invalid in response, retrying...`);
            return await getSportradarEventDetails(gameId, true);
        } else {
            console.warn(`=== [Sportradar] No details in response for ${gameId}:`, JSON.stringify(res.data));
        }
    } catch (error) {
        console.error(` [Sportradar] Error fetching fallback for event ${gameId} :: `, error?.message);
        if (error.response && error.response.data && error.response.data.errorDescription && error.response.data.errorDescription.includes("Token") && !isRetry) {
            console.warn(`=== [Sportradar] Token invalid in error response, retrying...`);
            return await getSportradarEventDetails(gameId, true);
        }
    }
    return null;
}

/**
 * Provider-Neutral Logic: Get Sportradar IDs (Feed or Fallback)
 */
async function getSportradarDetailsWithFallback(event, typeNumber) {
    // 1. Check if ID exists in the feed
    let srEventId = event.sportradarApiSiteEventId || "";
    let srSportId = "";

    // 2. Fallback to mysportsfeed if missing
    if (!srEventId) {
        const eventId = event.id || event.gameId || event.eventId;
        if (eventId) {
            const fallback = await getSportradarEventDetails(eventId);
            if (fallback) {
                srEventId = fallback.srEventId || "";
                srSportId = fallback.srSportId || "";
            }
        }
    }

    // 3. Static Mapping for srSportId if still missing (User provided values)
    if (!srSportId) {
        if (typeNumber === 4) srSportId = "sr:sport:21"; // Cricket
        else if (typeNumber === 1) srSportId = "sr:sport:1"; // Soccer
        else if (typeNumber === 2) srSportId = "sr:sport:5"; // Tennis
    }

    return { srEventId, srSportId };
}

/**
 * Get Sportradar Premium Fancy Odds
 * Params should be digits only (e.g. 21, 70012046)
 */
async function getSportradarPremiumOdds(sportId, eventId) {
    try {
        if (!sportId || !eventId) return null;

        // Strip non-digit prefixes (e.g. "sr:match:70012046" -> "70012046")
        const sportIdClean = String(sportId).replace(/\D/g, '');
        const eventIdClean = String(eventId).replace(/\D/g, '');

        console.log(`=== [Sportradar] Fetching Premium Fancy Odds: sportId=${sportIdClean} eventId=${eventIdClean}`);

        const res = await fetchWithCache(
            `${FASTODDS_BASE}/api/v1/odds/sportradermarkets/core/${sportIdClean}/${eventIdClean}`,
            2000
        );

        if (res && (res.success || res.status === "RS_OK")) {
            return res;
        }
    } catch (error) {
        console.error(` [Sportradar] Error fetching premium odds for event ${eventId} :: `, error?.message);
    }
    return null;
}

async function getNineWicketInplayEventsAdapter() {
    try {
        console.log(`=== [9Wicket] getInplayEvents`);
        const res = await axios.get(`${NINE_WICKET_BASE}/inplay`);
        // For InPlay, Today, and Tomorrow we MUST NOT map the payload.
        // The inPlay.js helper expects raw data nested inside `res.data.data` to map it properly.
        return { data: res.data?.events || [] };
    } catch (error) {
        console.error(" [9Wicket] Error getInplayEvents :: ", error?.message);
        return { data: [] };
    }
}

async function getNineWicketTodayEventsAdapter() {
    try {
        console.log(`=== [9Wicket] getTodayEvents`);
        const res = await axios.get(`${NINE_WICKET_BASE}/today`);
        return { data: res.data?.events || [] };
    } catch (error) {
        console.error(" [9Wicket] Error getTodayEvents :: ", error?.message);
        return { data: [] };
    }
}

async function getNineWicketTomorrowEventsAdapter() {
    try {
        console.log(`=== [9Wicket] getTomorrowEvents`);
        const res = await axios.get(`${NINE_WICKET_BASE}/tomorrow`);
        return { data: res.data?.events || [] };
    } catch (error) {
        console.error(" [9Wicket] Error getTomorrowEvents :: ", error?.message);
        return { data: [] };
    }
}

async function getNineWicketFullOddsAdapter(eventId, marketId) {
  try {
    console.log(`=== [9Wicket] getFullOdds eventId=${eventId} marketId=${marketId}`);
    const res = await fetchWithCache(`${NINE_WICKET_BASE}/fullMarkets/${eventId}/${marketId}`, 4000);
    // 9Wicket returns { market: {...} } -> We map to FastOdds format { data: [ market ] }
    if (res && res.market) {
       return { data: [res.market] };
    }
    return { data: [] };
  } catch (error) {
    console.error(" [9Wicket] Error getFullOdds :: ", error?.message);
  }
}

async function getNineWicketBookmakerOddsAdapter(eventId) {
  try {
    console.log(`=== [9Wicket] getBookmakerOdds eventId=${eventId}`);
    const res = await fetchWithCache(`${NINE_WICKET_BASE}/bookmaker/${eventId}`, 2000);
    // 9Wicket returns { bookMakerSelection: { selections: [...] } } -> mapped to { data: { selections: [...] } }
    if (res && res.bookMakerSelection) {
      return { data: { selections: res.bookMakerSelection.selections || [] } };
    }
    return { data: { selections: [] } };
  } catch (error) {
    console.error(" [9Wicket] Error getBookmakerOdds :: ", error?.message);
  }
}

async function getNineWicketFancyOddsAdapter(eventId) {
  try {
    console.log(`=== [9Wicket] getFancyOdds eventId=${eventId}`);
    const body = await fetchWithCache(`${NINE_WICKET_BASE}/fancy/${eventId}`, 2000);
    if (body && body.data && body.data.fancyBetMarkets) {
      return { data: body.data.fancyBetMarkets };
    }
    return { data: [] };
  } catch (error) {
    console.error(" [9Wicket] Error getFancyOdds :: ", error?.message);
    return { data: [] };
  }
}

async function getMarketsResult(marketIds) {
  try {
    const axios = require("axios");
    const res = await axios.get(`${FASTODDS_BASE}/api/v1/odds/betfair/marketsresult?marketIds=${marketIds}`);
    return res.data;
  } catch (e) {
    console.error("getMarketsResult : error : ", e.message);
    return [];
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
  getMarketsResult, // Added

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
  getGLiveStream,
  getSportradarToken,
  getSportradarEventDetails,
  getSportradarDetailsWithFallback,
  getSportradarPremiumOdds,
};
