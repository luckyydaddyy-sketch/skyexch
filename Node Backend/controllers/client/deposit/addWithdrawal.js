const joi = require("joi");
const httpStatus = require("http-status");

const mongo = require("../../../config/mongodb");
const ApiError = require("../../../utils/ApiError");

const CUSTOM_MESSAGE = require("../../../utils/message");
const { TRANSACTION_METHOD, ONLINE_PAYMENT } = require("../../../constants");
const {
  sendDepositWithdrawaCounter,
  sendUpdateBalanceEvent,
} = require("../../../utils/comman/updateBalance");
const { replaceString } = require("../../../utils/comman/replaceString");
const { playerStatement } = require("../../utils/statementTrack");

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
    accountNo: joi.string().required().allow(""),
    mobileNo: joi.number().optional().allow(""),
    ifscCode: joi.string().optional().allow(""),
    holderName: joi.string().optional().allow(""),
    amount: joi.number().required(),
    bankId: joi.string().required(),
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
    bankId,
    type,
  } = body;

  const userInfo = await mongo.bettingApp.model(mongo.models.users).findOne({
    query: {
      _id: userId,
    },
    select: {
      admin: 1,
      balance: 1,
      whoAdd: 1,
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
        userId: { $in: userInfo.whoAdd },
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
  if (
    amountLimit &&
    amountLimit?.withdrow_max !== 0 &&
    amountLimit?.withdrow_max < amount
  ) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      replaceString(
        CUSTOM_MESSAGE.MAXIMUM_WITHDRAWAL_LIMIT,
        "[amount]",
        amountLimit?.withdrow_max
      )
    );
  }

  const withdrawData = await mongo.bettingApp
    .model(mongo.models.withdrawals)
    .insertOne({
      document: {
        userId,
        bankName,
        userName,
        accountNo,
        mobileNo,
        ifscCode,
        holderName,
        amount,
        descrpitions,
        transactionType: ONLINE_PAYMENT.WITHDRAWAL,
        bankId,
        type,
      },
    });
  console.log("withdrawData :: ", withdrawData);
  console.log("withdrawData :tempData: ", withdrawData?._id);

  const userSta = {
    userId: withdrawData.userId,
    debit: withdrawData.amount,
    remark: "Withdrawal by player is pending for approval.",
    type: "player",
    to: userInfo.admin,
    from: withdrawData.userId,
    fromModel: "users",
    toModel: "admins",
    balance: 0,
    withdrawalsId: withdrawData?._id,
  };
  const updateUser = {
    $inc: {
      balance: -withdrawData.amount,
      remaining_balance: -withdrawData.amount,
    },
  };
  await mongo.bettingApp.model(mongo.models.users).updateOne({
    query: { _id: withdrawData.userId },
    update: updateUser,
  });
  await playerStatement(userSta);
  sendUpdateBalanceEvent(withdrawData.userId, "");
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
