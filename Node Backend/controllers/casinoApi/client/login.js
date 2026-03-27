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

const payload = {
  body: joi.object().keys({
    id: joi.string().required(), // casino id
    isMobileLogin: joi.boolean().required(),
    domain: joi.string().required(), // currant client domain
  }),
};

async function handler({ body, user }) {
  const { id, isMobileLogin, domain } = body;
  const { userId } = user;

  const userDetail = await mongo.bettingApp.model(mongo.models.users).findOne({
    query: { _id: userId },
    populate: {
      path: "domain",
      model: "websites",
      select: ["domain"],
    },
    select: {
      isCasinoUser: 1,
      user_name: 1,
      domain: 1,
      casinoUserName: 1,
      whoAdd: 1,
    },
  });

  console.log("casino : Login : userDetail : ", userDetail);
  const marketDetail = await mongo.bettingApp
    .model(mongo.models.marketLists)
    .findOne({
      query: {
        name: "Casino",
      },
    });
  const blockMarketDetail = await mongo.bettingApp
    .model(mongo.models.blockMarketLists)
    .findOne({
      query: {
        userId: { $in: userDetail.whoAdd },
        marketId: mongo.ObjectId(marketDetail._id),
        // isBlock: true,
      },
      sort: { isBlock:-1, updatedAt: -1 },
    });

  if (blockMarketDetail && blockMarketDetail.isBlock) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      CUSTOM_MESSAGE.YOUR_CASINO_BLOCKED
    );
  }
  if (!userDetail.isCasinoUser) {
    let casinoUserName = `${config.PRIFIX}casi${userDetail.user_name}`;
    
    const createMemberRes = await createMember({
      user_name: casinoUserName,
    });

    console.log(
      "casino : Login : createMember : createMemberRes : ",
      createMemberRes
    );
    if (
      !createMemberRes ||
      (createMemberRes &&
        createMemberRes.status !== "0000" &&
        createMemberRes.desc !== "Success")
    ) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        CUSTOM_MESSAGE.SOMETHING_WENT_WRONG
      );
    }

    await mongo.bettingApp.model(mongo.models.users).updateOne({
      query: { _id: userId },
      update: {
        isCasinoUser: true,
        casinoUserName: casinoUserName,
      },
    });

    userDetail.casinoUserName = casinoUserName;
  }
  let casinoDetail = {};
  if (id !== "loginType")
    casinoDetail = await mongo.bettingApp
      .model(mongo.models.dashboardImages)
      .findOne({
        query: { _id: mongo.ObjectId(id) },
      });

  const domainIndex = userDetail.domain.findIndex(
    (value) => value.domain === domain
  );

  const currantDomain =
    domainIndex !== -1
      ? userDetail.domain[domainIndex].domain
      : userDetail.domain.length > 0
      ? userDetail.domain[0].domain
      : domain;

  let casinoLoginRes = {};
  if (
    id === "loginType" ||
    (Object.keys(casinoDetail).length > 0 && casinoDetail.type === "platform")
  )
    casinoLoginRes = await login({
      id,
      user_name: userDetail.casinoUserName,
      isMobileLogin,
      domain: currantDomain,
      casinoDetail,
    });
  else
    casinoLoginRes = await doLoginAndLaunchGame({
      user_name: userDetail.casinoUserName,
      isMobileLogin,
      domain: currantDomain,
      gameType: casinoDetail.gameType,
      platform: casinoDetail.platform,
      gameCode: casinoDetail.gameCode,
      gameLimit: casinoDetail.gameLimit ? casinoDetail.gameLimit : "",
      hall: casinoDetail.hall ? casinoDetail.hall : "",
    });

  console.log("casino : login : casinoLoginRes :: ", casinoLoginRes);

  if (casinoLoginRes.status !== "0000") {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      CUSTOM_MESSAGE.SOMETHING_WENT_WRONG
    );
  }

  const sendObject = {
    url: casinoLoginRes.url,
    msg: "casino login success.",
  };

  return sendObject;
}

module.exports = {
  payload,
  handler,
  auth: true,
};
