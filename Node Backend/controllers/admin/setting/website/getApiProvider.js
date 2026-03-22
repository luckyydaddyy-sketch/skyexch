const joi = require("joi");
const mongo = require("../../../../config/mongodb");

const payload = {
  body: joi.object().keys({}),
};

async function handler({ body, user }) {
  let providerInfo = await mongo.bettingApp
    .model(mongo.models.apiProviders)
    .findOne({});

  if (!providerInfo) {
    providerInfo = {
      activeSportsProvider: "FASTODDS",
      activeCasinoProvider: "AWC"
    };
  }

  const sendObject = {
    providerInfo,
    msg: "Get API Provider Success!",
  };

  return sendObject;
}

module.exports = {
  payload,
  handler,
  auth: true,
};
