const joi = require("joi");

const mongo = require("../../../../config/mongodb");

const payload = {
  body: joi.object().keys({
    id: joi.string().required(),
  }),
};

async function handler({ body }) {
  const { id } = body;

  const banner = await mongo.bettingApp
    .model(mongo.models.banners)
    .findOne({
      query: {
        _id: id,
      },
    });

  banner.msg = "list of banner Images!";

  return banner;
}

module.exports = {
  payload,
  handler,
  auth: true,
};
