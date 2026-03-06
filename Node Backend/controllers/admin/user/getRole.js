const joi = require("joi");
const httpStatus = require("http-status");

const mongo = require("../../../config/mongodb");
const ApiError = require("../../../utils/ApiError");
const auth = require("../../../utils/auth");
const CUSTOM_MESSAGE = require("../../../utils/message");
const { ONLINE_PAYMENT } = require("../../../constants");
const config = require("../../../config/config");

const payload = {
  body: joi.object().keys({}),
};

async function handler({ user }) {
  const { role, userId } = user;
  const isOnlyPlayerDepositWithdrawa = config.isOnlyPlayerDepositWithdrawa;
  const adminInfo = await mongo.bettingApp.model(mongo.models.admins).findOne({
    query: {
      _id: userId,
    },
    select: {
      remaining_balance: 1,
      user_name: 1,
      player: 1,
    },
  });

  console.log(role);
  let userRole = await mongo.bettingApp.model(mongo.models.roles).findOne({
    query: {
      name: role,
    },
    select: {
      _id: 0,
    },
  });
  if (!userRole)
    // Check for above
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      CUSTOM_MESSAGE.USER_ROLE_DETAILS_NOT_FOUND
    );

  const userIds = await mongo.bettingApp.model(mongo.models.users).distinct({
    query: {
      whoAdd: adminInfo._id,
    },
    field: "_id",
  });

  const depositeCount = await mongo.bettingApp
    .model(mongo.models.withdrawals)
    .countDocuments({
      query: {
        isApprove: false,
        approvalBy: null,
        userId: {
          $in: isOnlyPlayerDepositWithdrawa ? userIds : adminInfo?.player,
        },
        transactionType: ONLINE_PAYMENT.DEPOSIT,
      },
    });
  const withdrawaCount = await mongo.bettingApp
    .model(mongo.models.withdrawals)
    .countDocuments({
      query: {
        isApprove: false,
        approvalBy: null,
        userId: {
          $in: isOnlyPlayerDepositWithdrawa ? userIds : adminInfo?.player,
        },
        transactionType: ONLINE_PAYMENT.WITHDRAWAL,
      },
    });
  userRole.remaining_balance = Number(adminInfo.remaining_balance.toFixed(2));
  userRole.user_name = adminInfo.user_name;
  userRole.depositeCount = depositeCount;
  userRole.withdrawaCount = withdrawaCount;
  userRole.msg = "user role details.";
  return userRole; // Return response
}

module.exports = {
  payload,
  handler,
  auth: true,
};
