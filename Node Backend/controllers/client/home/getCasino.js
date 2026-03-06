const joi = require("joi");
const httpStatus = require("http-status");

const mongo = require("../../../config/mongodb");
// const config = require("../../../config/config");
const ApiError = require("../../../utils/ApiError");
const CUSTOM_MESSAGE = require("../../../utils/message");
const payload = {
  query: joi.object().keys({
    gameType: joi
      .string()
      .required()
      .allow("Egame", "Fishing", "Live", "Slot", "Table", "Popular"),
    filter: joi.string().required().allow("catalog", "latest", "a-z"),
    subName: joi.string().optional().allow(""),
    domain: joi.string().optional(),
  }),
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

// we not use it
async function handler({ query }) {
  console.log("query :: ", query);

  const queryDb = {
    type: { $in: ["platform", "casino"] },
  };

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

  const sort = {};

  if (query.filter === "a-z") {
    sort.title = 1;
  } else if (query.filter === "latest") {
    sort.sort = 1;
  }

  if (query.gameType === "Live") {
    queryDb.gameType = "LIVE";
  } else if (query.gameType === "Table") {
    queryDb.gameType = "TABLE";
  } else if (query.gameType === "Fishing") {
    queryDb.gameType = "FH";
  } else if (query.gameType === "Slot") {
    queryDb.gameType = "SLOT";
  } else if (query.gameType === "Egame") {
    queryDb.gameType = { $in: ["EGAME", "ESPORTS"] };
  }

  console.log("queryDb ::: ", queryDb);
  const casinoType = await mongo.bettingApp
    .model(mongo.models.dashboardImages)
    .find({ query: queryDb, sort: sort });

  const catalog = await mongo.bettingApp
    .model(mongo.models.dashboardImages)
    .distinct({ field: "catalog", query: queryDb });

  const index = catalog.findIndex((_value)=> _value === 'Game Shows');
  if(index > -1){
    catalog.splice(index, 1);
    catalog.unshift("Game Shows");
  }
  
  const sendObject = {
    msg: "home info.",
    casinoType,
    catalog,
  };

  return sendObject; // Return response
}

module.exports = {
  payload,
  handler,
};
