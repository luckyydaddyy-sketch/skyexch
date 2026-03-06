const joi = require("joi");

const mongo = require("../../../../config/mongodb");
const httpStatus = require("http-status");
const CUSTOM_MESSAGE = require("../../../../utils/message");
const {
  sendUpdateBalanceEvent,
  sendUpdateBalanceEventToAdmin,
  sendDepositWithdrawaCounter,
} = require("../../../../utils/comman/updateBalance");
const {
  playerStatement,
  agentStatement,
} = require("../../../utils/statementTrack");
const ApiError = require("../../../../utils/ApiError");
const { createInbox } = require("../../../utils/inbox/createInbox");
const { INBOX_MESSAGE } = require("../../../../constants");
const { replaceString } = require("../../../../utils/comman/replaceString");
const config = require("../../../../config/config");

const payload = {
  body: joi.object().keys({
    id: joi.string().required(),
    isApprove: joi.boolean().required(),
  }),
};

async function handler({ body, user }) {
  const isApproveAdminPay = config.isOnlyPlayerDepositWithdrawa;
  const { userId } = user;
  const { id, isApprove } = body;

  const depositDetails = await mongo.bettingApp
    .model(mongo.models.withdrawals)
    .findOne({
      query: { _id: mongo.ObjectId(id), isApprove: false, approvalBy: null },
    });

  if (!depositDetails)
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      CUSTOM_MESSAGE.REQUEST_ALREADY_APPROVED
    );

  const userInfo = await mongo.bettingApp.model(mongo.models.users).findOne({
    query: {
      _id: depositDetails.userId,
    },
    select: {
      _id: 1,
      admin: 1,
    },
  });

  const adminInfo = await mongo.bettingApp.model(mongo.models.admins).findOne({
    query: {
      _id: isApproveAdminPay ? userId : userInfo.admin,
    },
    select: {
      remaining_balance: 1,
    },
  });
  let title = "";
  let message = "";

  if (isApprove && (isApprove === true || isApprove === "true")) {
    title = INBOX_MESSAGE.TITLE.DEPOSIT_APPROVED;
    message = replaceString(
      INBOX_MESSAGE.MESSAGE.DEPOSIT_APPROVED,
      "[amount]",
      depositDetails.amount
    );
    if (adminInfo.remaining_balance < depositDetails.amount) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        CUSTOM_MESSAGE.YOU_DONT_HAVE_BALANCE
      );
    }

    const type = "player";

    const userSta = {
      userId: depositDetails.userId,
      credit: depositDetails.amount,
      remark: "online Deposit",
      type,
      from: adminInfo._id,
      to: depositDetails.userId,
      fromModel: "admins",
      toModel: "users",
      balance: 0,
    };

    const updateUser = {
      $inc: {
        balance: depositDetails.amount,
        remaining_balance: depositDetails.amount,
      },
    };

    const agentSta = {
      userId: adminInfo._id,
      debit: depositDetails.amount,
      remark: "online Deposit",
      type,
      from: adminInfo._id,
      to: depositDetails.userId,
      fromModel: "admins",
      toModel: "users",
      balance: 0,
    };
    const updateAdmin = {
      $inc: {
        remaining_balance: -depositDetails.amount,
      },
    };

    await mongo.bettingApp.model(mongo.models.users).updateOne({
      query: { _id: depositDetails.userId },
      update: updateUser,
    });

    await mongo.bettingApp.model(mongo.models.admins).updateOne({
      query: {
        _id: adminInfo._id,
      },
      update: updateAdmin,
    });

    sendUpdateBalanceEvent(depositDetails.userId, "");
    sendUpdateBalanceEventToAdmin(adminInfo._id, "");
    await playerStatement(userSta);
    await agentStatement(agentSta);
  } else {
    title = INBOX_MESSAGE.TITLE.DEPOSIT_REJECTED;
    message = replaceString(
      INBOX_MESSAGE.MESSAGE.DEPOSIT_REJECTED,
      "[amount]",
      depositDetails.amount
    );
  }

  await createInbox(userInfo._id, title, message);
  const bankDetailsData = await mongo.bettingApp
    .model(mongo.models.withdrawals)
    .updateOne({
      query: { _id: id },
      update: {
        approvalBy: userId,
        isApprove,
      },
    });
  await sendDepositWithdrawaCounter(adminInfo._id);

  bankDetailsData.msg = "deposit request update successfully!";

  return bankDetailsData;
}

module.exports = {
  payload,
  handler,
  auth: true,
};
