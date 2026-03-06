const joi = require("joi");
const mongo = require("../../../../config/mongodb");
const { USER_LEVEL_NEW } = require("../../../../constants");

const payload = {
  body: joi.object().keys({
    domain: joi.string().required(),
    name: joi.string().required(),
    image: joi.string().required(),
    active: joi.boolean().optional(),
  }),
};

async function handler({ body,user }) {
  const {userId, role} = user

  let document = body
  if(role === USER_LEVEL_NEW.M){
    document = {...body, admin: userId}
  }
  const banner = await mongo.bettingApp.model(mongo.models.banners).insertOne({
    document,
  });

  banner.msg = "Create banner Images.";

  return banner;
}

module.exports = {
  payload,
  handler,
  auth: true,
};
