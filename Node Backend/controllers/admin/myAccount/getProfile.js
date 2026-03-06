const joi = require("joi");
const httpStatus = require("http-status");

const mongo = require("../../../config/mongodb");
const ApiError = require("../../../utils/ApiError");
const CUSTOM_MESSAGE = require("../../../utils/message");

const payload = {
  body: joi.object().keys({
    id: joi.string().optional(),
  }),
};

async function handler({ body, user }) {
  const { id } = body;
  const { userId } = user;

  const query = {
    _id: userId,
  };

  if (id) query._id = id;

  const userInfo = await mongo.bettingApp.model(mongo.models.admins).findOne({
    query,
    populate: {
      path: "domain",
      model: await mongo.bettingApp.model(mongo.models.websites),
      select: ["domain"],
    },
    select: {
      firstName: 1,
      lastName: 1,
      user_name: 1,
      balance: 1,
      exposure: 1,
      mobileNumber: 1,
      remaining_balance: 1,
      Commission: 1,
      domain: 1,
      agent_level: 1,
    },
  });

  if (!userInfo)
    throw new ApiError(httpStatus.BAD_REQUEST, CUSTOM_MESSAGE.USER_NOT_FOUND);

  userInfo.balance = Number(userInfo.balance.toFixed(2));
  userInfo.exposure = Number(userInfo.exposure.toFixed(2));
  userInfo.remaining_balance = Number(userInfo.remaining_balance.toFixed(2));
  userInfo.msg = "admin profile!";

  return userInfo;
}

module.exports = {
  payload,
  handler,
  auth: true,
};
