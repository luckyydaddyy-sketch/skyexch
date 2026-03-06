const httpStatus = require("http-status");
const joi = require("joi");
const mongo = require("../../../config/mongodb");
const ApiError = require("../../../utils/ApiError");
const CUSTOM_MESSAGE = require("../../../utils/message");
const { USER_LEVEL, USER_LEVEL_NEW } = require("../../../constants");
const {
  checkUserNameIsAvalibleOrNot,
} = require("../../admin/downlineList/utile");

const payload = {
  body: joi.object().keys({
    user_name: joi.string().required(),
    password: joi.string().min(8).required(),
    confirmPassword: joi.string().min(8).optional(),
    mobileNumber: joi.number().required(),
  }),
};

async function handler({ body }) {
  const userId = "SignUp_DL";
  const { user_name, password, confirmPassword, mobileNumber } = body;

  if (password && confirmPassword && password !== confirmPassword)
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      CUSTOM_MESSAGE.PASSWORD_NOT_MATCH
    );

  console.log("body :: ", body.domain);
  const flag = await checkUserNameIsAvalibleOrNot(body.user_name);

  console.log("flag: " + flag);
  // User name is not available
  if (flag)
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      CUSTOM_MESSAGE.ACCOUNT_ALREADY_EXISTS
    );

  let adminInfo = await mongo.bettingApp.model(mongo.models.admins).findOne({
    query: { user_name: userId, status: "active" },
    select: {
      whoAdd: 1,
      commission: 1,
      delay: 1,
      rolling_delay: 1,
      agent_level: 1,
      domain: 1,
    },
  });

  if (!adminInfo)
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      CUSTOM_MESSAGE.SIGN_UP_NOT_VALID
    );

  const whoAdd = adminInfo.whoAdd;
  whoAdd.push(adminInfo._id);

  // create player
  const document = {
    user_name,
    password,
    mobileNumber,
    // firstName,
    // lastName,
    // commission,
    // rolling_delay,
    // domain,
    agent_level: "PL",
    // delay,
    newPassword: false,
  };
  if (adminInfo.agent_level !== USER_LEVEL_NEW.COM) {
    document.commission = adminInfo.commission;
    document.delay = adminInfo.delay;
    document.rolling_delay = adminInfo.rolling_delay;
    document.domain = adminInfo.domain;
  }
  document.whoAdd = whoAdd;
  document.admin = adminInfo._id;

  let websiteInfo = {};
  if (document.domain.length > 0)
    websiteInfo = await mongo.bettingApp.model(mongo.models.websites).findOne({
      query: { _id: document.domain[0] },
      select: {
        change_password_on_first_login: 1,
      },
    });
  else
    websiteInfo = await mongo.bettingApp.model(mongo.models.websites).findOne({
      query: {},
      select: {
        change_password_on_first_login: 1,
      },
    });

  if (Object.keys(websiteInfo).length > 0)
    document.newPassword = websiteInfo.change_password_on_first_login;

  let userInfo = await mongo.bettingApp.model(mongo.models.users).insertOne({
    document,
  });

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

  userInfo.msg = "Create Player.";

  return userInfo;
}

module.exports = {
  payload,
  handler,
  auth: false,
};
