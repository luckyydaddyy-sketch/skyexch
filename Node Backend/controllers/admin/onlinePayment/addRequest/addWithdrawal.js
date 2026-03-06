const joi = require("joi");
const httpStatus = require("http-status");

const mongo = require("../../../../config/mongodb");
const ApiError = require("../../../../utils/ApiError");

const CUSTOM_MESSAGE = require("../../../../utils/message");
const { TRANSACTION_METHOD, ONLINE_PAYMENT } = require("../../../../constants");
const { replaceString } = require("../../../../utils/comman/replaceString");
const payload = {
  body: joi.object().keys({
    type: joi
      .string()
      .valid(
        TRANSACTION_METHOD.BANK,
        TRANSACTION_METHOD.G_PAY,
        TRANSACTION_METHOD.P_PAY,
        TRANSACTION_METHOD.UPI,
        TRANSACTION_METHOD.PAYTM,
        TRANSACTION_METHOD.bKash,
        TRANSACTION_METHOD.Rocket,
        TRANSACTION_METHOD.Nagad,
        TRANSACTION_METHOD.Ok_Wallet,
        TRANSACTION_METHOD.SureCash,
        TRANSACTION_METHOD.Upay,
        TRANSACTION_METHOD.Tap,
        TRANSACTION_METHOD.USDT_TRC20,
        TRANSACTION_METHOD.BTC,
        TRANSACTION_METHOD.Local_Bank
      )
      .required(),
    bankName: joi.string().optional().allow(""),
    userName: joi.string().optional().allow(""),
    accountNo: joi.string().required(),
    mobileNo: joi.number().optional().allow(""),
    ifscCode: joi.string().optional().allow(""),
    holderName: joi.string().optional().allow(""),
    amount: joi.number().required(),
    descrpitions: joi.string().optional().allow(""),
  }),
};

async function handler({ body, user }) {
  const { userId } = user;
  const {
    bankName,
    userName,
    accountNo,
    mobileNo,
    ifscCode,
    holderName,
    amount,
    descrpitions,
  } = body;

  const userInfo = await mongo.bettingApp.model(mongo.models.admins).findOne({
    query: {
      _id: userId,
    },
    select: {
      admin: 1,
      balance: 1,
    },
  });
  if (!userInfo) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      CUSTOM_MESSAGE.USER_ACCOUNT_NOT_EXIST
    );
  }

  if (userInfo && userInfo.balance < amount) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      CUSTOM_MESSAGE.YOU_DONT_HAVE_BALANCE
    );
  }

  const amountLimit = await mongo.bettingApp
    .model(mongo.models.contactDetails)
    .findOne({
      query: {
        userId: userInfo.admin,
      },
      select: {
        withdrow_min: 1,
        withdrow_max: 1,
      },
    });

  if (amountLimit && amountLimit?.withdrow_min > amount) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      replaceString(
        CUSTOM_MESSAGE.MINIMUM_WITHDRAWAL_LIMIT,
        "[amount]",
        amountLimit?.withdrow_min
      )
    );
  }
  if (amountLimit && amountLimit?.withdrow_max !== 0 &&amountLimit?.withdrow_max < amount) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      replaceString(
        CUSTOM_MESSAGE.MAXIMUM_WITHDRAWAL_LIMIT,
        "[amount]",
        amountLimit?.withdrow_max
      )
    );
  }

  await mongo.bettingApp.model(mongo.models.withdrawals).insertOne({
    document: {
      adminId: userId,
      bankName,
      userName,
      accountNo,
      mobileNo,
      ifscCode,
      holderName,
      amount,
      descrpitions,
      transactionType: ONLINE_PAYMENT.WITHDRAWAL
    },
  });

  let resData = {
    msg: "Withdrawal Request added successfully.",
  };
  return resData;
}

module.exports = {
  payload,
  handler,
  auth: true,
};
