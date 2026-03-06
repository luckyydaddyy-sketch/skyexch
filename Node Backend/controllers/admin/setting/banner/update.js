const joi = require("joi");
const mongo = require("../../../../config/mongodb");

const payload = {
  body: joi.object().keys({
    id: joi.string().required(),
    name: joi.string().required(),
    image: joi.string().required(),
    active: joi.boolean().optional(),
  }),
};

async function handler({ body }) {
  const { id, name, image, active } = body;

  const banner = await mongo.bettingApp
    .model(mongo.models.banners)
    .updateOne({
      query: {
        _id: id,
      },
      update: {
        name,
        image,
        active,
      },
    });

  banner.msg = "update banner Images.";

  return banner;
}

module.exports = {
  payload,
  handler,
  auth: true,
};
