const joi = require("joi");

const mongo = require("../../../../config/mongodb");

const payload = {
  body: joi.object().keys({
    id: joi.string().required(),
    limit: joi.number().required(),
    page: joi.number().required(),
  }),
};

async function handler({ body, user }) {
  const { limit, page, id } = body;
  const { userId } = user;

  const query = {
    adminId: userId,
  };

  if (id && id !== "") {
    query.adminId = mongo.ObjectId(id);
  }

  const data = await mongo.bettingApp
    .model(mongo.models.withdrawals)
    .paginate({ query: query, limit, page });

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
