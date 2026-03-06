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
  removeStatementTrackWithdrawal,
  updateStatementRemark,
} = require("../../../utils/statementTrack");
const ApiError = require("../../../../utils/ApiError");
const { INBOX_MESSAGE } = require("../../../../constants");
const { replaceString } = require("../../../../utils/comman/replaceString");
const { createInbox } = require("../../../utils/inbox/createInbox");
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
      query: { _id: id, isApprove: false, approvalBy: null },
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
      balance: 1,
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
    title = INBOX_MESSAGE.TITLE.WITHDRAWAL_APPROVED;
    message = replaceString(
      INBOX_MESSAGE.MESSAGE.WITHDRAWAL_APPROVED,
      "[amount]",
      depositDetails.amount
    );
    // if (userInfo.balance < depositDetails.amount) {
    //   throw new ApiError(
    //     httpStatus.BAD_REQUEST,
    //     CUSTOM_MESSAGE.YOU_DONT_HAVE_BALANCE
    //   );
    // }

    const type = "player";

    const userSta = {
      userId: depositDetails.userId,
      debit: depositDetails.amount,
      remark: "Withdrawal by player",
      type,
      to: userId,
      from: depositDetails.userId,
      fromModel: "users",
      toModel: "admins",
      balance: 0,
      withdrawalsId: depositDetails._id,
    };

    // const updateUser = {
    //   $inc: {
    //     balance: -depositDetails.amount,
    //     remaining_balance: -depositDetails.amount,
    //   },
    // };

    const agentSta = {
      userId: adminInfo._id,
      credit: depositDetails.amount,
      remark: "Withdrawal by player",
      type,
      to: adminInfo._id,
      from: depositDetails.userId,
      fromModel: "users",
      toModel: "admins",
      balance: 0,
    };
    const updateAdmin = {
      $inc: {
        remaining_balance: depositDetails.amount,
      },
    };

    // await mongo.bettingApp.model(mongo.models.users).updateOne({
    //   query: { _id: depositDetails.userId },
    //   update: updateUser,
    // });

    await mongo.bettingApp.model(mongo.models.admins).updateOne({
      query: {
        _id: adminInfo._id,
      },
      update: updateAdmin,
    });

    sendUpdateBalanceEventToAdmin(adminInfo._id, "");
    await updateStatementRemark(userSta);
    await agentStatement(agentSta);
  } else {
    title = INBOX_MESSAGE.TITLE.WITHDRAWAL_REJECTED;
    message = replaceString(
      INBOX_MESSAGE.MESSAGE.WITHDRAWAL_REJECTED,
      "[amount]",
      depositDetails.amount
    );

    const isBackAmount = await removeStatementTrackWithdrawal({
      userId: depositDetails?.userId.toString(),
      withdrawalsId: depositDetails?._id.toString(),
      amount: depositDetails.amount,
    });
  }
  sendUpdateBalanceEvent(depositDetails.userId, "");
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

  bankDetailsData.msg = "withdrawal request update successfully!";

  return bankDetailsData;
}

module.exports = {
  payload,
  handler,
  auth: true,
};
