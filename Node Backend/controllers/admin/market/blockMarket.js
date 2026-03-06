const joi = require("joi");
const httpStatus = require("http-status");
const mongo = require("../../../config/mongodb");
const CUSTOM_MESSAGE = require("../../../utils/message");
const ApiError = require("../../../utils/ApiError");

const payload = {
  body: joi.object().keys({
    marketId: joi.string().required(),
    isBlock: joi.boolean().required(), // true = block && false = unblock
  }),
};

async function handler({ body, user }) {
  const { userId } = user;
  let { marketId, isBlock } = body;
  isBlock = isBlock === "true" || isBlock === true;
  console.log("isBlock :: ", isBlock, " :: typeof isBlock : ", typeof isBlock);
  // check uprer line user block market or not
  const blockMarketDetail = await mongo.bettingApp
    .model(mongo.models.blockMarketLists)
    .findOne({
      query: {
        userIds: userId,
        marketId: mongo.ObjectId(marketId),
        isBlock: true,
      },
    });
  console.log("blockMarketDetail :: ", blockMarketDetail);
  if (blockMarketDetail) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      CUSTOM_MESSAGE.MARKET_ALREADY_BLOCK
    );
  } else {
    const myBlockMarketDetail = await mongo.bettingApp
      .model(mongo.models.blockMarketLists)
      .findOne({
        query: {
          userId: userId,
          marketId: mongo.ObjectId(marketId),
        },
      });
    console.log("myBlockMarketDetail :: ", myBlockMarketDetail);
    if (myBlockMarketDetail) {
      if (myBlockMarketDetail.isBlock && isBlock) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          CUSTOM_MESSAGE.MARKET_ALREADY_BLOCK
        );
      } else if (!myBlockMarketDetail.isBlock && !isBlock) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          CUSTOM_MESSAGE.MARKET_ALREADY_UNBLOCK
        );
      }
      await mongo.bettingApp.model(mongo.models.blockMarketLists).updateOne({
        query: {
          userId: userId,
          marketId: mongo.ObjectId(marketId),
        },
        update: {
          $set: { isBlock },
        },
      });
    } else {
      const adminDetail = await mongo.bettingApp
        .model(mongo.models.admins)
        .findOne({
          query: {
            _id: userId,
          },
          select: {
            agent: 1,
          },
        });

      // insert document
      await mongo.bettingApp.model(mongo.models.blockMarketLists).insertOne({
        document: {
          userId,
          userIds: adminDetail.agent,
          marketId,
          isBlock: true,
        },
      });
    }
  }

  let blockMatchSend = {
    msg: "block market contant.",
  };

  return blockMatchSend;
}

module.exports = {
  payload,
  handler,
  auth: true,
};

// SMDL
// 6481c6e57a4b95931c5137ba
// MDL
// 6481c3447a4b95931c511678
// DL
// 6481c3fd7a4b95931c511ec3
