const joi = require("joi");
const httpStatus = require("http-status");

const mongo = require("../../../config/mongodb");
const ApiError = require("../../../utils/ApiError");
const CUSTOM_MESSAGE = require("../../../utils/message");

const payload = {
  body: joi.object().keys({}),
};

async function handler({ body, user }) {
  let { userId } = user;
  let userData = await mongo.bettingApp.model(mongo.models.users).findOne({
    query: {
      _id: userId,
    },
    select: {
      password: 0,
    },
  });
  if (!userData || userData == null) {
    //Check for above developer record
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      CUSTOM_MESSAGE.USER_ACCOUNT_NOT_EXIST
    );
  }

  userData.commissionAmount =
    userData.commissionAmount === 0
      ? userData.commissionAmount
      : Number(userData.commissionAmount.toFixed(2));
  userData.balance =
    userData.balance === 0
      ? userData.balance
      : Number(userData.balance.toFixed(2));
  userData.remaining_balance =
    userData.remaining_balance === 0
      ? userData.remaining_balance
      : Number(userData.remaining_balance.toFixed(2));
  userData.exposure =
    userData.exposure === 0
      ? userData.exposure
      : Number(userData.exposure.toFixed(2));
  userData.cumulative_pl =
    userData.cumulative_pl === 0
      ? userData.cumulative_pl
      : Number(userData.cumulative_pl.toFixed(2));
  userData.ref_pl =
    userData.ref_pl === 0
      ? userData.ref_pl
      : Number(userData.ref_pl.toFixed(2));
  userData.credit_ref =
    userData.credit_ref === 0
      ? userData.credit_ref
      : Number(userData.credit_ref.toFixed(2));
  userData.msg = "Profile info get.";
  return userData; // Return response
}

module.exports = {
  payload,
  handler,
  auth: true,
};
