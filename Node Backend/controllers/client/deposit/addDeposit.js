const joi = require("joi");
const httpStatus = require("http-status");
var randomstring = require("randomstring");

const mongo = require("../../../config/mongodb");
const ApiError = require("../../../utils/ApiError");
const auth = require("../../../utils/auth");
const CUSTOM_MESSAGE = require("../../../utils/message");
const { ONLINE_PAYMENT, TRANSACTION_METHOD } = require("../../../constants");
const { replaceString } = require("../../../utils/comman/replaceString");
const {
  sendDepositWithdrawaCounter,
} = require("../../../utils/comman/updateBalance");

const payload = {
  body: joi
    .object()
    .keys({
      userName: joi.string().required(),
      mobileNo: joi.number().required(),
      transactionId: joi.string().required(),
      amount: joi.number().required(),
      accountNo: joi.number().required(),
      bankId: joi.string().required(),
      // image: joi.string().required(),
    })
    .unknown(true),
};

async function handler({ body, user, file }) {
  const { userId } = user;
  const { userName, mobileNo, transactionId, amount, bankId, accountNo } = body;

  const traDetail = await mongo.bettingApp
    .model(mongo.models.withdrawals)
    .findOne({
      query: {
        transactionId,
      },
    });

  if (traDetail) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      CUSTOM_MESSAGE.TRANSACTION_ID_REQUEST_ALREADY_AVAILABLE
    );
  }
  // const { filename } = file;
  const userInfo = await mongo.bettingApp.model(mongo.models.users).findOne({
    query: {
      _id: userId,
    },
    select: {
      admin: 1,
      whoAdd: 1,
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
        userId: { $in: userInfo.whoAdd },
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
  if (
    amountLimit &&
    amountLimit?.deposit_max !== 0 &&
    amountLimit?.deposit_max < amount
  ) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      replaceString(
        CUSTOM_MESSAGE.MAXIMUM_DEPOSIT_LIMIT,
        "[amount]",
        amountLimit?.deposit_max
      )
    );
  }

  const bankDetails = await mongo.bettingApp
    .model(mongo.models.bankDetails)
    .findOne({
      _id: mongo.ObjectId(bankId),
    });
  await mongo.bettingApp.model(mongo.models.withdrawals).insertOne({
    document: {
      userId,
      userName,
      mobileNo,
      transactionId,
      amount,
      image: file?.filename || "",
      bankId,
      accountNo,
      transactionType: ONLINE_PAYMENT.DEPOSIT,
      type: bankDetails ? bankDetails.type : TRANSACTION_METHOD.BANK,
    },
  });

  await sendDepositWithdrawaCounter(userInfo.admin);
  let resData = {
    msg: "Your Payments Request Create Sucessfully.",
  };
  return resData;
}

module.exports = {
  payload,
  handler,
  auth: true,
};
