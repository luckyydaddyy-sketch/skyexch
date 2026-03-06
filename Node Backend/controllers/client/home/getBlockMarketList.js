const joi = require("joi");
const mongo = require("../../../config/mongodb");

const payload = {
  body: joi.object().keys({}),
};

async function handler({ body, user }) {
  const { userId } = user;

  const playerInfo = await mongo.bettingApp.model(mongo.models.users).findOne({
    query: { _id: userId },
    select: {
      _id: 1,
      whoAdd: 1,
      admin: 1,
    },
  });

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
    };

    const blockMarketDetail = await mongo.bettingApp
      .model(mongo.models.blockMarketLists)
      .findOne({
        query: {
          userIds: { $in: playerInfo.whoAdd },
          marketId: mongo.ObjectId(market._id),
          isBlock: true,
        },
      });

    if (blockMarketDetail) {
      marketInfo.isBlock = true;
    } else {
      const myBlockMarketDetail = await mongo.bettingApp
        .model(mongo.models.blockMarketLists)
        .findOne({
          query: {
            userId: playerInfo.admin,
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
