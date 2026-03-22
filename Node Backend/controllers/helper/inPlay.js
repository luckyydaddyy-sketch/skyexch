const config = require("../../config/config");

// const redisData = require("../../config/redis");
const { getFastSport, getFastInplayEvents, getFastTodayEvents, getFastTomorrowEvents } = require("../../config/sportsAPI");
const { SPORT_TYPE } = require("../../constants");
const { setDetailNewForInPlayAndCount } = require("../../utils/comman/sport");
const mongo = require("../../config/mongodb");
const { getDate } = require("../../utils/comman/date");

/**
 * Map a single FastOdds event to the legacy format
 */
function mapEventToLegacy(ev) {
  const m = ev.market || (ev.markets && ev.markets.length > 0 ? ev.markets[0] : null);
  const sels = m?.selections || [];

  let first = null, middle = null, last = null;

  if (sels.length === 3) {
    const drawIndex = sels.findIndex(s =>
      s.runnerName && s.runnerName.toLowerCase().includes("draw")
    );
    if (drawIndex !== -1) {
      middle = sels[drawIndex];
      const others = sels.filter((_, i) => i !== drawIndex);
      others.sort((a, b) => (a.sortPriority || 0) - (b.sortPriority || 0));
      first = others[0];
      last = others[1];
    } else {
      const sorted = [...sels].sort((a, b) => (a.sortPriority || 0) - (b.sortPriority || 0));
      first = sorted[0];
      middle = sorted[1];
      last = sorted[2];
    }
  } else if (sels.length === 2) {
    const sorted = [...sels].sort((a, b) => (a.sortPriority || 0) - (b.sortPriority || 0));
    first = sorted[0];
    middle = null;
    last = sorted[1];
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
    m1: (ev.hasBookMakerMarkets || ev.hasInPlayBookMakerMarkets) || false,
    f: (ev.hasFancyBetMarkets || ev.hasInPlayFancyBetMarkets) || false,
    p: ev.hasSportsBookMarkets || false,
    pf: false,
    tv: ev.tv === 1,
    // SRL Detection icon flag
    ematch: eventName.includes('SRL') ? 1 : 0,
    eid: ev.eventType,
    back1: first?.availableToBack?.[0]?.price || 0,
    lay1: first?.availableToLay?.[0]?.price || 0,
    back2: middle?.availableToBack?.[0]?.price || 0,
    lay2: middle?.availableToLay?.[0]?.price || 0,
    back3: last?.availableToBack?.[0]?.price || 0,
    lay3: last?.availableToLay?.[0]?.price || 0,
    sportradarApiSiteEventId: ev.sportradarApiSiteEventId || "",
  };
}

/**
 * Specific mapper for 9Wicket data (includes Premium Fancy & Streaming logic)
 */
function mapNineWicketEventToLegacy(ev) {
  const m = ev.market || (ev.markets && ev.markets.length > 0 ? ev.markets[0] : null);
  const sels = m?.selections || [];

  let first = null, middle = null, last = null;

  if (sels.length === 3) {
    const drawIndex = sels.findIndex(s =>
      s.runnerName && s.runnerName.toLowerCase().includes("draw")
    );
    if (drawIndex !== -1) {
      middle = sels[drawIndex];
      const others = sels.filter((_, i) => i !== drawIndex);
      others.sort((a, b) => (a.sortPriority || 0) - (b.sortPriority || 0));
      first = others[0];
      last = others[1];
    } else {
      const sorted = [...sels].sort((a, b) => (a.sortPriority || 0) - (b.sortPriority || 0));
      first = sorted[0];
      middle = sorted[1];
      last = sorted[2];
    }
  } else if (sels.length === 2) {
    const sorted = [...sels].sort((a, b) => (a.sortPriority || 0) - (b.sortPriority || 0));
    first = sorted[0];
    middle = null;
    last = sorted[1];
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
    m1: (ev.hasBookMakerMarkets || ev.hasInPlayBookMakerMarkets) || false,
    f: (ev.hasFancyBetMarkets || ev.hasInPlayFancyBetMarkets) || false,
    p: (ev.haspremiumMarkets || ev.hasSportsBookMarkets || ev.hasGeniusSportsMarkets) || false,
    pf: (ev.hasGeniusSportsMarkets || ev.hasPremiumFancy || ev.premiumFancy) || false,
    tv: (ev.tv === 1 || (ev.streamingChannel && ev.streamingChannel !== "0" && ev.streamingChannel !== 0)) || false,
    // SRL & Virtual Detection icon flag
    ematch: (eventName.includes('SRL') || eventName.includes('Virtual') || eventName.includes('(V)') || (ev.competitionName && ev.competitionName.includes('Virtual'))) ? 1 : 0,
    eid: ev.eventType,
    back1: first?.availableToBack?.[0]?.price || 0,
    lay1: first?.availableToLay?.[0]?.price || 0,
    back2: middle?.availableToBack?.[0]?.price || 0,
    lay2: middle?.availableToLay?.[0]?.price || 0,
    back3: last?.availableToBack?.[0]?.price || 0,
    lay3: last?.availableToLay?.[0]?.price || 0,
    sportradarApiSiteEventId: ev.sportradarApiSiteEventId || "",
  };
}

