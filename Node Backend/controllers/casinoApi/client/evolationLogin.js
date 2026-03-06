const joi = require("joi");
const httpStatus = require("http-status");

const mongo = require("../../../config/mongodb");
const {
  createMember,
  login,
  doLoginAndLaunchGame,
} = require("../../../config/casinoAPI");
const ApiError = require("../../../utils/ApiError");
const CUSTOM_MESSAGE = require("../../../utils/message");
const config = require("../../../config/config");
const { userAuthentication } = require("../../../config/evolationAPI");

const payload = {
  body: joi.object().keys({
    id: joi.string().required(), // casino id
    isMobileLogin: joi.boolean().required(),
    domain: joi.string().required(), // currant client domain
  }),
};

async function handler({ body, user }) {
  const { id, isMobileLogin, domain } = body;
  const { userId, requestIP } = user;

  const userDetail = await mongo.bettingApp.model(mongo.models.users).findOne({
    query: { _id: userId },
    populate: {
      path: "domain",
      model: await mongo.bettingApp.model(mongo.models.websites),
      select: ["domain"],
    },
    select: {
      isCasinoUser: 1,
      user_name: 1,
      domain: 1,
      casinoUserName: 1,
      firstName: 1,
      lastName: 1,
    },
  });

  console.log("casino : Login : userDetail : ", userDetail);

  if (userDetail.casinoUserName === "") {
    userDetail.casinoUserName = `${config.PRIFIX}casi${userDetail.user_name}`;
  }

  const casinoLoginRes = await userAuthentication({
    ...userDetail,
    ip: requestIP,
  });

  const sendObject = {
    url: casinoLoginRes,
    msg: "casino login success.",
  };

  return sendObject;
}

module.exports = {
  payload,
  handler,
  auth: true,
};
