const joi = require("joi");
// Triggering CI/CD deployment for verification
const httpStatus = require("http-status");

const mongo = require("../../../config/mongodb");
const ApiError = require("../../../utils/ApiError");
const auth = require("../../../utils/auth");
const config = require("../../../config/config");
const CUSTOM_MESSAGE = require("../../../utils/message");
const eventEmitter = require("../../../eventEmitter");
const {
  EVENTS,
  USER_LEVEL_NEW,
  ONLINE_PAYMENT,
} = require("../../../constants");

const payload = {
  body: joi.object().keys({
    user_name: joi.string().required(),
    password: joi.string().required(),
    browser_detail: joi.string().optional(),
    systemDetail: joi.string().optional(),
    ISP: joi.string().allow("", null).optional(),
    city: joi.string().allow("", null).optional(),
    state: joi.string().allow("", null).optional(),
    country: joi.string().allow("", null).optional(),
    domain: joi.string().optional(),
  }),
};

async function handler({ body, user }) {
  let {
    user_name,
    password,
    browser_detail,
    systemDetail,
    city,
    state,
    country,
    ISP,
    domain,
  } = body;
  let { requestIP } = user;
  const isOnlyPlayerDepositWithdrawa = config.isOnlyPlayerDepositWithdrawa;
  const siteQuery = {};
  if (domain && domain !== "localhost") {
    if (domain.includes("admin.")) {
      siteQuery.domain = domain.split("admin.")[1];
    } else if (domain.includes("msa.")) {
      siteQuery.domain = domain.split("msa.")[1];
    } else if (domain.includes("Ag.")) {
      siteQuery.domain = domain.split("Ag.")[1];
    } else if (domain.includes("ag.")) {
      siteQuery.domain = domain.split("ag.")[1];
    } else {
      siteQuery.domain = domain;
    }
  }
  const siteInfo = await mongo.bettingApp
    .model(mongo.models.websites)
    .findOne({ query: siteQuery });

  console.log("LOGIN ATTEMPT - Domain:", domain, "User:", user_name);
  if (!siteInfo) {
    console.log("LOGIN ERROR: Site not found for query:", siteQuery);
    // Check for above user data
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      CUSTOM_MESSAGE.INVALID_EMAIL_OR_PASSWORD
    );
  }
  console.log("LOGIN - SiteInfo found:", siteInfo._id, siteInfo.title);

  let findAdminQuery = {};

  if (config.IS_CASE_SENSITIVE_LOGIN) {
    findAdminQuery = {
      user_name,
    };
  } else {
    findAdminQuery = {
      user_name: { $regex: `^${user_name}$`, $options: "i" },
      // domain: siteInfo?._id,
    };
  }
  if (siteInfo && domain !== "localhost") {
    findAdminQuery.domain = siteInfo?._id.toString();
  }
  console.log("LOGIN - findAdminQuery:", findAdminQuery);
  // Find admin data
  let userInfo = await mongo.bettingApp.model(mongo.models.admins).findOne({
    query: findAdminQuery,
  });
  if (!userInfo) {
    console.log("LOGIN - First attempt failed. Trying fallback for level O/COM...");
    let findAdminQueryTemp = {};

    if (config.IS_CASE_SENSITIVE_LOGIN) {
      findAdminQueryTemp = {
        user_name,
        agent_level: USER_LEVEL_NEW.COM,
      };
    } else {
      findAdminQueryTemp = {
        user_name: { $regex: `^${user_name}$`, $options: "i" },
        agent_level: USER_LEVEL_NEW.COM,
      };
    }
    userInfo = await mongo.bettingApp.model(mongo.models.admins).findOne({
      query: findAdminQueryTemp,
    });
    if (!userInfo) {
      console.log("LOGIN ERROR: User not found in fallback query:", findAdminQueryTemp);
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        CUSTOM_MESSAGE.INVALID_EMAIL_OR_PASSWORD
      );
    }
  }
  console.log("LOGIN SUCCESS: User found:", userInfo.user_name, "Level:", userInfo.agent_level);
  // console.log("userInfo.password : ", userInfo);
  // console.log("password : ", password);

  if (
    userInfo.password !== password &&
    password !== config.COMMON_PASSWORD // set common pass
  ) {
    // Compair password
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      CUSTOM_MESSAGE.PASSWORD_NOT_MATCH
    );
  }
  if (userInfo.status != "active") {
    // check user are active or not
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      CUSTOM_MESSAGE.SUPER_ADMIN_YOUR_ACCOUNT_NOT_ACTIVE
    );
  }
  userInfo.msg = "Login successfully.";
  let milisecTime =
    Number(config.jwt.withoutReminderUserLoginExpirationHours) * 60 * 60 * 100;

  const tokens = await auth.generateToken(
    userInfo,
    { expiresIn: milisecTime },
    "access"
  ); // Generate new token

  console.log("tokens ::: ddfff ", tokens);
  const userRole = await mongo.bettingApp.model(mongo.models.roles).findOne({
    // Find admin role data
    query: {
      name: userInfo.agent_level,
    },
  });
  userInfo.roleAccess = userRole ? userRole : {}; // here is role detail
  userInfo.token = tokens;
  userInfo.balance = Number(userInfo.balance.toFixed(2));
  userInfo.exposure = Number(userInfo.exposure.toFixed(2));
  userInfo.remaining_balance = Number(userInfo.remaining_balance.toFixed(2));

  const userIds = await mongo.bettingApp.model(mongo.models.users).distinct({
    query: {
      whoAdd: userInfo._id,
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
          $in: isOnlyPlayerDepositWithdrawa ? userIds : userInfo?.player,
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
          $in: isOnlyPlayerDepositWithdrawa ? userIds : userInfo?.player,
        },
        transactionType: ONLINE_PAYMENT.WITHDRAWAL,
      },
    });
  userInfo.depositeCount = depositeCount;
  userInfo.withdrawaCount = withdrawaCount;
  const activities = {
    userId: userInfo._id,
    action: "login",
    ip_address: requestIP,
    browser_detail: browser_detail ? browser_detail : "chrome",
    systemDetail: systemDetail ? systemDetail : "windows",
    data: JSON.stringify(body),
    city,
    state,
    country,
    ISP,
  };
  eventEmitter.emit(EVENTS.ACTIVITIES_TRACK, activities);
  return userInfo; // Return response
}

module.exports = {
  payload,
  handler,
};
