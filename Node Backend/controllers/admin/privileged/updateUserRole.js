const joi = require("joi");
const mongo = require("../../../config/mongodb");

const payload = {
  body: joi
    .object()
    .keys({
      id: joi.string().required(),
    })
    .unknown(true),
};

async function handler({ body, user }) {
  const { id, update } = body;
  const { userId } = user;

  delete update.name;
  delete update._id;

  console.log("role update body :: ", body);
  const roles = await mongo.bettingApp.model(mongo.models.roles).find({});

  await mongo.bettingApp.model(mongo.models.roles).updateOne({query:{
    _id : id
  },update:{
    ...update
  }});

  const sendObject = {
    roles,
    msg: "update role List!",
  };

  return sendObject;
}

module.exports = {
  payload,
  handler,
  auth: true,
};
