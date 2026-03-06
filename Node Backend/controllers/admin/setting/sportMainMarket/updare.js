const joi = require("joi");
const mongo = require("../../../../config/mongodb");
const CUSTOM_MESSAGE = require("../../../../utils/message");

const payload = {
  body: joi.object().keys({
    id: joi.string().required(),
    status: joi.boolean().optional(),
    startDate: joi.date().optional(),
    activeStatus: joi
      .object()
      .keys({
        bookmaker: joi.boolean().required(),
        fancy: joi.boolean().required(),
        premium: joi.boolean().required(),
        status: joi.boolean().required(),
      })
      .optional(),
    suspend: joi
      .object()
      .keys({
        bookmaker: joi.boolean().required(),
        fancy: joi.boolean().required(),
        premium: joi.boolean().required(),
        odds: joi.boolean().required(),
      })
      .optional(),
    oddsLimit: joi
      .object()
      .keys({
        min: joi.number().required(),
        max: joi.number().required(),
      })
      .optional(),
    bet_odds_limit: joi
      .object()
      .keys({
        min: joi.number().required(),
        max: joi.number().required(),
      })
      .optional(),
    bet_bookmaker_limit: joi
      .object()
      .keys({
        min: joi.number().required(),
        max: joi.number().required(),
      })
      .optional(),
    bet_fancy_limit: joi
      .object()
      .keys({
        min: joi.number().required(),
        max: joi.number().required(),
      })
      .optional(),
    bet_premium_limit: joi
      .object()
      .keys({
        min: joi.number().required(),
        max: joi.number().required(),
      })
      .optional(),
  }),
};

async function handler({ body }) {
  const {
    id,
    status,
    activeStatus,
    bet_odds_limit,
    oddsLimit,
    bet_bookmaker_limit,
    bet_fancy_limit,
    bet_premium_limit,
    suspend,
    startDate,
  } = body;

  const query = {
    _id: id,
  };

  await mongo.bettingApp.model(mongo.models.sports).updateOne({
    query,
    update: {
      // status,
      activeStatus,
      bet_odds_limit,
      oddsLimit,
      bet_bookmaker_limit,
      bet_fancy_limit,
      bet_premium_limit,
      suspend,
      startDate,
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
