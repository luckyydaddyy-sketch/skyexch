const joi = require("joi");
const httpStatus = require("http-status");

const mongo = require("../../../config/mongodb");
const ApiError = require("../../../utils/ApiError");
const auth = require("../../../utils/auth");
const CUSTOM_MESSAGE = require("../../../utils/message");
const eventEmitter = require("../../../eventEmitter");
const { EVENTS } = require("../../../constants");

const payload = {
  body: joi.object().keys({
    currentPassword: joi.string().required(),
    newPassword: joi.string().required(),
    conformPassword: joi.string().required(),
    browser_detail: joi.string().optional(),
    systemDetail: joi.string().optional(),
    ISP: joi.string().allow("", null).optional(),
    city: joi.string().allow("", null).optional(),
    state: joi.string().allow("", null).optional(),
    country: joi.string().allow("", null).optional(),
  }),
};

async function handler({ body, user }) {
  console.log("body :: ", body);
  console.log("user :: ", user);
  let {
    newPassword,
    conformPassword,
    currentPassword,
    browser_detail,
    systemDetail,
    city,
    state,
    country,
    ISP
  } = body;
  let { userId, requestIP } = user;

  let UserInfo = await mongo.bettingApp.model(mongo.models.users).findOne({
    // Find UserInfo data
    query: {
      _id: userId,
    },
  });

  if (!UserInfo)
    // Check for above User data
    throw new ApiError(httpStatus.BAD_REQUEST, CUSTOM_MESSAGE.USER_NOT_FOUND);
  if (newPassword != conformPassword)
    // Compair newPassword and conformPassword
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      CUSTOM_MESSAGE.NEW_PASSWOR_NOT_MATCH
    );
  if (UserInfo.password != currentPassword)
    // Compair old password and current password
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      CUSTOM_MESSAGE.OLD_PASSWORD_NOT_MATCH
    );
  if (UserInfo.password == newPassword || UserInfo.password == conformPassword)
    // new or confirm password and old password
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      CUSTOM_MESSAGE.NEW_AND_OLD_PASSWORD_NOT_SAME
    );
  let updateRes = await mongo.bettingApp.model(mongo.models.users).updateOne({
    // Update password
    query: {
      _id: userId,
    },
    update: {
      password: newPassword,
      newPassword: false,
    },
    options: {
      new: true,
    },
  });
  await mongo.bettingApp.model(mongo.models.tokens).deleteMany({
    // Remove all tokes
    query: {
      userId: userId.toString(),
    },
  });
  const tokens = await auth.generateToken(
    UserInfo,
    { expiresIn: 2400 * 60 * 60 },
    "access"
  ); // genegate new token

  let sendData = {
    userId: userId,
    password: newPassword,
  };
  sendData.token = tokens;
  const activities = {
    userId: userId,
    action: "change password",
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
  sendData.msg = "Password changed successfully.";
  return sendData; // Return response
}

module.exports = {
  payload,
  handler,
  auth: true,
};
