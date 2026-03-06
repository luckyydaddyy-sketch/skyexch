const joi = require("joi");
const httpStatus = require("http-status");
var randomstring = require("randomstring");

const mongo = require("../../../../config/mongodb");
const ApiError = require("../../../../utils/ApiError");
const auth = require("../../../../utils/auth");
const CUSTOM_MESSAGE = require("../../../../utils/message");
const { ONLINE_PAYMENT } = require("../../../../constants");
const { replaceString } = require("../../../../utils/comman/replaceString");

const payload = {
  body: joi.object().keys({
    userName: joi.string().required(),
    mobileNo: joi.number().required(),
    transactionId: joi.string().required(),
    amount: joi.number().required(),
    accountNo: joi.number().required(),
    bankId: joi.string().required(),
    // image: joi.string().required(),
  }),
};

async function handler({ body, user, file }) {
  const { userId } = user;
  const { userName, mobileNo, transactionId, amount, bankId, accountNo } = body;
  const userInfo = await mongo.bettingApp.model(mongo.models.admins).findOne({
    query: {
      _id: userId,
    },
    select: {
      admin: 1,
    },
  });
  if (!userInfo) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      CUSTOM_MESSAGE.USER_ACCOUNT_NOT_EXIST
    );
  }

  const amountLimit = await mongo.bettingApp
    .model(mongo.models.contactDetails)
    .findOne({
      query: {
        userId: userInfo.admin,
      },
      select: {
        deposit_min: 1,
        deposit_max: 1,
      },
    });

  if (amountLimit && amountLimit?.deposit_min > amount) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      replaceString(
        CUSTOM_MESSAGE.MINIMUM_DEPOSIT_LIMIT,
        "[amount]",
        amountLimit?.deposit_min
      )
    );
  }
  if (amountLimit && amountLimit?.deposit_max !== 0 && amountLimit?.deposit_max < amount) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      replaceString(
        CUSTOM_MESSAGE.MAXIMUM_DEPOSIT_LIMIT,
        "[amount]",
        amountLimit?.deposit_max
      )
    );
  }
  console.log("Deposit file ::: ", file);
  
  await mongo.bettingApp.model(mongo.models.withdrawals).insertOne({
    document: {
      adminId:userId,
      userName,
      mobileNo,
      transactionId,
      amount,
      image: typeof file !== "undefined" ? file.filename : "",
      bankId,
      accountNo,
      transactionType: ONLINE_PAYMENT.DEPOSIT,
    },
  });

  let resData = {
    msg: "Deposit Request added successfully.",
  };
  return resData;
}

module.exports = {
  payload,
  handler,
  auth: true,
};
