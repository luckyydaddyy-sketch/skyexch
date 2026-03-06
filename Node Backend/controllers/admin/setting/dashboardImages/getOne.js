const joi = require("joi");

const mongo = require("../../../../config/mongodb");

const payload = {
  body: joi.object().keys({
    id: joi.string().required(),
  }),
};

async function handler({ body }) {
  const { id } = body;

  const dashboardImages = await mongo.bettingApp
    .model(mongo.models.dashboardImages)
    .findOne({
      query: {
        _id: id,
      },
    });

  dashboardImages.msg = "list of dashboard Images!";

  return dashboardImages;
}

module.exports = {
  payload,
  handler,
  auth: true,
};
