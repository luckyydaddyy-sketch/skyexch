const httpStatus = require("http-status");
const joi = require("joi");
const mongo = require("../../../config/mongodb");
const ApiError = require("../../../utils/ApiError");
const CUSTOM_MESSAGE = require("../../../utils/message");
const auth = require("../../../utils/auth");
const config = require("../../../config/config");
const { USER_LEVEL, USER_LEVEL_NEW, EVENTS } = require("../../../constants");
const {
  checkUserNameIsAvalibleOrNot,
} = require("../../admin/downlineList/utile");
const eventEmitter = require("../../../eventEmitter");
const { generateReferralCode } = require("../../../utils/global");

const payload = {
  body: joi.object().keys({
    user_name: joi.string().required(),
    password: joi.string().min(8).required(),
    confirmPassword: joi.string().min(8).optional(),
    mobileNumber: joi.number().required(),
    currency: joi.string().required(),
    firstName: joi.string().required(),
    email: joi.string().required(),
    refferCode: joi.string().allow("").required(),
    browser_detail: joi.string().optional(),
    systemDetail: joi.string().optional(),
    domain: joi.string().optional(),
    ISP: joi.string().allow("", null).optional(),
    city: joi.string().allow("", null).optional(),
    state: joi.string().allow("", null).optional(),
    country: joi.string().allow("", null).optional(),
  }),
};

async function handler({ body, user }) {
  // const userId = "SignUp_DL";
  let { requestIP } = user;
  const {
    user_name,
    password,
    confirmPassword,
    mobileNumber,
    currency,
    firstName,
    email,
    refferCode,
    browser_detail,
    systemDetail,
    domain,
    city,
    state,
    country,
    ISP,
  } = body;

  const siteQuery = {};
  if (domain && domain !== "localhost") {
    siteQuery.domain = domain;
  }
  const siteInfo = await mongo.bettingApp
    .model(mongo.models.websites)
    .findOne({ query: siteQuery });

  if (!siteInfo) {
    // Check for above user data
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      CUSTOM_MESSAGE.SIGN_UP_REFFER_CODE_VALID,
    );
  }

  if (password && confirmPassword && password !== confirmPassword)
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      CUSTOM_MESSAGE.PASSWORD_NOT_MATCH,
    );

  console.log("body :: ", body.domain);
  const flag = await checkUserNameIsAvalibleOrNot(body.user_name);

  console.log("flag: " + flag);
  // User name is not available
  if (flag)
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      CUSTOM_MESSAGE.ACCOUNT_ALREADY_EXISTS,
    );

  let adminInfo = null;
  if (refferCode && refferCode !== "") {
    adminInfo = await mongo.bettingApp.model(mongo.models.admins).findOne({
      query: {
        user_name: { $regex: `^${refferCode}$`, $options: "i" },
        status: "active",
        agent_level: USER_LEVEL_NEW.M,
      },
      select: {
        whoAdd: 1,
        commission: 1,
        delay: 1,
        rolling_delay: 1,
        agent_level: 1,
        domain: 1,
      },
    });
  } else {
    adminInfo = await mongo.bettingApp.model(mongo.models.admins).findOne({
      query: {
        domain: siteInfo._id,
        status: "active",
        agent_level: USER_LEVEL_NEW.WL,
      },
      select: {
        whoAdd: 1,
        commission: 1,
        delay: 1,
        rolling_delay: 1,
        agent_level: 1,
        domain: 1,
      },
    });
  }

  if (!adminInfo)
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      CUSTOM_MESSAGE.SIGN_UP_REFFER_CODE_VALID,
    );

  const whoAdd = adminInfo.whoAdd;
  whoAdd.push(adminInfo._id);

  // create player
  const document = {
    user_name,
    password,
    mobileNumber,
    currency,
    firstName,
    email,
    // lastName,
    commission: adminInfo.commission,
    rolling_delay: adminInfo.rolling_delay,
    domain: adminInfo.domain,
    agent_level: "PL",
    delay: adminInfo.delay,
    newPassword: false,
    isRefferCode: true,
    refferCode: generateReferralCode(8),
  };
  // if (adminInfo.agent_level !== USER_LEVEL_NEW.COM) {
  //   document.commission = adminInfo.commission;
  //   document.delay = adminInfo.delay;
  //   document.rolling_delay = adminInfo.rolling_delay;
  //   document.domain = adminInfo.domain;
  // }
  document.whoAdd = whoAdd;
  document.admin = adminInfo._id;

  // let websiteInfo = {};
  // if (document.domain.length > 0)
  //   websiteInfo = await mongo.bettingApp.model(mongo.models.websites).findOne({
  //     query: { _id: document.domain[0] },
  //     select: {
  //       change_password_on_first_login: 1,
  //     },
  //   });
  // else
  //   websiteInfo = await mongo.bettingApp.model(mongo.models.websites).findOne({
  //     query: {},
  //     select: {
  //       change_password_on_first_login: 1,
  //     },
  //   });

  // if (Object.keys(websiteInfo).length > 0)
  //   document.newPassword = websiteInfo.change_password_on_first_login;

  let userInfo = await mongo.bettingApp.model(mongo.models.users).insertOne({
    document,
  });

  console.log("userInfo:: ", userInfo);
  console.log("userInfo:: ", userInfo._id);
  console.log("userInfo:: ", typeof userInfo);

  await mongo.bettingApp.model(mongo.models.stacks).insertOne({
    document: { userId: userInfo._id, stack: [10, 50, 100, 200, 500, 1000] },
  });

  await mongo.bettingApp.model(mongo.models.admins).updateOne({
    query: {
      _id: adminInfo._id,
    },
    update: {
      $push: {
        player: userInfo._id,
      },
    },
  });
  let milisecTime =
    Number(config.jwt.withoutReminderUserLoginExpirationHours) * 60 * 60 * 100;

  const tokens = await auth.generateTokenForUsers(
    userInfo,
    { expiresIn: milisecTime },
    "access",
  ); // Generate new token

  console.log("tokens ::: ddfff ", tokens);
  const userRole = await mongo.bettingApp.model(mongo.models.roles).findOne({
    // Find admin role data
    query: {
      name: userInfo.agent_level,
    },
  });

  const userData = JSON.parse(JSON.stringify(userInfo));
  userData.roleAccess = userRole ? userRole : {}; // here is role detail
  userData.token = tokens;

  const activities = {
    userId: userData._id,
    action: "signUp",
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

  userData.msg = "Your Account has been created!.";

  return userData;
}

module.exports = {
  payload,
  handler,
  auth: false,
};
