const mongo = require("../../config/mongodb");
const {
  getpages,
  getPremium,
  getOddsPages,
} = require("../../config/sportsAPI");
const { EVENTS, SPORT_TYPE } = require("../../constants");
const eventEmitter = require("../../eventEmitter");
const redis = require("../../config/redis");
const config = require("../../config/config");

async function handler(data, socket) {
  const { eventId, marketId, userId, type, domain } = data;
  const { API_CALL_KEY, DETAIL_PAGE_KEY, DETAIL_PRE_KEY, DETAIL_BOOK_KEY, DETAIL_FANCY_KEY } = config;
  // let number = 1;
  // if (type === "cricket") {
  //   number = 4;
  // } else if (type === "soccer") {
  //   number = 1;
  // } else if (type === "tennis") {
  //   number = 2;
  // }

  const query = {
    marketId: marketId,
    gameId: eventId,
    // type,
  };
  const matchInfo = await mongo.bettingApp.model(mongo.models.sports).findOne({
    query,
  });

  // if (domain && domain !== "localhost") {
  //   const siteInfo = await mongo.bettingApp
  //     .model(mongo.models.websites)
  //     .findOne({ query: { domain } });

  //   if (siteInfo) {
  //     matchInfo.oddsLimit = siteInfo[matchInfo.type].oddsLimit;
  //     matchInfo.bet_odds_limit = siteInfo[matchInfo.type].bet_odds_limit;
  //     matchInfo.bet_bookmaker_limit =
  //       siteInfo[matchInfo.type].bet_bookmaker_limit;
  //     matchInfo.bet_premium_limit = siteInfo[matchInfo.type].bet_premium_limit;
  //     if (matchInfo.type === SPORT_TYPE.CRICKET)
  //       matchInfo.bet_fancy_limit = siteInfo[matchInfo.type].bet_fancy_limit;
  //   }
  // }

  // set every match in list
  await redis.setValueInKeyWithExpiry(
    `${API_CALL_KEY}:${eventId}:${marketId}:${matchInfo.type}`,
    { date: new Date() }
  );
  // let blockMatchQuery = {};
  // if (typeof type !== "undefined" && type === "player" && userId) {
  //   const playerDetail = await mongo.bettingApp
  //     .model(mongo.models.users)
  //     .findOne({
  //       query: {
  //         _id: mongo.ObjectId(userId),
  //       },
  //       select: {
  //         admin: 1,
  //       },
  //     });
  //   if (playerDetail && matchInfo)
  //     blockMatchQuery = {
  //       userId: playerDetail.admin,
  //       matchId: matchInfo._id,
  //     };
  // } else if (typeof type !== "undefined" && type === "admin" && userId) {
  //   blockMatchQuery = {
  //     userId,
  //     matchId: matchInfo._id,
  //   };
  // }
  // let blockMatchDetail = null;
  // if (type && userId) {
  //   blockMatchDetail = await mongo.bettingApp
  //     .model(mongo.models.blockMatch)
  //     .findOne({
  //       query: blockMatchQuery,
  //     });
  //   // let blockMatchSend = {
  //   //   blockMatchDetail: blockMatchDetail ? blockMatchDetail : {},
  //   // };
  // }

  // const sport = await getSport(number);
  // odd, book, fancy

  const getPageData = await redis.getValueFromKey(
    `${DETAIL_PAGE_KEY}:${eventId}:${marketId}:${matchInfo.type}`
  );
  const getPreData = await redis.getValueFromKey(
    `${DETAIL_PRE_KEY}:${eventId}:${marketId}:${matchInfo.type}`
  );

  let page;
  let pre;
  if (!getPageData) {
    page = await getOddsPages(eventId, marketId);
    page.data["t2"] = [];
    page.data["t3"] = [];
    await redis.setValueInKeyWithExpiry(
      `${DETAIL_PAGE_KEY}:${eventId}:${marketId}:${matchInfo.type}`,
      page,
      180
    );
  } else {
    page = getPageData;
    const getBookData = await redis.getValueFromKey(
      `${DETAIL_BOOK_KEY}:${eventId}:${marketId}:${matchInfo.type}`
    );
    if(getBookData){
      page.data['t2'] = getBookData.data.t2
    }else{
      page.data['t2'] = []
    }

    const getFancyData = await redis.getValueFromKey(
      `${DETAIL_FANCY_KEY}:${eventId}:${marketId}:${matchInfo.type}`
    );
    if(getFancyData){
      page.data['t3'] = getFancyData.data.t3
    }else{
      page.data['t3'] = []
    }
  }

  if (!getPreData) {
    pre = await getPremium(eventId, marketId);
    await redis.setValueInKeyWithExpiry(
      `${DETAIL_PRE_KEY}:${eventId}:${marketId}:${matchInfo.type}`,
      pre,
      180
    );
  } else pre = getPreData;

  const sendData = {
    en: EVENTS.GET_SPORTS_DETAILS,
    data: {
      page,
      pre,
      matchInfo,
      // blockMatchDetail: blockMatchDetail ? blockMatchDetail : {},
    },
    socket,
  };
  eventEmitter.emit(EVENTS.SOCKET, sendData);
}

module.exports = handler;
