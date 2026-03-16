const joi = require("joi");

const mongo = require("../../../config/mongodb");
const config = require("../../../config/config");
const { getFastInplayEvents, getFastTodayEvents, getFastTomorrowEvents } = require("../../../config/sportsAPI");
const { SPORT_TYPE } = require("../../../constants");
const { getDate } = require("../../../utils/comman/date");

const payload = {
  body: joi.object().keys({
    filter: joi.string().valid("play", "today", "tomorrow").required(),
    userId: joi.string().optional().allow(""),
  }),
};

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
}

const EVENT_TYPE_TO_SPORT = {
  4: SPORT_TYPE.CRICKET,
  1: SPORT_TYPE.SOCCER,
  2: SPORT_TYPE.TENNIS,
  137: SPORT_TYPE.ESOCCER,
  7522: SPORT_TYPE.BASKETBALL,
};

/**
 * Generic: Fetch events from FastOdds endpoint, map & enrich with MongoDB data.
 * Events WITHOUT MongoDB records are still included.
 */
async function getDataFromFastOdds(fetchFn, filter, userId) {
  const result = { cricket: [], soccer: [], tennis: [] };

  try {
    const res = await fetchFn();
    const allEvents = res?.data || [];

    const mapped = allEvents
      .map(mapEventToLegacy)
      .filter(ev => ev.marketId);

    // Group by sport type
    const grouped = {};
    for (const ev of mapped) {
      const sportType = EVENT_TYPE_TO_SPORT[ev.eid];
      if (!sportType) continue;
      if (!grouped[sportType]) grouped[sportType] = [];
      grouped[sportType].push(ev);
    }

    for (const [sportType, events] of Object.entries(grouped)) {
      if (events.length === 0) continue;

      const { startDate } = getDate("yesterday");

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
            select: { _id: 1, marketId: 1, gameId: 1 },
          });
      } catch (err) {
        console.error(`[inPlay/index] MongoDB query failed for ${sportType}:`, err?.message);
      }

      const enriched = [];
      for (const ev of events) {
        ev.type = sportType;

        const matchIndex = allMatchInfo.findIndex(
          (v) => String(v.marketId) === String(ev.marketId) && String(v.gameId) === String(ev.gameId)
        );

        if (matchIndex !== -1) {
          const matchInfo = allMatchInfo[matchIndex];
          ev._id = matchInfo._id;

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
          ev._id = String(ev.gameId);
          ev.pin = false;
        }

        enriched.push(ev);
      }

      if (sportType === SPORT_TYPE.CRICKET) result.cricket = enriched;
      else if (sportType === SPORT_TYPE.SOCCER) result.soccer = enriched;
      else if (sportType === SPORT_TYPE.TENNIS) result.tennis = enriched;
      else if (sportType === SPORT_TYPE.ESOCCER) result.eSoccer = enriched;
      else if (sportType === SPORT_TYPE.BASKETBALL) result.basketBall = enriched;
    }
  } catch (error) {
    console.error(`[inPlay/index] getDataFromFastOdds (${filter}) error:`, error?.message);
  }

  return result;
}

const FILTER_TO_FETCH_FN = {
  play:     getFastInplayEvents,
  today:    getFastTodayEvents,
  tomorrow: getFastTomorrowEvents,
};

async function handler({ body }) {
  const { filter, userId } = body;

  const fetchFn = FILTER_TO_FETCH_FN[filter];

  if (fetchFn) {
    const fastResult = await getDataFromFastOdds(fetchFn, filter, userId);

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

  return {
    msg: "in-Play info!",
    cricket: [],
    soccer: [],
    tennis: [],
  };
}

module.exports = {
  payload,
  handler,
};
