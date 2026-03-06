const joi = require("joi");
const httpStatus = require("http-status");

const mongo = require("../../../../config/mongodb");
const ApiError = require("../../../../utils/ApiError");
const CUSTOM_MESSAGE = require("../../../../utils/message");

const payload = {
  body: joi.object().keys({
    id: joi.string().required(),
    password: joi.string().min(8).required(), // user pass for verifiy
    status: joi.string().valid("active", "suspend", "locked").optional(),
    newPassword: joi.string().min(8).optional(), // user new pass 
    confirmPassword: joi.string().min(8).optional(), // user pass 
    domain: joi.array().items(joi.string()).optional(),
  }),
};

async function handler({ body, user }) {
  const { userId } = user;
  const { id, status, password, newPassword, confirmPassword, domain } = body;

  const query = {
    _id: id,
  };

  const adminInfo = await mongo.bettingApp.model(mongo.models.admins).findOne({
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

    if(domain && domain.length === 0){
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        CUSTOM_MESSAGE.SELECT_DOMAIN
      );
    }
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
  });

  if (!userInfo)
    throw new ApiError(httpStatus.BAD_REQUEST, CUSTOM_MESSAGE.USER_NOT_FOUND);

  const update = {
    status,
  };

  if (typeof newPassword !== "undefined") {
    update.password = newPassword.trim();
  }
  if(domain && domain.length > 0){
    update.domain = domain
  }
  await mongo.bettingApp.model(mongo.models.users).updateOne({
    query,
    update,
  });

  userInfo.status = status;
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
