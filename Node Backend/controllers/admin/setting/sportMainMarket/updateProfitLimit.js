const joi = require("joi");
const mongo = require("../../../../config/mongodb");
const CUSTOM_MESSAGE = require("../../../../utils/message");

const payload = {
  body: joi.object().keys({
    id: joi.string().required(),
    max_profit_limit: joi
      .object()
      .keys({
        odds: joi.number().required(),
        bookmaker: joi.number().required(),
        fancy: joi.number().required(),
        premium: joi.number().required(),
      })
      .optional(),
  }),
};

async function handler({ body }) {
  const {
    id,
    max_profit_limit
  } = body;

  const query = {
    _id: id,
  };

  await mongo.bettingApp.model(mongo.models.sports).updateOne({
    query,
    update: {
      max_profit_limit
    },
  });

  const data = {
    msg: CUSTOM_MESSAGE.DATA_UPDATE_SUCESSFULLY,
  };

  return data;
}

module.exports = {
  payload,
  handler,
  auth: true,
};
