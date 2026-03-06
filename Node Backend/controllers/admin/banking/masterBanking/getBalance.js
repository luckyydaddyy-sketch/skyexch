const joi = require("joi");

const mongo = require("../../../../config/mongodb");

const payload = {
  query: joi.object().keys({}),
};

async function handler({ user }) {
  const { userId } = user;
  const adminInfo = await mongo.bettingApp.model(mongo.models.admins).findOne({
    query: {
      _id: userId,
    },
    select: {
      remaining_balance: 1,
    },
  });

  adminInfo.msg = "admin balance!";

  return adminInfo;
}

module.exports = {
  payload,
  handler,
  auth: true,
};
