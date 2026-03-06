const joi = require("joi");

const mongo = require("../../../../config/mongodb");

const payload = {
  body: joi.object().keys({
    id: joi.string().required(),
  }),
};

async function handler({ body }) {
  const { id } = body;
  const query = { _id: id };

  let siteInfo = await mongo.bettingApp
    .model(mongo.models.websites)
    .findOne({ query });

  siteInfo.msg = "one webSite info!";

  return siteInfo;
}

module.exports = {
  payload,
  handler,
  auth: true,
};
