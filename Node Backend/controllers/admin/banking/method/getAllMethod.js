const joi = require("joi");

const mongo = require("../../../../config/mongodb");
const { TRANSACTION_METHOD } = require("../../../../constants");

const payload = {
  query: joi.object().keys({
    limit: joi.number().required(),
    page: joi.number().required(),
  }),
};

async function handler({ query, user }) {
  const { userId } = user;
  const { limit, page } = query;

  const bankDetailsData = await mongo.bettingApp
    .model(mongo.models.bankDetails)
    .paginate({
      query: { userId },
      limit,
      page,
    });

  bankDetailsData.msg = "get method successfully!";

  return bankDetailsData;
}

module.exports = {
  payload,
  handler,
  auth: true,
};
