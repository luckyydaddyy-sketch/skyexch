const joi = require("joi");

const mongo = require("../../../../config/mongodb");
const defaultDataLimit = { min: 10, max: 100 };
const defaultData = {
  oddsLimit: defaultDataLimit,
  bet_odds_limit: defaultDataLimit,
  bet_bookmaker_limit: defaultDataLimit,
  bet_fancy_limit: defaultDataLimit,
  // bet_premium_limit: defaultDataLimit,
};
const defaultDataRemovePrem = {
  oddsLimit: defaultDataLimit,
  bet_odds_limit: defaultDataLimit,
  bet_bookmaker_limit: defaultDataLimit,
  bet_fancy_limit: defaultDataLimit,
  bet_premium_limit: defaultDataLimit,
};
const limitJoinSchema = joi.object().keys({
  min: joi.number().default(10),
  max: joi.number().default(100),
});
const payload = {
  body: joi.object().keys({
    title: joi.string().required(),
  }),
};

async function handler({ body, user }) {
  const { cricket, soccer, tennis, eSoccer, basketBall } = body;
  if (!cricket) {
    body.cricket = {
      oddsLimit: defaultDataLimit,
      bet_odds_limit: defaultDataLimit,
      bet_bookmaker_limit: defaultDataLimit,
      bet_fancy_limit: defaultDataLimit,
      bet_premium_limit: defaultDataLimit,
    };
  }
  if (!soccer) {
    body.soccer = {
      oddsLimit: defaultDataLimit,
      bet_odds_limit: defaultDataLimit,
      bet_bookmaker_limit: defaultDataLimit,
      bet_premium_limit: defaultDataLimit,
    };
  }
  if (!tennis) {
    body.tennis = {
      oddsLimit: defaultDataLimit,
      bet_odds_limit: defaultDataLimit,
      bet_bookmaker_limit: defaultDataLimit,
      bet_premium_limit: defaultDataLimit,
    };
  }

  if (!eSoccer) {
    body.eSoccer = {
      oddsLimit: defaultDataLimit,
      bet_odds_limit: defaultDataLimit,
      bet_bookmaker_limit: defaultDataLimit,
      bet_premium_limit: defaultDataLimit,
    };
  }
  if (!basketBall) {
    body.basketBall = {
      oddsLimit: defaultDataLimit,
      bet_odds_limit: defaultDataLimit,
      bet_bookmaker_limit: defaultDataLimit,
      bet_premium_limit: defaultDataLimit,
    };
  }
  const siteInfo = await mongo.bettingApp
    .model(mongo.models.websites)
    .insertOne({
      document: body,
    });

  siteInfo.msg = "webSite Add Success!";

  return siteInfo;
}

module.exports = {
  payload,
  handler,
  auth: true,
};
