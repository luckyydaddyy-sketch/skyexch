const joi = require("joi");

const mongo = require("../../../config/mongodb");
const ApiError = require("../../../utils/ApiError");
const CUSTOM_MESSAGE = require("../../../utils/message");
const httpStatus = require("http-status");

const payload = {
  body: joi.object().keys({
    domain: joi.string().optional(),
  }),
};

async function handler({ body, user }) {
  const { userId } = user;
  const { domain } = body;
  console.log("body :: domain details :: ", body, userId);
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
  if (userId) {
    const userDetail = await mongo.bettingApp
      .model(mongo.models.users)
      .findOne({
        query: {
          _id: userId,
        },
        select: {
          admin: 1,
        },
      });
      console.log("baji: userDetail:: ", userDetail);
    if (userDetail) {
      
      const adminContacts = await mongo.bettingApp
        .model(mongo.models.contactDetails)
        .findOne({
          query: {
            userId: userDetail.admin,
          },
        });
        console.log("baji: adminContacts:: ", adminContacts);
      if (adminContacts) {
        siteInfo.email = adminContacts.email;
        siteInfo.whatsapp = adminContacts.whatsapp;
        siteInfo.facebook = adminContacts.facebook;
      } else {
        siteInfo.email = siteInfo.email.length ? siteInfo.email[0] : "";
        siteInfo.whatsapp = siteInfo.whatsapp.length
          ? siteInfo.telegram[0]
          : "";
      }
    }
  } else {
    siteInfo.email = siteInfo.email.length ? siteInfo.email[0] : "";
    siteInfo.whatsapp = siteInfo.whatsapp.length ? siteInfo.telegram[0] : "";
  }
  siteInfo.instagram = siteInfo.instagram.length ? siteInfo.instagram[0] : "";
  siteInfo.skype = siteInfo.skype.length ? siteInfo.skype[0] : "";
  siteInfo.telegram = siteInfo.telegram.length ? siteInfo.telegram[0] : "";

  siteInfo.msg = "webSite info!";

  return siteInfo;
}

module.exports = {
  payload,
  handler,
  auth: false,
};
