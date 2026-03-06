const joi = require("joi");
const mongo = require("../../../config/mongodb");

const payload = {
  body: joi.object().keys({}),
};

async function handler({ body, user }) {
  const { userId } = user;

  const marketDetail = await mongo.bettingApp
    .model(mongo.models.marketLists)
    .find({
      query: {},
    });
  const sendMarketList = [];
  for (const market of marketDetail) {
    const marketInfo = {
      _id: market._id,
      name: market.name,
      betFairId: market.betFairId,
      isBlock: false,
      isAbleToTakeAction: true, // if this key is true then user can block the market or unblock
    };
    const blockMarketDetail = await mongo.bettingApp
      .model(mongo.models.blockMarketLists)
      .findOne({
        query: {
          userIds: userId,
          marketId: mongo.ObjectId(market._id),
          isBlock: true,
        },
      });

    if (blockMarketDetail) {
      marketInfo.isBlock = true; // if client ask only show currant user action : then comment this
      marketInfo.isAbleToTakeAction = false;
    } else {
      const myBlockMarketDetail = await mongo.bettingApp
        .model(mongo.models.blockMarketLists)
        .findOne({
          query: {
            userId: userId,
            marketId: mongo.ObjectId(market._id),
          },
        });

      if (myBlockMarketDetail) {
        marketInfo.isBlock = myBlockMarketDetail.isBlock;
      }
    }
    sendMarketList.push(marketInfo);
  }
  let blockMarketSend = {
    data: sendMarketList,
  };

  blockMarketSend.msg = "block market contant.";

  return blockMarketSend;
}

module.exports = {
  payload,
  handler,
  auth: true,
};
