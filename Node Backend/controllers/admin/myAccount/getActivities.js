const joi = require("joi");

const mongo = require("../../../config/mongodb");

const payload = {
  body: joi.object().keys({
    page: joi.number().required(),
    limit: joi.number().required(),
    id: joi.string().optional(),
  }),
};

async function handler({ body, user }) {
  const { id, page, limit } = body;
  const { userId } = user;

  const query = {
    userId,
  };

  if (id) query.userId = id;
  const userActivitie = await mongo.bettingApp
    .model(mongo.models.activities)
    .paginate({
      query,
      page,
      limit,
      sort: {createdAt : -1}
    });

  const sendObject = {
    userActivitie,
    msg: "account activities!",
  };

  return sendObject;
}

module.exports = {
  payload,
  handler,
  auth: true,
};
