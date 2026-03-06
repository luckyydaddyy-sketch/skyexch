const joi = require("joi");
const mongo = require("../../../config/mongodb");

const payload = {
  body: joi.object().keys({}),
};

async function handler({ body, user }) {
  //   const { search, type, page, limit } = body;
  const { userId } = user;
  const roles = await mongo.bettingApp.model(mongo.models.roles).find({select:{
    createdAt : 0,
    updatedAt : 0,
    __v : 0,
  }});

  const sendObject = {
    roles,
    msg: "role List!",
  };

  return sendObject;
}

module.exports = {
  payload,
  handler,
  auth: true,
};
