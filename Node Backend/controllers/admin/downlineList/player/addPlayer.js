const httpStatus = require("http-status");
const joi = require("joi");
const mongo = require("../../../../config/mongodb");
const ApiError = require("../../../../utils/ApiError");
const CUSTOM_MESSAGE = require("../../../../utils/message");
const { checkUserNameIsAvalibleOrNot } = require("../utile");
const { USER_LEVEL, USER_LEVEL_NEW } = require("../../../../constants");
const { generateReferralCode } = require("../../../../utils/global");

const payload = {
  body: joi.object().keys({
    user_name: joi.string().required(),
    password: joi.string().min(8).required(),
    confirmPassword: joi.string().min(8).optional(),
    firstName: joi.string().allow("").required(),
    lastName: joi.string().allow("").required(),
    commission: joi.number().optional(),
    rolling_delay: joi.boolean().optional(),
    domain: joi.array().items(joi.string()).optional(),
    delay: joi
      .object()
      .keys({
        bookmaker: joi.number().optional(),
        fancy: joi.number().optional(),
        premium: joi.number().optional(),
        odds: joi.number().optional(),
        soccer: joi.number().optional(),
        tennis: joi.number().optional(),
      })
      .optional(),
  }),
};

async function handler({ body, user }) {
  const { userId } = user;

  const {
    user_name,
    password,
    confirmPassword,
    firstName,
    lastName,
    commission,
    limit,
    rolling_delay,
    domain,
    agent_level,
    delay,
  } = body;

  if (password && confirmPassword && password !== confirmPassword)
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      CUSTOM_MESSAGE.PASSWORD_NOT_MATCH
    );

  console.log("body :: ", body.domain);
  const flag = await checkUserNameIsAvalibleOrNot(body.user_name);

  console.log("flag: " + flag);
  // User name is not available
  if (flag)
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      CUSTOM_MESSAGE.ACCOUNT_ALREADY_EXISTS
    );

  let adminInfo = await mongo.bettingApp.model(mongo.models.admins).findOne({
    query: { _id: userId },
    select: {
      whoAdd: 1,
      commission: 1,
      delay: 1,
      rolling_delay: 1,
      agent_level: 1,
      domain: 1,
    },
  });
  const whoAdd = adminInfo.whoAdd;
  whoAdd.push(userId);

  if (adminInfo.domain.length === 0) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      CUSTOM_MESSAGE.YOU_DONT_HAVE_DOMAIN
    );
  }
  // create player
  const document = {
    user_name,
    password: password.trim(),
    firstName,
    lastName,
    commission,
    limit,
    rolling_delay,
    domain,
    agent_level,
    delay,
    newPassword: false,
    refferCode: generateReferralCode(8),
  };
  if (adminInfo.agent_level !== USER_LEVEL_NEW.COM) {
    document.commission = adminInfo.commission;
    document.delay = adminInfo.delay;
    document.rolling_delay = adminInfo.rolling_delay;
    document.domain = adminInfo.domain;
  }
  document.whoAdd = whoAdd;
  document.admin = userId;

  let websiteInfo = {};
  if (document.domain.length > 0)
    websiteInfo = await mongo.bettingApp.model(mongo.models.websites).findOne({
      query: { _id: document.domain[0] },
      select: {
        change_password_on_first_login: 1,
      },
    });
  else
    websiteInfo = await mongo.bettingApp.model(mongo.models.websites).findOne({
      query: {},
      select: {
        change_password_on_first_login: 1,
      },
    });

  if (Object.keys(websiteInfo).length > 0)
    document.newPassword = websiteInfo.change_password_on_first_login;

  let userInfo = await mongo.bettingApp.model(mongo.models.users).insertOne({
    document,
  });

  await mongo.bettingApp.model(mongo.models.stacks).insertOne({
    document: { userId: userInfo._id, stack: [10, 50, 100, 200, 500, 1000] },
  });

  await mongo.bettingApp.model(mongo.models.admins).updateOne({
    query: {
      _id: userId,
    },
    update: {
      $push: {
        player: userInfo._id,
      },
    },
  });

  userInfo.msg = "Create Player.";

  return userInfo;
}

module.exports = {
  payload,
  handler,
  auth: true,
};
