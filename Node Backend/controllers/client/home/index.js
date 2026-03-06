const joi = require("joi");
const httpStatus = require("http-status");

const mongo = require("../../../config/mongodb");
const config = require("../../../config/config");
const ApiError = require("../../../utils/ApiError");
const CUSTOM_MESSAGE = require("../../../utils/message");

const payload = {
  query: joi.object().keys({
    domain: joi.string().optional(),
  }),
};

async function handler({ query }) {
  const queryDb = {};
  if (query?.domain && query?.domain !== "localhost") {
    const siteQuery = {};
    siteQuery.domain = query?.domain;
    const siteInfo = await mongo.bettingApp
      .model(mongo.models.websites)
      .findOne({ query: siteQuery });

    if (!siteInfo) {
      // Check for above user data
      throw new ApiError(httpStatus.BAD_REQUEST, CUSTOM_MESSAGE.SITE_NOT_FOUND);
    }

    queryDb.domain = siteInfo._id;
  }

  const dashboardImagesInfo = await mongo.bettingApp
    .model(mongo.models.dashboardImages)
    .find({ query: queryDb });
  const bannersInfo = await mongo.bettingApp
    .model(mongo.models.banners)
    .find({ query: queryDb });

  const sendObject = {
    msg: "home info.",
    dashboardImagesInfo,
    bannersInfo,
    in_play: config.in_play,
    multi_market: config.multi_market,
    cricket: config.cricket,
    soccer: config.soccer,
    tennis: config.tennis,
    casino: config.casino,
    eSoccer: config.eSoccer,
    basketBall: config.basketBall,
    odds_suspend: config.odds_suspend,
    bookmaker_suspend: config.bookmaker_suspend,
    signup: config.signup,
  };

  return sendObject; // Return response
}

module.exports = {
  payload,
  handler,
};
