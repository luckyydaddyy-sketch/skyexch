const joi = require("joi");
const httpStatus = require("http-status");
const mongo = require("../../config/mongodb");
const CUSTOM_MESSAGE = require("../../utils/message");
const ApiError = require("../../utils/ApiError");

const payload = {
  body: joi.object().keys({}),
};

async function handler(req, res) {
  let { key, message } = req.body;

  message = typeof message === "string" ? JSON.parse(message) : message;
  console.log("get balance : message:: ", message);
  console.log("get balance : key :: ", key);
  console.log("get balance : casinoUserName :: ");

  const { userId } = message;
  //   {
  //     action, userId
  //   }

  let userInfo = await mongo.bettingApp.model(mongo.models.users).findOne({
    // Find user information
    query: {
      $or: [
        { casinoUserName: { $regex: `^${userId}$`, $options: "i" } },
        { user_name: { $regex: `^${userId}$`, $options: "i" } },
      ],
    },
    select: {
      balance: 1,
      remaining_balance: 1,
      exposure: 1,
    },
  });

  if (!userInfo) {
    res.send({
      status: "1000",
      desc: "Invalid user Id",
    });
    // Check for above user data
    throw new ApiError(httpStatus.BAD_REQUEST, CUSTOM_MESSAGE.USER_NOT_FOUND);
  }

  const sendData = {
    status: "0000",
    desc: "",
    balance: Number(userInfo.balance.toFixed(4)),
    balanceTs: new Date(),
    userId, // max 16 character
  };

  res.send(sendData);
}

module.exports = {
  payload,
  handler,
};

