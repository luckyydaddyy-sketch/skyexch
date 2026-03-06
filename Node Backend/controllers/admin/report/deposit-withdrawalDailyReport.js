const httpStatus = require("http-status");
const joi = require("joi");

const CUSTOM_MESSAGE = require("../../../utils/message");
const mongo = require("../../../config/mongodb");
const ApiError = require("../../../utils/ApiError");
const { getDate, getStartEndDateTime } = require("../../../utils/comman/date");
const { GAME_STATUS, ONLINE_PAYMENT } = require("../../../constants");
const { getAdminUserInfo } = require("../utile/getdownLineUsersList");

const payload = {
  body: joi.object().keys({
    filter: joi.string().valid("all", "today", "yesterday").optional(),
    to: joi.string().optional(),
    from: joi.string().optional(),
    id: joi.string().allow("").optional(),
    // type: joi.string().required().valid("deposit", "withdrawal"),
  }),
};

async function handler({ body, user }) {
  const { to, from, filter, id } = body;
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

  if (id && id !== "") {
    queryUsers.whoAdd = mongo.ObjectId(id);
  }
  const userIds = await mongo.bettingApp
    .model(mongo.models.users)
    .distinct({ field: "_id", query: queryUsers });

  let successfullyDeposit = 0;
  let rejectedDeposit = 0;
  let pendingDeposit = 0;
  let successfullyWithdraw = 0;
  let rejectedWithdraw = 0;
  let pendingWithdraw = 0;

  query.userId = { $in: userIds };
  const successfullyDepositDetail = await mongo.bettingApp
    .model(mongo.models.withdrawals)
    .find({
      query: {
        ...query,
        transactionType: {
          $in: [ONLINE_PAYMENT.DEPOSIT, ONLINE_PAYMENT.OFFLINE_DEPOSIT],
        },
        isApprove: true,
        approvalBy: { $ne: null },
      },
    });

  console.log("successfullyDepositDetail:: ", successfullyDepositDetail);

  if (successfullyDepositDetail.length)
    successfullyDeposit = successfullyDepositDetail.reduce((sum, info) => {
      return sum + info.amount;
    }, 0);

  const rejectedDepositDetail = await mongo.bettingApp
    .model(mongo.models.withdrawals)
    .find({
      query: {
        ...query,
        transactionType: ONLINE_PAYMENT.DEPOSIT,
        isApprove: false,
        approvalBy: { $ne: null },
      },
    });

  if (rejectedDepositDetail.length)
    rejectedDeposit = rejectedDepositDetail.reduce((sum, info) => {
      return sum + info.amount;
    }, 0);

  const pendingDepositDetail = await mongo.bettingApp
    .model(mongo.models.withdrawals)
    .find({
      query: {
        ...query,
        transactionType: ONLINE_PAYMENT.DEPOSIT,
        isApprove: false,
        approvalBy: null,
      },
    });

  if (pendingDepositDetail.length)
    pendingDeposit = pendingDepositDetail.reduce((sum, info) => {
      return sum + info.amount;
    }, 0);

  const successfullyWithdrawalDetail = await mongo.bettingApp
    .model(mongo.models.withdrawals)
    .find({
      query: {
        ...query,
        transactionType: {
          $in: [ONLINE_PAYMENT.WITHDRAWAL, ONLINE_PAYMENT.OFFLINE_WITHDRAWAL],
        },
        isApprove: true,
        approvalBy: { $ne: null },
      },
    });

  if (successfullyWithdrawalDetail.length)
    successfullyWithdraw = successfullyWithdrawalDetail.reduce((sum, info) => {
      return sum + info.amount;
    }, 0);

  const rejectedWithdrawalDetail = await mongo.bettingApp
    .model(mongo.models.withdrawals)
    .find({
      query: {
        ...query,
        transactionType: ONLINE_PAYMENT.WITHDRAWAL,
        isApprove: false,
        approvalBy: { $ne: null },
      },
    });

  if (rejectedWithdrawalDetail.length)
    rejectedWithdraw = rejectedWithdrawalDetail.reduce((sum, info) => {
      return sum + info.amount;
    }, 0);

  const pendingWithdrawalDetail = await mongo.bettingApp
    .model(mongo.models.withdrawals)
    .find({
      query: {
        ...query,
        transactionType: ONLINE_PAYMENT.WITHDRAWAL,
        isApprove: false,
        approvalBy: null,
      },
    });

  if (pendingWithdrawalDetail.length)
    pendingWithdraw = pendingWithdrawalDetail.reduce((sum, info) => {
      return sum + info.amount;
    }, 0);

  const sendObject = {
    successfullyDeposit,
    rejectedDeposit,
    pendingDeposit,
    successfullyWithdraw,
    rejectedWithdraw,
    pendingWithdraw,
    msg: "Deposit/withdrawal report!",
  };

  return sendObject;
}

module.exports = {
  payload,
  handler,
  auth: true,
};
