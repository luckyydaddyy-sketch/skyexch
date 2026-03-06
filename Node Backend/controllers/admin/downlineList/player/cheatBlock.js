const joi = require("joi");
const httpStatus = require("http-status");

const mongo = require("../../../../config/mongodb");
const ApiError = require("../../../../utils/ApiError");
const CUSTOM_MESSAGE = require("../../../../utils/message");

const payload = {
  body: joi.object().keys({
    id: joi.string().required(),
    status: joi.string().valid("active", "suspend", "locked").optional(),
  }),
};

async function handler({ body, user }) {
  // const { userId } = user;
  const { id, status } = body;

  const query = {
    _id: id,
  };

  const userInfo = await mongo.bettingApp.model(mongo.models.users).findOne({
    query,
  });

  if (!userInfo)
    throw new ApiError(httpStatus.BAD_REQUEST, CUSTOM_MESSAGE.USER_NOT_FOUND);

  const update = {
    status,
  };

  await mongo.bettingApp.model(mongo.models.users).updateOne({
    query,
    update,
  });

  userInfo.status = status;
  userInfo.msg = "Player is Block for Cheat!";
  if(status === "active"){
    userInfo.msg = "Player is unBlock for Cheat!";
  }

  return userInfo;
}

module.exports = {
  payload,
  handler,
  auth: true,
};
