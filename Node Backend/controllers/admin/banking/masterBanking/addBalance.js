const joi = require("joi");
const httpStatus = require("http-status");

const mongo = require("../../../../config/mongodb");
const { agentStatement } = require("../../../utils/statementTrack");
const { USER_LEVEL_NEW } = require("../../../../constants");
const ApiError = require("../../../../utils/ApiError");
const CUSTOM_MESSAGE = require("../../../../utils/message");

const payload = {
  body: joi.object().keys({
    amount: joi.number().required(),
  }),
};

async function handler({ body, user }) {
  const { userId, role } = user;
  if(role !== USER_LEVEL_NEW.COM){
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      CUSTOM_MESSAGE.SOMETHING_WENT_WRONG
    );
  }
  const { amount } = body;
  const adminInfo = await mongo.bettingApp
    .model(mongo.models.admins)
    .updateOne({
      query: {
        _id: userId,
      },
      update: {
        $inc: { balance: amount, remaining_balance: amount },
      },
    });

  await agentStatement({
    userId,
    credit: amount,
    remark: "Deposit",
  });
  adminInfo.msg = "update admin balance!";

  return adminInfo;
}

module.exports = {
  payload,
  handler,
  auth: true,
};
