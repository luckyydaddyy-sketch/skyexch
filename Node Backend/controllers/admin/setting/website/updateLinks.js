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
    userMessage: joi.string().allow("").optional(),
    titleUserMessage: joi.string().allow("").optional(),
    userMessageDate: joi.string().allow("").optional(),
  }),
};

async function handler({ body, user }) {
  const {
    id,
    email,
    whatsapp,
    telegram,
    instagram,
    skype,
    facebook,
    signup,
    appLink,
    SABALink,
    validationLink,
    userMessage,
    titleUserMessage,
    userMessageDate,
  } = body;
  const siteInfo = await mongo.bettingApp
    .model(mongo.models.websites)
    .updateOne({
      query: {
        _id: mongo.ObjectId(id),
      },
      update: {
        email,
        whatsapp,
        telegram,
        instagram,
        skype,
        facebook,
        signup,
        appLink,
        SABALink,
        validationLink,
        userMessage,
        titleUserMessage,
        userMessageDate,
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
