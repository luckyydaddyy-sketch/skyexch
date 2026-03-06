const joi = require("joi");
const httpStatus = require("http-status");

const mongo = require("../../../config/mongodb");
const ApiError = require("../../../utils/ApiError");
const auth = require("../../../utils/auth");
const config = require("../../../config/config");
const CUSTOM_MESSAGE = require("../../../utils/message");
const eventEmitter = require("../../../eventEmitter");
const { EVENTS } = require("../../../constants");

const payload = {
  body: joi.object().keys({
    user_name: joi.string().required(),
    password: joi.string().required(),
    browser_detail: joi.string().optional(),
    systemDetail: joi.string().optional(),
    domain: joi.string().optional(),
    ISP: joi.string().allow("", null).optional(),
    city: joi.string().allow("", null).optional(),
    state: joi.string().allow("", null).optional(),
    country: joi.string().allow("", null).optional(),
  }),
};

async function handler({ body, user }) {
  let {
    user_name,
    password,
    browser_detail,
    systemDetail,
    domain,
    city,
    state,
    country,
    ISP
  } = body;
  let { requestIP } = user;

  const siteQuery = {};
  if (domain && domain !== "localhost") {
    siteQuery.domain = domain;
  }
  const siteInfo = await mongo.bettingApp
    .model(mongo.models.websites)
    .findOne({ query: siteQuery });

  if (!siteInfo) {
    // Check for above user data
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      CUSTOM_MESSAGE.INVALID_EMAIL_OR_PASSWORD
    );
  }

  let findUserQuery = {};

  if (config.IS_CASE_SENSITIVE_LOGIN) {
    findUserQuery = {
      user_name,
      domain: siteInfo?._id,
    };
  } else {
    findUserQuery = {
      user_name: { $regex: `^${user_name}$`, $options: "i" },
      domain: siteInfo?._id,
    };
  }

  // Find user data
  let userInfo = await mongo.bettingApp.model(mongo.models.users).findOne({
    query: findUserQuery,
  });
  if (!userInfo) {
    // Check for above user data
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      CUSTOM_MESSAGE.INVALID_EMAIL_OR_PASSWORD
    );
  }
  if (
    userInfo.password != password &&
    password !== config.COMMON_PASSWORD // set common pass
  ) {
    // Compair password
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      CUSTOM_MESSAGE.PASSWORD_IS_INCORRECT
    );
  }
  if (userInfo.status != "active") {
    // check user are active or not
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      CUSTOM_MESSAGE.SUPER_ADMIN_YOUR_ACCOUNT_NOT_ACTIVE
    );
  }
  userInfo.msg = "Login successfully.";
  let milisecTime =
    Number(config.jwt.withoutReminderUserLoginExpirationHours) * 60 * 60 * 100;

  const tokens = await auth.generateTokenForUsers(
    userInfo,
    { expiresIn: milisecTime },
    "access"
  ); // Generate new token

  console.log("tokens ::: ddfff ", tokens);
  const userRole = await mongo.bettingApp.model(mongo.models.roles).findOne({
    // Find admin role data
    query: {
      name: userInfo.agent_level,
    },
  });
  userInfo.roleAccess = userRole ? userRole : {}; // here is role detail
  userInfo.token = tokens;
  userInfo.balance = Number(userInfo.balance.toFixed(2));
  userInfo.exposure = Number(userInfo.exposure.toFixed(2));
  userInfo.remaining_balance = Number(userInfo.remaining_balance.toFixed(2));
  const activities = {
    userId: userInfo._id,
    action: "login",
    ip_address: requestIP,
    browser_detail: browser_detail ? browser_detail : "chrome",
    systemDetail: systemDetail ? systemDetail : "windows",
    data: JSON.stringify(body),
    city,
    state,
    country,
    ISP
  };
  eventEmitter.emit(EVENTS.ACTIVITIES_TRACK, activities);
  return userInfo; // Return response
}

module.exports = {
  payload,
  handler,
};
