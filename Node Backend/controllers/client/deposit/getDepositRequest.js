const joi = require("joi");
const httpStatus = require("http-status");

const mongo = require("../../../config/mongodb");
const ApiError = require("../../../utils/ApiError");
const { use } = require("express/lib/application");

const payload = {
  body: joi.object().keys({}),
};

async function handler({ body, user }) {
  const { userId } = user;

  const data = await mongo.bettingApp
    .model(mongo.models.withdrawals)
    .find({ query: { userId, transactionType: "Deposit" }, limit: 5 });

  let resData = {
    msg: "get Deposit Request successfully.",
    data,
  };
  return resData;
}

module.exports = {
  payload,
  handler,
  auth: true,
};
