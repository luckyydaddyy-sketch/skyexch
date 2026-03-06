const joi = require("joi");
const mongo = require("../../../../config/mongodb");

const payload = {
  body: joi.object().keys({
    title: joi.string().required(),
    name: joi.string().required(),
    picture: joi.string().required(),
    videoLink: joi.string().required(),
    type: joi.string().valid("casino", "live casino").optional(),
    status: joi.boolean().optional(),
    minBet: joi.number().required(),
    maxBet: joi.number().required(),
  }),
};

async function handler({ body }) {
  const casino = await mongo.bettingApp.model(mongo.models.casinos).insertOne({
    document: body,
  });

  casino.msg = "Create casino.";

  return casino;
}

module.exports = {
  payload,
  handler,
  auth: true,
};
