const joi = require("joi");
const httpStatus = require("http-status");

const mongo = require("../../../config/mongodb");
const ApiError = require("../../../utils/ApiError");
const { use } = require("express/lib/application");

const payload = {
  body: joi.object().keys({
    limit: joi.number().required(),
    page: joi.number().required(),
  }),
};

async function handler({ body, user }) {
  const { limit, page } = body;
  const { userId } = user;

  const data = await mongo.bettingApp
    .model(mongo.models.withdrawals)
    .paginate({ query: { userId }, limit, page, sort: { createdAt: -1 } });

  let resData = {
    msg: "get Transaction Request successfully.",
    data,
  };
  return resData;
}

module.exports = {
  payload,
  handler,
  auth: true,
};
