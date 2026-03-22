const mongo = require("../../config/mongodb");
const {
  getpages,
  getPremium,
  getOddsPages,
  getFastFullOdds,
  getFastBookmakerOdds,
  getFastFancyOdds,
  getFastSportsbookOdds,
  getSportradarPremiumOdds,
} = require("../../config/sportsAPI");
const { EVENTS, SPORT_TYPE } = require("../../constants");
const eventEmitter = require("../../eventEmitter");
const redis = require("../../config/redis");
const config = require("../../config/config");

/**
 * Convert FastOdds /odds/full/:eventId response to legacy t1 format
 * Legacy format: array of { nat, b1, bs1, b2, bs2, b3, bs3, l1, ls1, l2, ls2, l3, ls3, sId, status, sortPriority }
 */
function mapFullOddsToT1(fastData) {
  if (!fastData || !fastData.data || !Array.isArray(fastData.data) || fastData.data.length === 0) {
    return [];
  }
  const market = fastData.data[0];
  const selections = market.selections || [];
  
  return selections.map(sel => {
    const backs = sel.availableToBack || [];
    const lays = sel.availableToLay || [];
    return {
      nat: sel.runnerName || sel.originalRunnerName || "",
      b1: backs[0]?.price || 0,
      bs1: backs[0]?.size || 0,
      b2: backs[1]?.price || 0,
      bs2: backs[1]?.size || 0,
      b3: backs[2]?.price || 0,
      bs3: backs[2]?.size || 0,
      l1: lays[0]?.price || 0,
      ls1: lays[0]?.size || 0,
      l2: lays[1]?.price || 0,
      ls2: lays[1]?.size || 0,
      l3: lays[2]?.price || 0,
      ls3: lays[2]?.size || 0,
      sId: String(sel.selectionId || ""),
      status: sel.status === 1 ? "" : "SUSPEND",
      sortPriority: sel.sortPriority || 0,
    };
  });
}

/**
 * Convert FastOdds /odds/bookmaker/:eventId response to legacy t2 format
 * Legacy format: array of { nat, b1, bs1, l1, ls1, sId, status, sortPriority }
 */
function mapBookmakerToT2(fastData) {
  if (!fastData || !fastData.data || !fastData.data.selections) {
    return [];
  }
  const selectionsObj = fastData.data.selections;
  const result = [];

  for (const key of Object.keys(selectionsObj)) {
    const sel = selectionsObj[key];
    // Parse backOddsInfo and layOddsInfo (JSON string arrays)
    let backOdds = [];
    let layOdds = [];
    try {
      backOdds = JSON.parse(sel.backOddsInfo || "[]");
    } catch (e) { backOdds = []; }
    try {
      layOdds = JSON.parse(sel.layOddsInfo || "[]");
    } catch (e) { layOdds = []; }

    const b1 = backOdds[0] ? parseFloat(backOdds[0]) : 0;
    const l1 = layOdds[0] ? parseFloat(layOdds[0]) : 0;

    result.push({
      nat: sel.runnerName || "",
      b1: b1,
      bs1: 0,
      l1: l1,
      ls1: 0,
      sId: String(sel.selectionId || ""),
      status: sel.status === 1 ? "" : "SUSPEND",
      sortPriority: sel.sort || 0,
    });
  }

  // Sort by sort priority
  result.sort((a, b) => a.sortPriority - b.sortPriority);
  return result;
}

/**
 * Convert FastOdds /odds/fancy/:eventId response to legacy t3 format
 * Legacy format: array of { nat, b1, bs1, l1, ls1, sId, status, sortPriority }
 */
function mapFancyToT3(fastData) {
  if (!fastData || !fastData.data || !Array.isArray(fastData.data)) {
    return [];
  }
  return fastData.data.map(item => ({
    nat: item.marketName || "",
    b1: item.runsYes || 0,
    bs1: item.oddsYes || 0,
    l1: item.runsNo || 0,
    ls1: item.oddsNo || 0,
    sId: String(item.marketId || ""),
    status: [1, 6].includes(item.status) ? "" : "SUSPEND",
    sortPriority: item.sort || 0,
    gstatus: [1, 6].includes(item.status) ? "" : (item.status === 2 ? "Ball Running" : "SUSPEND"),
    min: item.min || 0,
    max: item.max || 0,
  }));
}

