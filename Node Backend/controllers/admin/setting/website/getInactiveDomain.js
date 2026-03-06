const joi = require("joi");

const mongo = require("../../../../config/mongodb");

const payload = {
  query: joi.object().keys({}),
};

async function handler({ user }) {
  const siteInfo = await mongo.bettingApp.model(mongo.models.websites).find({
    query: {
      isDeleted: true,
    },
    select: {
      domain: 1,
      _id: 1,
    },
  });

  console.log("Inactive : siteInfo :: ", siteInfo);
  siteInfo.msg = "webSite Inactive domain info!";
  return siteInfo;
}

module.exports = {
  payload,
  handler,
  auth: true,
};
