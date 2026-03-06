const joi = require("joi");
const httpStatus = require("http-status");
const mongo = require("../../../config/mongodb");
const ApiError = require("../../../utils/ApiError");
const CUSTOM_MESSAGE = require("../../../utils/message");

const payload = {
  body: joi.object().keys({
    id: joi.string().required(),
    type: joi.string().valid("agent", "player").required(),
    password: joi.string().min(8).required(), // user pass for verifiy
    credit_ref: joi.number().required(),
  }),
};

async function handler({ body, user }) {
  const { userId } = user;
  const { id, type, password, credit_ref } = body;

  const query = {
    _id: id,
  };
  const update = {
    credit_ref,
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

  let isUpdate = false;
  if (type === "agent") {
    const userInfo = await mongo.bettingApp.model(mongo.models.admins).findOne({
      query,
    });

    if (!userInfo)
      throw new ApiError(httpStatus.BAD_REQUEST, CUSTOM_MESSAGE.USER_NOT_FOUND);

    await mongo.bettingApp.model(mongo.models.admins).updateOne({
      query,
      update,
    });

    isUpdate = true;
  } else if (type === "player") {
    const userInfo = await mongo.bettingApp.model(mongo.models.users).findOne({
      query,
    });

    if (!userInfo)
      throw new ApiError(httpStatus.BAD_REQUEST, CUSTOM_MESSAGE.USER_NOT_FOUND);

    await mongo.bettingApp.model(mongo.models.users).updateOne({
      query,
      update,
    });

    isUpdate = true;
  }

  const sendObject = {
    msg: "credit Refrance is updated!",
    isUpdate,
  };

  return sendObject;
}

module.exports = {
  payload,
  handler,
  auth: true,
};
