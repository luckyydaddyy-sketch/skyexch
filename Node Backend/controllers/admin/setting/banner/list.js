const joi = require("joi");

const mongo = require("../../../../config/mongodb");
const { USER_LEVEL_NEW } = require("../../../../constants");

const payload = {
  body: joi.object().keys({
    domain: joi.string().required(),
    page: joi.number().required(),
    limit: joi.number().required(),
  }),
};

async function handler({ body, user }) {
  const { page, limit, domain } = body;
  const {userId, role} = user

  const query = {
    domain
  }
  if(role === USER_LEVEL_NEW.M){
    query.admin = userId
  }

  const banner = await mongo.bettingApp.model(mongo.models.banners).paginate({
    query: query,
    page,
    limit,
    sort: { sort: 1 },
  });

  banner.msg = "list of banner Images!";

  return banner;
}

module.exports = {
  payload,
  handler,
  auth: true,
};
