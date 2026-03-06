const joi = require("joi");
const httpStatus = require("http-status");

const mongo = require("../../../../config/mongodb");
const { TRANSACTION_METHOD } = require("../../../../constants");
const ApiError = require("../../../../utils/ApiError");
const CUSTOM_MESSAGE = require("../../../../utils/message");

const payload = {
  query: joi.object().keys({
    id: joi.string().required(),
  }),
};

async function handler({ query, user }) {
  const { id } = query;

  const bankDetailsData = await mongo.bettingApp
    .model(mongo.models.bankDetails)
    .findOne({
      query: {
        _id: id,
      },
    });

  if (!bankDetailsData) {
    throw new ApiError(httpStatus.BAD_REQUEST, CUSTOM_MESSAGE.RECORD_NOT_FOUND);
  }
  bankDetailsData.msg = "get method successfully!";

  return bankDetailsData;
}

module.exports = {
  payload,
  handler,
  auth: true,
};
