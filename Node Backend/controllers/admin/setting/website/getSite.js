const joi = require("joi");

const mongo = require("../../../../config/mongodb");
const ApiError = require("../../../../utils/ApiError");
const CUSTOM_MESSAGE = require("../../../../utils/message");
const httpStatus = require("http-status");

const payload = {
  body: joi.object().keys({
    domain: joi.string().optional(),
  }),
};

async function handler({ body }) {
  const { domain } = body;
  console.log("body :: domain details :: ", body);
  const query = {};
  if (domain && domain !== "localhost") {
    if (domain.includes("ag.")) {
      const tempDomain = domain.split("ag.");
      query.domain = tempDomain[1];
    } else if (domain.includes("msa.")) {
      const tempDomain = domain.split("msa.");
      query.domain = tempDomain[1];
    } else {
      query.domain = domain;
    }
  }
  let siteInfo = await mongo.bettingApp
    .model(mongo.models.websites)
    .findOne({ query });

  if (!siteInfo) {
    // Check for above admin data
    throw new ApiError(httpStatus.BAD_REQUEST, CUSTOM_MESSAGE.RECORD_NOT_FOUND);
  }
  siteInfo.msg = "webSite info!";

  return siteInfo;
}

module.exports = {
  payload,
  handler,
};
