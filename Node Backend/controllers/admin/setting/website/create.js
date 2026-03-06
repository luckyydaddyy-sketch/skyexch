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
    domain: joi.string().required(),
    favicon: joi.string().required(),
    logo: joi.string().required(),
    adminLogo: joi.string().allow("").optional(),
    loginImage: joi.string().required(),
    mobileLoginImage: joi.string().required(),
    agentListUrl: joi.string().required(),
    email: joi.array().items(joi.string()).required(),
    whatsapp: joi.array().items(joi.string()).required(),
    telegram: joi.array().items(joi.string()).required(),
    instagram: joi.array().items(joi.string()).required(),
    skype: joi.array().items(joi.string()).required(),
    maintenanceMessage: joi.string().optional().allow(""),
    agentMessage: joi.string().optional().allow(""),
    userMessage: joi.string().optional().allow(""),
    adminStatus: joi.boolean().optional(),
    currency: joi.string().optional(),
    theme: joi.string().optional(),
    colorSchema: joi.string().optional(),
    status: joi.boolean().optional(),
    change_password_on_first_login: joi.boolean().optional(),
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
  if (!tennis) {
    body.tennis = {
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
