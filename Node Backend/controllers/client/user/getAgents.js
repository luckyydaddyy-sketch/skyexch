const joi = require("joi");
const httpStatus = require("http-status");
var randomstring = require("randomstring");

const mongo = require("../../../config/mongodb");
const ApiError = require("../../../utils/ApiError");
const auth = require("../../../utils/auth");
const CUSTOM_MESSAGE = require("../../../utils/message");
const { USER_LEVEL_NEW } = require("../../../constants");

const payload = {
  body: joi.object().keys({}),
};

async function handler({ body }) {
  const intTemp = Math.floor(Math.random() * 3);
  let sort = { user_name: -1 };

  if (intTemp === 1) {
    sort = { user_name: -1 };
  } else if (intTemp === 2) {
    sort = { updatedAt: -1 };
  } else if (intTemp === 0) {
    sort = { createdAt: -1 };
  }
  let agentInfo = await mongo.bettingApp.model(mongo.models.admins).find({
    query: {
      agent_level: USER_LEVEL_NEW.M,
      status: "active",
    },
    select: {
      user_name: 1,
    },
    sort,
  });

  let resData = {
    agentInfo,
    msg: "refer agent ids.",
  };
  return resData; // Return response
}

module.exports = {
  payload,
  handler,
  auth: false,
};
