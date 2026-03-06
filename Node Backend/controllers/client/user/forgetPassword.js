const joi = require("joi");
const httpStatus = require("http-status");
var randomstring = require("randomstring");

const mongo = require("../../../config/mongodb");
const ApiError = require("../../../utils/ApiError");
const auth = require("../../../utils/auth");
const mail = require("../../../utils/mail");
const CUSTOM_MESSAGE = require("../../../utils/message");

const payload = {
  body: joi.object().keys({
    email: joi.string().required().email(),
  }),
};

async function handler({ body }) {
  let { email } = body;

  let UserInfo = await mongo.bettingApp.model(mongo.models.users).findOne({
    // Find admin
    query: {
      email: email,
    },
  });
  if (!UserInfo)
    // Check for above admin data
    throw new ApiError(httpStatus.BAD_REQUEST, CUSTOM_MESSAGE.USER_NOT_FOUND);

  let rand = randomstring.generate();
  let link = "https://superadmin.artoon.in/resetpassword/" + rand;
  const text = `Dear user,
      To reset your password, click on this link: ${link}
      If you did not request any password resets, then ignore this email.`;

  UserInfo.rand = rand;
  const tokens = await auth.generateToken(
    UserInfo,
    { expiresIn: 2400 * 60 * 60 },
    "resetPassword"
  ); // generate new token

  let sendMailRes = await mail.sendDEVMail(
    UserInfo.email,
    text,
    "Reset Password - GoodGamer"
  ); // Send mail

  if (!sendMailRes) {
    // Check for mail sended or not
    throw new ApiError(httpStatus.BAD_REQUEST, CUSTOM_MESSAGE.MAIL_NOT_SEND);
  }
  let sendData = {
    email: email,
    link: link,
  };
  sendData.msg =
    "Success! You'll receive an email if you are registered on our system";
  return sendData; // Return response
}

module.exports = {
  payload,
  handler,
  auth: false,
};
