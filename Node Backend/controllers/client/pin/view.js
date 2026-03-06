const joi = require("joi");
const mongo = require("../../../config/mongodb");
const redis = require("../../../config/redis");
const config = require("../../../config/config");
const { getpages, getOddsPages } = require("../../../config/sportsAPI");
const { SPORT_TYPE } = require("../../../constants");
const payload = {
  body: joi.object().keys({
    type: joi
      .string()
      .valid(
        SPORT_TYPE.CRICKET,
        SPORT_TYPE.SOCCER,
        SPORT_TYPE.TENNIS,
        SPORT_TYPE.ESOCCER,
        SPORT_TYPE.BASKETBALL
      )
      .required(),
  }),
};

async function handler({ body, user }) {
  const { type } = body;
  const { userId } = user;

  const { API_CALL_KEY, DETAIL_PAGE_KEY, DETAIL_PRE_KEY } = config;
  const list = await mongo.bettingApp.model(mongo.models.pins).find({
    query: {
      userId,
      type,
    },
    populate: {
      path: "pin",
      model: await mongo.bettingApp.model(mongo.models.sports),
      select: ["name", "gameId", "marketId", "openDate", "startDate", "type"],
    },
  });
  console.log("list :: ", JSON.stringify(list));
  // for await (const listData of list) {
  if (list.length)
    for await (const match of list[0].pin) {
      let page;
      const getPageData = await redis.getValueFromKey(
        `${DETAIL_PAGE_KEY}:${match.gameId}:${match.marketId}:${type}`
      );
      if (!getPageData) {
        page = await getOddsPages(match.gameId, match.marketId);
        // page.data['t2'] = []
        // page.data['t3'] = []
        await redis.setValueInKeyWithExpiry(
          `${DETAIL_PAGE_KEY}:${match.gameId}:${match.marketId}:${type}`,
          page,
          60
        );
      } else page = getPageData;

      const index = list[0].pin.findIndex(
        (value) =>
          value.gameId === match.gameId && value.marketId === match.marketId
      );
      console.log("page data", page);

      list[0].pin[index].t1 = page?.data?.t1;
    }
  const sendObject = {
    msg: "view pin list.",
    list,
  };

  return sendObject; // Return response
}

module.exports = {
  payload,
  handler,
  auth: true,
};
