const joi = require("joi");

const mongo = require("../../../../config/mongodb");

const limitJoinSchema = joi
  .object()
  .keys({
    min: joi.number().default(10),
    max: joi.number().default(100),
  })
  .optional();
const payload = {
  body: joi.object().keys({
    id: joi.string().required(),
    title: joi.string().required(),
    domain: joi.string().required(),
    favicon: joi.string().required(),
    logo: joi.string().required(),
    adminLogo: joi.string().allow("").optional(),
    loginImage: joi.string().required(),
    mobileLoginImage: joi.string().required(),
    agentListUrl: joi.string().required(),
    email: joi.array().items(joi.string()).optional(),
    whatsapp: joi.array().items(joi.string()).optional(),
    telegram: joi.array().items(joi.string()).optional(),
    instagram: joi.array().items(joi.string()).optional(),
    skype: joi.array().items(joi.string()).optional(),
    facebook: joi.string().allow("").optional(),
    signup: joi.string().allow("").optional(),
    appLink: joi.string().allow("").optional(),
    SABALink: joi.string().allow("").optional(),
    validationLink: joi.string().allow("").optional(),
    maintenanceMessage: joi.string().allow("").optional(),
    agentMessage: joi.string().allow("").optional(),
    userMessage: joi.string().allow("").optional(),
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
      bet_premium_limit: limitJoinSchema,
    }),
    tennis: joi.object().keys({
      oddsLimit: limitJoinSchema,
      bet_odds_limit: limitJoinSchema,
      bet_bookmaker_limit: limitJoinSchema,
      bet_premium_limit: limitJoinSchema,
    }),
    eSoccer: joi
      .object()
      .keys({
        oddsLimit: limitJoinSchema,
        bet_odds_limit: limitJoinSchema,
        bet_bookmaker_limit: limitJoinSchema,
        bet_premium_limit: limitJoinSchema,
      })
      .optional(),
    basketBall: joi
      .object()
      .keys({
        oddsLimit: limitJoinSchema,
        bet_odds_limit: limitJoinSchema,
        bet_bookmaker_limit: limitJoinSchema,
        bet_premium_limit: limitJoinSchema,
      })
      .optional(),
  }),
};

async function handler({ body, user }) {
  const {
    id,
    title,
    domain,
    favicon,
    logo,
    adminLogo,
    loginImage,
    mobileLoginImage,
    agentListUrl,
    email,
    whatsapp,
    telegram,
    instagram,
    skype,
    maintenanceMessage,
    agentMessage,
    userMessage,
    adminStatus,
    currency,
    theme,
    colorSchema,
    status,
    change_password_on_first_login,
    cricket,
    soccer,
    tennis,
    eSoccer,
    basketBall,
    facebook,
    signup,
    appLink,
    SABALink,
    validationLink,
  } = body;
  const siteInfo = await mongo.bettingApp
    .model(mongo.models.websites)
    .updateOne({
      query: {
        _id: mongo.ObjectId(id),
      },
      update: {
        title,
        domain,
        favicon,
        logo,
        adminLogo,
        loginImage,
        mobileLoginImage,
        agentListUrl,
        email,
        whatsapp,
        telegram,
        instagram,
        skype,
        maintenanceMessage,
        agentMessage,
        userMessage,
        adminStatus,
        currency,
        theme,
        colorSchema,
        status,
        change_password_on_first_login,
        cricket,
        soccer,
        tennis,
        eSoccer,
        basketBall,
        facebook,
        signup,
        appLink,
        SABALink,
        validationLink,
      },
    });

  siteInfo.msg = "webSite update Successfully!";

  return siteInfo;
}

module.exports = {
  payload,
  handler,
  auth: true,
};