/**
 * EVENT_TYPE → SPORT_TYPE mapping
 * FastOdds API: 4 = Cricket, 1 = Soccer, 2 = Tennis, 137 = eSoccer, 7522 = Basketball
 */
const EVENT_TYPE_TO_SPORT = {
  4: SPORT_TYPE.CRICKET,
  1: SPORT_TYPE.SOCCER,
  2: SPORT_TYPE.TENNIS,
  137: SPORT_TYPE.ESOCCER,
  7522: SPORT_TYPE.BASKETBALL,
};

/**
 * Generic function: Fetch events from a Gateway endpoint,
 * map to legacy format, enrich with MongoDB _id if available.
 */
async function getDataFromGateway(fetchFn, filter, userId) {
  const result = {
    cricket: [],
    soccer: [],
    tennis: [],
  };

  try {
    const res = await fetchFn();
    const allEvents = res?.data || [];

    // Determine the mapper right here by checking the data signature
    // or by letting the fetchFn metadata guide us.
    // However, 9Wicket data usually has 'haspremiumMarkets' or 'hasGeniusSportsMarkets'.
    const mapped = allEvents
      .map(ev => {
        if (ev.hasGeniusSportsMarkets !== undefined || ev.haspremiumMarkets !== undefined || ev.streamingChannel !== undefined) {
          return mapNineWicketEventToLegacy(ev);
        }
        return mapEventToLegacy(ev);
      })
      .filter(ev => ev.marketId);

    // Group by sport type using eventType (eid)
    const grouped = {};
    for (const ev of mapped) {
      const sportType = EVENT_TYPE_TO_SPORT[ev.eid];
      if (!sportType) continue;
      if (!grouped[sportType]) grouped[sportType] = [];
      grouped[sportType].push(ev);
    }

    // For each sport, try to find MongoDB records and enrich
    for (const [sportType, events] of Object.entries(grouped)) {
      if (events.length === 0) continue;

      const { startDate } = getDate("yesterday");

      // Batch query MongoDB for all events of this sport
      const matchIdsArray = events.map(ev => ({
        marketId: ev.marketId,
        gameId: ev.gameId,
      }));

      let allMatchInfo = [];
      try {
        allMatchInfo = await mongo.bettingApp
          .model(mongo.models.sports)
          .find({
            query: {
              type: sportType,
              $or: matchIdsArray,
              winner: "",
              status: true,
              "activeStatus.status": true,
              startDate: { $gt: startDate },
            },
            select: {
              _id: 1,
              marketId: 1,
              gameId: 1,
            },
          });
      } catch (err) {
        console.error(`[inPlay] MongoDB query failed for ${sportType}:`, err?.message);
      }

      const enriched = [];
      for (const ev of events) {
        ev.type = sportType;

        // Try to find matching MongoDB record
        const matchIndex = allMatchInfo.findIndex(
          (v) => String(v.marketId) === String(ev.marketId) && String(v.gameId) === String(ev.gameId)
        );

        if (matchIndex !== -1) {
          const matchInfo = allMatchInfo[matchIndex];
          ev._id = matchInfo._id;

          // Check pin status if userId provided
          if (userId && userId !== "") {
            try {
              const pinInfo = await mongo.bettingApp
                .model(mongo.models.pins)
                .findOne({
                  query: { userId, type: sportType, pin: matchInfo._id },
                });
              ev.pin = pinInfo ? true : false;
            } catch {
              ev.pin = false;
            }
          } else {
            ev.pin = false;
          }
        } else {
          // Event NOT in MongoDB — still include it with fallback _id
          ev._id = String(ev.gameId);
          ev.pin = false;
        }

        enriched.push(ev);
      }

      // Assign to result based on sport type
      if (sportType === SPORT_TYPE.CRICKET) result.cricket = enriched;
      else if (sportType === SPORT_TYPE.SOCCER) result.soccer = enriched;
      else if (sportType === SPORT_TYPE.TENNIS) result.tennis = enriched;
      else if (sportType === SPORT_TYPE.ESOCCER) result.eSoccer = enriched;
      else if (sportType === SPORT_TYPE.BASKETBALL) result.basketBall = enriched;
    }
  } catch (error) {
    console.error(`[inPlay] getDataFromFastOdds (${filter}) error:`, error?.message);
  }

  return result;
}

/**
 * Map filter name to the correct FastOdds fetch function
 */
const FILTER_TO_FETCH_FN = {
  play:     getFastInplayEvents,
  today:    getFastTodayEvents,
  tomorrow: getFastTomorrowEvents,
};

async function inPlay({ body }) {
  const { filter, userId } = body;

  const fetchFn = FILTER_TO_FETCH_FN[filter];

  if (fetchFn) {
    // ── Use Gateway endpoint for this filter ──
    const fastResult = await getDataFromGateway(fetchFn, filter, userId);

    const sendObject = {
      msg: "in-Play info!",
      cricket: fastResult.cricket || [],
      soccer: fastResult.soccer || [],
      tennis: fastResult.tennis || [],
    };

    if (config.eSoccer) sendObject.eSoccer = fastResult.eSoccer || [];
    if (config.basketBall) sendObject.basketBall = fastResult.basketBall || [];

    return sendObject;
  }

  // ── Fallback (shouldn't normally reach here) ──
  return {
    msg: "in-Play info!",
    cricket: [],
    soccer: [],
    tennis: [],
  };
}

module.exports = inPlay;
