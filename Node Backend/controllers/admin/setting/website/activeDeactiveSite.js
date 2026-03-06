const joi = require("joi");
const httpStatus = require("http-status");

const mongo = require("../../../../config/mongodb");
const ApiError = require("../../../../utils/ApiError");
const CUSTOM_MESSAGE = require("../../../../utils/message");

const payload = {
  query: joi.object().keys({
    id: joi.string().required(),
  }),
};

async function handler({ user, body }) {
  const { id } = body;
  const siteInfo = await mongo.bettingApp.model(mongo.models.websites).findOne({
    query: {
      _id: id,
    },
    select: {
      isDeleted: 1,
      _id: 1,
    },
  });
  if (!siteInfo) {
    throw new ApiError(httpStatus.BAD_REQUEST, CUSTOM_MESSAGE.SITE_NOT_FOUND);
  }

  await mongo.bettingApp.model(mongo.models.websites).updateOne({
    query: {
      _id: id,
    },
    update: {
      isDeleted: !siteInfo?.isDeleted,
    },
  });

  console.log("Inactive : siteInfo :: ", siteInfo);
  siteInfo.msg = "webSite Inactive!";
  if (!siteInfo?.isDeleted) siteInfo.msg = "webSite Active!";
  return siteInfo;
}

module.exports = {
  payload,
  handler,
  auth: true,
};
