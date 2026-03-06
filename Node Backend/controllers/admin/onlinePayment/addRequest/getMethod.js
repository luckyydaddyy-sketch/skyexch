const joi = require("joi");
const httpStatus = require("http-status");

const mongo = require("../../../../config/mongodb");
const ApiError = require("../../../../utils/ApiError");

const payload = {
  query: joi.object().keys({
    paymentType: joi.string().required(),
  }),
};

async function handler({ query, user }) {
  const { paymentType } = query;
  const { userId } = user;
  const userDetail = await mongo.bettingApp.model(mongo.models.admins).findOne({
    query: { _id: userId },
    select: {
      admin: 1,
    },
  });
  const data = await mongo.bettingApp
    .model(mongo.models.bankDetails)
    .find({ query: { userId: userDetail.admin, paymentType, isActive: true } });

  let resData = {
    msg: "get Method successfully.",
    data,
  };
  return resData;
}

module.exports = {
  payload,
  handler,
  auth: true,
};
