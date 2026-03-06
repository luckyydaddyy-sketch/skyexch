const joi = require("joi");
const httpStatus = require("http-status");

const mongo = require("../../../config/mongodb");
const ApiError = require("../../../utils/ApiError");
const CUSTOM_MESSAGE = require("../../../utils/message");

const payload = {
  body: joi.object().keys({
    id: joi.string().required(),
    password: joi.string().min(8).required(), // user pass for verifiy
    newPassword: joi.string().min(8).optional(), // user new pass
    confirmPassword: joi.string().min(8).optional(), // user pass
  }),
};

async function handler({ body, user }) {
  const { userId } = user;
  const { id, password, newPassword, confirmPassword } = body;

  const query = {
    _id: id,
  };

  const adminInfo = await mongo.bettingApp.model(mongo.models.users).findOne({
    query: {
      _id: userId,
      password,
    },
  });

  if (!adminInfo)
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      CUSTOM_MESSAGE.PASSWORD_INCORRECT
    );

  if (
    typeof newPassword !== "undefined" &&
    typeof confirmPassword !== "undefined" &&
    newPassword !== confirmPassword
  )
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      CUSTOM_MESSAGE.NEW_PASSWOR_NOT_MATCH
    );

  const userInfo = await mongo.bettingApp.model(mongo.models.users).findOne({
    query,
    select: {
      password: 0,
    },
  });

  if (!userInfo)
    throw new ApiError(httpStatus.BAD_REQUEST, CUSTOM_MESSAGE.USER_NOT_FOUND);

  const update = {
    password: newPassword,
  };

  await mongo.bettingApp.model(mongo.models.users).updateOne({
    query,
    update,
  });

  userInfo.msg = "Player Status Update!";
  if (typeof newPassword !== "undefined")
    userInfo.msg = CUSTOM_MESSAGE.PASSWORD_CHANGE_SUCESSFULLY;

  return userInfo;
}

module.exports = {
  payload,
  handler,
  auth: true,
};
