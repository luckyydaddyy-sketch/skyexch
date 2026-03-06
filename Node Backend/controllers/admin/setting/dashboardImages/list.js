const joi = require("joi");

const mongo = require("../../../../config/mongodb");

const payload = {
  body: joi.object().keys({
    domain: joi.string().required(),
    page: joi.number().required(),
    limit: joi.number().required(),
  }),
};

async function handler({ body }) {
  const { page, limit, domain } = body;

  const dashboardImages = await mongo.bettingApp
    .model(mongo.models.dashboardImages)
    .paginate({
      query: { domain },
      page,
      limit,
      // sort: {sort : 1}
    });

  dashboardImages.msg = "list of dashboard Images!";

  return dashboardImages;
}

module.exports = {
  payload,
  handler,
  auth: true,
};
