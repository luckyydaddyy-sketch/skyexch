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

  // ── Level 0 (Owner) Override ──
  // If the admin level is 'O' (Owner), grant access to ALL pages/permissions
  if (role === "O") {
    const permissionFields = [
      "downline_list", "my_account", "downline_report", "market_report", "commission_report",
      "account_statement", "bet_list", "bet_list_live", "live_casino", "risk_management",
      "player_banking", "agent_banking", "sports_leage", "add_balance", "add_agent",
      "add_player", "casino_manage", "sports_main_market", "manage_fancy", "manage_website",
      "match_history", "fancy_history", "manage_premium", "premium_history", "manage_dashboard_images",
      "privileges", "banner", "manage_casino", "deletable", "marketBlock", "casinoReport",
      "bankingMethod", "onlinePaymentDeposite", "onlinePaymentWithdrawals", "surveillance",
      "whiteLablesCasinoLimit", "p2pSettings", "b2c_contact_seting"
    ];
    permissionFields.forEach(field => {
      userRole[field] = 1;
    });
    console.log(`[getRole] Level 0 (Owner) override applied for user: ${adminInfo.user_name}`);
  }

  userRole.msg = "user role details.";
  return userRole; // Return response
}

module.exports = {
  payload,
  handler,
  auth: true,
};
