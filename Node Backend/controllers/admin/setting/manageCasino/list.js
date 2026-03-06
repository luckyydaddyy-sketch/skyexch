const joi = require("joi");

const mongo = require("../../../../config/mongodb");

const payload = {
  body: joi.object().keys({
    page: joi.number().required(),
    limit: joi.number().required(),
  }),
};

async function handler({ body }) {
  const { page, limit } = body;

  const casino = await mongo.bettingApp.model(mongo.models.casinos).paginate({
    page,
    limit,
  });

  casino.msg = "list of casinos!";

  return sendObject;
}

module.exports = {
  payload,
  handler,
  auth: true,
};
