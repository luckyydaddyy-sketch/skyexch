const joi = require("joi");

const mongo = require("../../../../config/mongodb");

const payload = {
  body: joi.object().keys({}),
};

async function handler({ body, user }) {
  const siteInfo = await mongo.bettingApp
    .model(mongo.models.deafultSetting)
    .findOne({});

  const sendObject = {
    siteInfo,
    msg: "get deafult setting Success!",
  };

  return sendObject;
}

module.exports = {
  payload,
  handler,
  auth: true,
};
