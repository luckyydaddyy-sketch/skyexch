const httpStatus = require("http-status");
const joi = require("joi");

const CUSTOM_MESSAGE = require("../../../utils/message");
const mongo = require("../../../config/mongodb");
const ApiError = require("../../../utils/ApiError");
const { getDate, getStartEndDateTime } = require("../../../utils/comman/date");
const { GAME_STATUS } = require("../../../constants");
const { getAdminUserInfo } = require("../utile/getdownLineUsersList");

const payload = {
  body: joi.object().keys({
    filter: joi.string().valid("all", "today", "yesterday").optional(),
    to: joi.string().optional(),
    from: joi.string().optional(),
    type: joi.string().required().valid("deposit", "withdrawal"),
  }),
};

async function handler({ body, user }) {
  const { to, from, filter, type } = body;
  const { userId } = user;

  const query = {};
  const queryUsers = {
    whoAdd: userId,
  };

  if (to && from) {
    const { endDate, startDate } = getStartEndDateTime(from, to);

    query.createdAt = {
      $gte: startDate,
      $lte: endDate,
    };
  }
  let amountInfo = [];
  let total = 0;
  const userIds = await mongo.bettingApp
    .model(mongo.models.users)
    .distinct({ field: "_id", query: queryUsers });
  query.userId = { $in: userIds };
  if (type === "deposit") {
    amountInfo = await mongo.bettingApp.model(mongo.models.withdrawals).paginate({
      query,
      populate: {
        path: "userId",
        model: await mongo.bettingApp.model(mongo.models.users),
        select: ["agent_level", "user_name"],
      },
      limit:50
    });

    if (amountInfo.length)
      total = amountInfo.reduce((sum, info) => {
        return sum + Number(info.amount);
      },0);
  } else {
    amountInfo = await mongo.bettingApp.model(mongo.models.withdrawals).paginate({
      query,
      populate: {
        path: "userId",
        model: await mongo.bettingApp.model(mongo.models.users),
        select: ["agent_level", "user_name"],
      },
      limit:50
    });
    if (amountInfo.length)
      total = amountInfo.reduce((sum, info) => {
        return sum + Number(info.amount);
      },0);
  }

  console.log("total :: ", total);
  
  const sendObject = {
    total,
    amountInfo,
    msg: "Deposit/withdrawal report!",
  };

  return sendObject;
}

module.exports = {
  payload,
  handler,
  auth: true,
};