/**
 * Convert FastOdds /odds/sportsbook/:eventId response to legacy t4 / premium format
 */
function mapSportsbookToT4(fastData) {
  if (!fastData || !fastData.data) {
    return { data: { t4: [] } };
  }
  // Sportsbook data can be complex; for now wrap it as-is
  return { data: { t4: Array.isArray(fastData.data) ? fastData.data : [] } };
}

async function handler(data, socket) {
  const { eventId, marketId, userId, type, domain } = data;
  const { API_CALL_KEY, DETAIL_PAGE_KEY, DETAIL_PRE_KEY, DETAIL_BOOK_KEY, DETAIL_FANCY_KEY } = config;

  const query = {
    marketId: marketId,
    gameId: eventId,
  };
  let matchInfo = await mongo.bettingApp.model(mongo.models.sports).findOne({
    query,
  });

  if (!matchInfo) {
    console.log(`[getSportsDetails] Match not found in DB for eventId=${eventId}, marketId=${marketId}. Using virtual matchInfo.`);
    // Use sport type from socket payload if available (avoids wrong Redis key prefix for soccer/tennis)
    const detectedType = (data.type && ["cricket", "soccer", "tennis", "esoccer", "basketball"].includes(data.type))
      ? data.type
      : "cricket";
    matchInfo = {
      _id: String(eventId),
      marketId: marketId,
      gameId: eventId,
      type: detectedType,
      name: "",
      openDate: "",
      f: true,
      m1: true,
      p: true,
      pf: false,
      tv: false,
    };
  } else {
    // Legacy support: ensure flags exist for conditional API hits below
    matchInfo.f = (matchInfo.f !== undefined && matchInfo.f !== null) ? matchInfo.f : true;
    matchInfo.m1 = (matchInfo.m1 !== undefined && matchInfo.m1 !== null) ? matchInfo.m1 : true;
    matchInfo.p = (matchInfo.p !== undefined && matchInfo.p !== null) ? matchInfo.p : true;
    matchInfo.pf = matchInfo.pf ?? false;
    matchInfo.tv = (matchInfo.tv !== undefined && matchInfo.tv !== null && matchInfo.tv !== false) 
      ? matchInfo.tv 
      : (matchInfo.tv === 1 || (matchInfo.streamingChannel && matchInfo.streamingChannel !== "0"));
    matchInfo.ematch = matchInfo.ematch ?? 0;
  }

  // set every match in list
  await redis.setValueInKeyWithExpiry(
    `${API_CALL_KEY}:${eventId}:${marketId}:${matchInfo.type}`,
    { date: new Date() }
  );

  // ── Fetch odds data: Try FastOdds first, fall back to legacy ──
  const getPageData = await redis.getValueFromKey(
    `${DETAIL_PAGE_KEY}:${eventId}:${marketId}:${matchInfo.type}`
  );
  const getPreData = await redis.getValueFromKey(
    `${DETAIL_PRE_KEY}:${eventId}:${marketId}:${matchInfo.type}`
  );

  let page;
  let pre;

  if (!getPageData) {
    // Try FastOdds full odds first, fall back to legacy
    try {
      const fastFullOdds = await getFastFullOdds(eventId, marketId);
      if (fastFullOdds && fastFullOdds.data && fastFullOdds.data.length > 0) {
        console.log(`[getSportsDetails] Using FastOdds full odds for eventId=${eventId}`);
        const t1 = mapFullOddsToT1(fastFullOdds);
        page = { data: { t1, t2: [], t3: [] } };
      } else {
        console.log(`[getSportsDetails] FastOdds returned empty, trying legacy for eventId=${eventId}`);
        page = await getOddsPages(eventId, marketId);
        if (page) {
          page.data["t2"] = [];
          page.data["t3"] = [];
        }
      }
    } catch (err) {
      console.error(`[getSportsDetails] FastOdds full odds failed, falling back to legacy:`, err?.message);
      page = await getOddsPages(eventId, marketId);
      if (page) {
        page.data["t2"] = [];
        page.data["t3"] = [];
      }
    }

    // If page is still undefined (both FastOdds and legacy failed), create empty page
    if (!page) {
      page = { data: { t1: [], t2: [], t3: [] } };
    }

    // Fetch bookmaker (t2) from FastOdds — only if m1 is true
    if (matchInfo.m1) {
      try {
        let fastBookmaker = await redis.getValueFromKey(`FAST_BOOK_${eventId}`);
        if (!fastBookmaker) {
          fastBookmaker = await getFastBookmakerOdds(eventId);
          if (fastBookmaker) await redis.setValueInKeyWithExpiry(`FAST_BOOK_${eventId}`, fastBookmaker, 2);
        }
        if (fastBookmaker && fastBookmaker.data && fastBookmaker.data.selections) {
          const t2 = mapBookmakerToT2(fastBookmaker);
          page.data["t2"] = t2;
          console.log(`[getSportsDetails] FastOdds bookmaker loaded: ${t2.length} selections`);
        }
      } catch (err) {
        console.error(`[getSportsDetails] FastOdds bookmaker failed:`, err?.message);
      }
    } else {
      page.data["t2"] = [];
    }

    // Fetch fancy (t3) from FastOdds — only if f is true
    if (matchInfo.f) {
      try {
        let fastFancy = await redis.getValueFromKey(`FAST_FANCY_${eventId}`);
        if (!fastFancy) {
          fastFancy = await getFastFancyOdds(eventId);
          if (fastFancy) await redis.setValueInKeyWithExpiry(`FAST_FANCY_${eventId}`, fastFancy, 2);
        }
        if (fastFancy && fastFancy.data && Array.isArray(fastFancy.data)) {
          const t3 = mapFancyToT3(fastFancy);
          page.data["t3"] = t3;
          console.log(`[getSportsDetails] FastOdds fancy loaded: ${t3.length} markets`);
        }
      } catch (err) {
        console.error(`[getSportsDetails] FastOdds fancy failed:`, err?.message);
      }
    } else {
      page.data["t3"] = [];
    }

    await redis.setValueInKeyWithExpiry(
      `${DETAIL_PAGE_KEY}:${eventId}:${marketId}:${matchInfo.type}`,
      page,
      180
    );
  } else {
    page = getPageData;

    // Strict cleaning based on flags (even if from cache)
    if (!matchInfo.m1) page.data['t2'] = [];
    if (!matchInfo.f) page.data['t3'] = [];

    // Refresh bookmaker from FastOdds for real-time update — only if m1 is true
    if (matchInfo.m1) {
      try {
        let fastBookmaker = await redis.getValueFromKey(`FAST_BOOK_${eventId}`);
        if (!fastBookmaker) {
          fastBookmaker = await getFastBookmakerOdds(eventId);
          if (fastBookmaker) await redis.setValueInKeyWithExpiry(`FAST_BOOK_${eventId}`, fastBookmaker, 2);
        }
        if (fastBookmaker && fastBookmaker.data && fastBookmaker.data.selections) {
          page.data['t2'] = mapBookmakerToT2(fastBookmaker);
        } else {
          const getBookData = await redis.getValueFromKey(
            `${DETAIL_BOOK_KEY}:${eventId}:${marketId}:${matchInfo.type}`
          );
          page.data['t2'] = getBookData ? getBookData.data.t2 : [];
        }
      } catch (err) {
        const getBookData = await redis.getValueFromKey(
          `${DETAIL_BOOK_KEY}:${eventId}:${marketId}:${matchInfo.type}`
        );
        page.data['t2'] = getBookData ? getBookData.data.t2 : [];
      }
    } else {
      page.data['t2'] = [];
    }

    // Fetch fancy from FastOdds for real-time update — only if f is true
    if (matchInfo.f) {
      try {
        let fastFancy = await redis.getValueFromKey(`FAST_FANCY_${eventId}`);
        if (!fastFancy) {
          fastFancy = await getFastFancyOdds(eventId);
          if (fastFancy) await redis.setValueInKeyWithExpiry(`FAST_FANCY_${eventId}`, fastFancy, 2);
        }
        if (fastFancy && fastFancy.data && Array.isArray(fastFancy.data)) {
          page.data['t3'] = mapFancyToT3(fastFancy);
        } else {
          const getFancyData = await redis.getValueFromKey(
            `${DETAIL_FANCY_KEY}:${eventId}:${marketId}:${matchInfo.type}`
          );
          page.data['t3'] = getFancyData ? getFancyData.data.t3 : [];
        }
      } catch (err) {
        const getFancyData = await redis.getValueFromKey(
          `${DETAIL_FANCY_KEY}:${eventId}:${marketId}:${matchInfo.type}`
        );
        page.data['t3'] = getFancyData ? getFancyData.data.t3 : [];
      }
    } else {
      page.data['t3'] = [];
    }

    // Also refresh t1 from FastOdds
    try {
      let fastFullOdds = await redis.getValueFromKey(`FAST_FULL_${eventId}`);
      if (!fastFullOdds) {
        fastFullOdds = await getFastFullOdds(eventId, marketId);
        if (fastFullOdds) await redis.setValueInKeyWithExpiry(`FAST_FULL_${eventId}`, fastFullOdds, 2);
      }
      if (fastFullOdds && fastFullOdds.data && fastFullOdds.data.length > 0) {
        page.data['t1'] = mapFullOddsToT1(fastFullOdds);
      }
    } catch (err) {
      // keep cached t1
    }
  }

  // Premium / sportsbook data
  if (!getPreData) {
    if (matchInfo.p) {
      try {
        pre = await getPremium(eventId, marketId);
      } catch (err) {
        console.error(`[getSportsDetails] getPremium failed:`, err?.message);
      }
    }
    if (!pre) {
      pre = { data: { t4: [] } };
    }
    await redis.setValueInKeyWithExpiry(
      `${DETAIL_PRE_KEY}:${eventId}:${marketId}:${matchInfo.type}`,
      pre,
      180
    );
  } else {
    pre = getPreData;
    // Strict cleaning based on flags
    if (!matchInfo.p) pre.data['t4'] = [];
  }

  if (matchInfo.pf && matchInfo.sportradarApiSiteEventId && matchInfo.sportradarSportId) {
    try {
      const pfOdds = await getSportradarPremiumOdds(matchInfo.sportradarSportId, matchInfo.sportradarApiSiteEventId);
      if (pfOdds && pfOdds.event && pfOdds.event.markets) {
        // Extract matchOdds from the markets object
        const markets = pfOdds.event.markets.matchOdds || [];
        
        // Map Sportradar format to 't4' structure
        const t4Mapped = markets.map((market, idx) => ({
          gType: 'premium',
          id: market.marketId || `m_${idx}`,
          marketId: market.marketId || `m_${idx}`,
          marketName: market.marketName,
          sortPriority: idx,
          status: market.status === "Active" ? "ACTIVE" : "DEACTIVED",
          sub_sb: (market.runners || []).map((runner, rIdx) => ({
            nat: runner.runnerName,
            odds: runner.backPrices?.[0]?.price || 0,
            sId: runner.runnerId || rIdx,
            sortPriority: rIdx,
            betProfit: 0
          }))
        }));

        if (!pre.data) pre.data = { t4: [] };
        // Replace or append to t4. Since pf is special, we'll replace for now.
        pre.data.t4 = t4Mapped;
        pre.data.pf = t4Mapped; // Also keep under pf for frontend detection

        console.log(`[getSportsDetails] Mapped ${t4Mapped.length} Sportradar Premium Fancy markets for event ${eventId}`);
      }
    } catch (err) {
      console.error(`[getSportsDetails] getSportradarPremiumOdds failed:`, err?.message);
    }
  }

  const sendData = {
    en: EVENTS.GET_SPORTS_DETAILS,
    data: {
      page,
      pre,
      matchInfo,
    },
    socket,
  };

  // ─────────────────────────────────────────────────────────────────
  // Advanced Optimization: Delta Updates (Diffing)
  // ─────────────────────────────────────────────────────────────────
  // We hash the exact state payload. If the socket has already received
  // this EXACT snapshot, we skip emitting to save massive bandwidth and 
  // prevent unnecessary React re-renders on the frontend.
  const crypto = require('crypto');
  const currentHash = crypto
    .createHash('md5')
    .update(JSON.stringify(sendData.data))
    .digest('hex');

  if (socket.lastSportsDetailsHash === currentHash) {
    // Data is absolutely identical to the last emit for this specific socket.
    // Suppress the emission.
    return;
  }
  
  // Save the hash for future comparisons
  socket.lastSportsDetailsHash = currentHash;

  eventEmitter.emit(EVENTS.SOCKET, sendData);
}

module.exports = handler;
