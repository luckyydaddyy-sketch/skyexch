const joi = require("joi");

const mongo = require("../../../../config/mongodb");

const payload = {
  body: joi.object().keys({
    // id: joi.string().required(),
  }),
};

async function handler({ body, user }) {
  const { userId } = user;

  let contact = await mongo.bettingApp
    .model(mongo.models.contactDetails)
    .findOne({
      query: {
        userId,
      },
    });
  if (!contact) {
    contact = {};
  }
  contact.msg = "contactDetails!";

  return contact;
}

module.exports = {
  payload,
  handler,
  auth: true,
};
