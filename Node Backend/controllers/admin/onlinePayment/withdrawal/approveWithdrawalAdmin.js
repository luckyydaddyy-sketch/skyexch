const joi = require("joi");

const mongo = require("../../../../config/mongodb");
const httpStatus = require("http-status");
const CUSTOM_MESSAGE = require("../../../../utils/message");
const {
  sendUpdateBalanceEvent,
  sendUpdateBalanceEventToAdmin,
} = require("../../../../utils/comman/updateBalance");
const {
  playerStatement,
  agentStatement,
} = require("../../../utils/statementTrack");
const ApiError = require("../../../../utils/ApiError");

const payload = {
  body: joi.object().keys({
    id: joi.string().required(),
    isApprove: joi.boolean().required(),
  }),
};

async function handler({ body, user }) {
  const { userId } = user;
  const { id, isApprove } = body;

  if (isApprove && (isApprove === true || isApprove === "true")) {
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

    const userInfo = await mongo.bettingApp.model(mongo.models.admins).findOne({
      query: {
        _id: depositDetails.adminId,
      },
      select: {
        admin: 1,
        balance: 1,
        remaining_balance: 1,
      },
    });

    const adminInfo = await mongo.bettingApp
      .model(mongo.models.admins)
      .findOne({
        query: {
          _id: userInfo.admin,
        },
        select: {
          remaining_balance: 1,
        },
      });

    if (userInfo.remaining_balance < depositDetails.amount) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        CUSTOM_MESSAGE.YOU_DONT_HAVE_BALANCE
      );
    }

    const type = "agent";

    const userSta = {
      userId: depositDetails.adminId,
      debit: depositDetails.amount,
      remark: "online Withdrawal",
      type,
      to: userId,
      from: depositDetails.adminId,
      fromModel: "admins",
      toModel: "admins",
      balance: 0,
    };

    const updateUser = {
      $inc: {
        balance: -depositDetails.amount,
        remaining_balance: -depositDetails.amount,
      },
    };

    const agentSta = {
      userId: adminInfo._id,
      credit: depositDetails.amount,
      remark: "online Withdrawal",
      type,
      to: adminInfo._id,
      from: depositDetails.adminId,
      fromModel: "admins",
      toModel: "admins",
      balance: 0,
    };
    const updateAdmin = {
      $inc: {
        remaining_balance: depositDetails.amount,
      },
    };

    await mongo.bettingApp.model(mongo.models.admins).updateOne({
      query: { _id: depositDetails.adminId },
      update: updateUser,
    });

    await mongo.bettingApp.model(mongo.models.admins).updateOne({
      query: {
        _id: adminInfo._id,
      },
      update: updateAdmin,
    });

    sendUpdateBalanceEvent(depositDetails.adminId, "");
    sendUpdateBalanceEventToAdmin(adminInfo._id, "");
    await agentStatement(userSta);
    await agentStatement(agentSta);
  }

  const bankDetailsData = await mongo.bettingApp
    .model(mongo.models.withdrawals)
    .updateOne({
      query: { _id: id },
      update: {
        approvalBy: userId,
        isApprove,
      },
    });

  bankDetailsData.msg = "withdrawal request update successfully!";

  return bankDetailsData;
}

module.exports = {
  payload,
  handler,
  auth: true,
};
