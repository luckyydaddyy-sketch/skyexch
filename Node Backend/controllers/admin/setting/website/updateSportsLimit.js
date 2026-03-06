const joi = require("joi");

const mongo = require("../../../../config/mongodb");
// const defaultDataLimit = { min: 10, max: 100 };
// const defaultData = {
//   oddsLimit: defaultDataLimit,
//   bet_odds_limit: defaultDataLimit,
//   bet_bookmaker_limit: defaultDataLimit,
//   bet_fancy_limit: defaultDataLimit,
//   // bet_premium_limit: defaultDataLimit,
// };
// const defaultDataRemovePrem = {
//   oddsLimit: defaultDataLimit,
//   bet_odds_limit: defaultDataLimit,
//   bet_bookmaker_limit: defaultDataLimit,
//   bet_fancy_limit: defaultDataLimit,
//   bet_premium_limit: defaultDataLimit,
// };
const limitJoinSchema = joi.object().keys({
  min: joi.number().default(10),
  max: joi.number().default(100),
  maxProfit: joi.number().default(100),
  betDelay: joi.number().default(100),
  maxPrice: joi.number().default(100),
  isShow: joi.boolean().default(false),
}).unknown(true);
const autoSchema = joi.object().keys({
  cricket: joi.boolean().default(false),
  soccer: joi.boolean().default(false),
  tennis: joi.boolean().default(false),
}).unknown(true); 
const payload = {
  body: joi.object().keys({
    cricket: joi.object().keys({
      oddsLimit: limitJoinSchema,
      bet_odds_limit: limitJoinSchema,
      bet_bookmaker_limit: limitJoinSchema,
      bet_fancy_limit: limitJoinSchema,
      bet_premium_limit: limitJoinSchema,
    }),
    soccer: joi.object().keys({
      oddsLimit: limitJoinSchema,
      bet_odds_limit: limitJoinSchema,
      bet_bookmaker_limit: limitJoinSchema,
      // bet_fancy_limit: limitJoinSchema,
      bet_premium_limit: limitJoinSchema,
    }),
    tennis: joi.object().keys({
      oddsLimit: limitJoinSchema,
      bet_odds_limit: limitJoinSchema,
      bet_bookmaker_limit: limitJoinSchema,
      // bet_fancy_limit: limitJoinSchema,
      bet_premium_limit: limitJoinSchema,
    }),
    eSoccer: joi.object().keys({
      oddsLimit: limitJoinSchema,
      bet_odds_limit: limitJoinSchema,
      bet_bookmaker_limit: limitJoinSchema,
      // bet_fancy_limit: limitJoinSchema,
      bet_premium_limit: limitJoinSchema,
    }).optional(),
    basketBall: joi.object().keys({
      oddsLimit: limitJoinSchema,
      bet_odds_limit: limitJoinSchema,
      bet_bookmaker_limit: limitJoinSchema,
      // bet_fancy_limit: limitJoinSchema,
      bet_premium_limit: limitJoinSchema,
    }).optional(),
    setAutoSportsResult: autoSchema,
    setAutoSportsAdd: autoSchema,
  }).unknown(true),
};

async function handler({ body, user }) {
  const { cricket, soccer, tennis, setAutoSportsResult, setAutoSportsAdd } =
    body;

  const siteInfo = await mongo.bettingApp
    .model(mongo.models.deafultSetting)
    .findOneAndUpdate({
      update: {
        $set: body,
      },
      options: {
        upsert: true,
      },
    });

  const sendObject = {
    msg: "default Setting Updated Success!",
  };

  return sendObject;
}

module.exports = {
  payload,
  handler,
  auth: true,
};
