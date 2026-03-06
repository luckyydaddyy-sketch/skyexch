const joi = require("joi");

const mongo = require("../../../config/mongodb");
const config = require("../../../config/config");
const payload = {
  query: joi.object().keys({}),
};
const casinoName = {
  EGAME: "Egame",
  ESPORTS: "Egame",
  FH: "Fishing",
  LIVE: "Live",
  SLOT: "Slot",
  TABLE: "Table",
  VIRTUAL: "Virtual",
};
async function handler({ query }) {
  const bannersInfo = await mongo.bettingApp
    .model(mongo.models.banners)
    .find({});
  const casinoType = await mongo.bettingApp
    .model(mongo.models.dashboardImages)
    .distinct({ field: "gameType", query: { gameType: { $ne: "" } } });

  const cc = casinoType
    .map((value) => casinoName[value])
    .filter((item, i, ar) => ar.indexOf(item) === i);

  const sendObject = {
    msg: "home info.",
    bannersInfo,
    in_play: config.in_play,
    multi_market: config.multi_market,
    cricket: config.cricket,
    soccer: config.soccer,
    tennis: config.tennis,
    casino: config.casino,
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
