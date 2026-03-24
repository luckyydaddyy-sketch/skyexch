const config = require("../../config/config");
const redisData = require("../../config/redis");
const { getFastSport, getFastInplayCount } = require("../../config/sportsAPI");
const { EVENTS, SPORT_TYPE } = require("../../constants");
const eventEmitter = require("../../eventEmitter");
const { setFilterDetail } = require("../../utils/comman/sport");

async function handler(data, socket) {
  await redisData.setValueInKeyWithExpiry(`${config.ONLINE_PLAYER}`, {
    date: new Date(),
  });

  // ── Step 1: Try the fast cached inplay count from FastOdds ──
  try {
    const countRes = await getFastInplayCount();
    console.log("=== [FastOdds] inplay/count raw response:", JSON.stringify(countRes));

    // The FastOdds API returns an array of counts: { data: [{eventType: 4, count: 11}, ...] }
    if (arr) {
      const getCount = (id) => {
        const item = arr.find(c => (c.eventType === id || c.eid === id));
        if (!item) return 0;
        // If FastOdds summary: it has .count. If 9Wicket event list: we need to filter and count.
        if (item.count !== undefined) return item.count;
        return arr.filter(ev => (ev.eventType === id || ev.eid === id)).length;
      };
      
      const sendData = {
        en: EVENTS.GET_LIVE_MATCH_COUNT,
        data: {
          cricket: getCount(4),
          soccer:  getCount(1),
          tennis:  getCount(2),
        },
        socket,
      };
      
      if (config.eSoccer)    sendData.data.eSoccer    = getCount(137);
      if (config.basketBall) sendData.data.basketBall = getCount(7522);
      
      sendData.data.all = 
        sendData.data.cricket + sendData.data.soccer + sendData.data.tennis + 
        (sendData.data.eSoccer || 0) + (sendData.data.basketBall || 0);

      console.log("=== [Provider-Aware] liveMatchCount:", sendData.data);
      return eventEmitter.emit(EVENTS.SOCKET, sendData);
    }
  } catch (err) {
    console.error("[FastOdds] getFastInplayCount failed, falling back to per-sport:", err?.message);
  }

  // ── Step 2: Fallback — fetch per-sport event lists and count in-play locally ──
  let cricketRes = await redisData.getValueFromKey(config.SPORTS_LIST_CRICKET);
  if (!cricketRes) cricketRes = await getFastSport(4);
  let soccerRes = await redisData.getValueFromKey(config.SPORTS_LIST_SOCCER);
  if (!soccerRes) soccerRes = await getFastSport(1);
  let tennisRes = await redisData.getValueFromKey(config.SPORTS_LIST_TENNIS);
  if (!tennisRes) tennisRes = await getFastSport(2);

  const cricketData = cricketRes?.data || (Array.isArray(cricketRes) ? cricketRes : []);
  const soccerData  = soccerRes?.data  || (Array.isArray(soccerRes)  ? soccerRes  : []);
  const tennisData  = tennisRes?.data  || (Array.isArray(tennisRes)  ? tennisRes  : []);

  let cricket    = cricketData.length ? await setFilterDetail(cricketData, SPORT_TYPE.CRICKET, "play") : [];
  let soccer     = soccerData.length  ? await setFilterDetail(soccerData,  SPORT_TYPE.SOCCER,  "play") : [];
  let tennis     = tennisData.length  ? await setFilterDetail(tennisData,  SPORT_TYPE.TENNIS,  "play") : [];
  let eSoccer    = [];
  let basketBall = [];

  if (config.eSoccer) {
    const eSoccerRes = await getFastSport(137);
    const eSoccerData = eSoccerRes?.data || (Array.isArray(eSoccerRes) ? eSoccerRes : []);
    eSoccer = eSoccerData.length ? await setFilterDetail(eSoccerData, SPORT_TYPE.ESOCCER, "play") : [];
  }
  if (config.basketBall) {
    const basketBallRes = await getFastSport(7522);
    const basketBallData = basketBallRes?.data || (Array.isArray(basketBallRes) ? basketBallRes : []);
    basketBall = basketBallData.length ? await setFilterDetail(basketBallData, SPORT_TYPE.BASKETBALL, "play") : [];
  }

  const sendData = {
    en: EVENTS.GET_LIVE_MATCH_COUNT,
    data: {
      cricket: cricket.length,
      soccer:  soccer.length,
      tennis:  tennis.length,
    },
    socket,
  };

  if (config.eSoccer)    sendData.data.eSoccer    = eSoccer.length;
  if (config.basketBall) sendData.data.basketBall = basketBall.length;

  eventEmitter.emit(EVENTS.SOCKET, sendData);
}

module.exports = handler;

