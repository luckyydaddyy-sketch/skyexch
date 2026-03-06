const joi = require("joi");

const mongo = require("../../../../config/mongodb");
const { USER_LEVEL_NEW } = require("../../../../constants");
const ApiError = require("../../../../utils/ApiError");
const httpStatus = require("http-status");
const CUSTOM_MESSAGE = require("../../../../utils/message");
const payload = {
  body: joi.object().keys({
    id: joi.string().required(),
    casinoWinLimit: joi.number().required(),
    casinoWinLimitMin: joi.number().required(),
    casinoUserBalance: joi.number().required(),
    casinoWinings: joi.number().optional(),
  }),
};

async function handler({ user, body }) {
  const { userId, role } = user;
  const { id, casinoWinLimit, casinoWinLimitMin, casinoUserBalance } = body;
  console.log("query: role: ", role);
  // casinoUserBalance
  if (role === USER_LEVEL_NEW.SUO) {
    const adminInfo = await mongo.bettingApp
      .model(mongo.models.admins)
      .findOne({
        query: { _id: userId },
        select: {
          casinoWinLimit: 1,
          casinoWinLimitMin: 1,
          casinoUserBalance: 1, // bet limit
          casinoWinings: 1,
          _id: 1,
        },
      });

    const wlAdminInfo = await mongo.bettingApp.model(mongo.models.admins).find({
      query: {
        agent_level: USER_LEVEL_NEW.WL,
        whoAdd: mongo.ObjectId(userId),
      },
      select: {
        casinoWinLimit: 1,
        casinoWinLimitMin: 1,
        casinoUserBalance: 1, // bet limit
        casinoWinings: 1,
        _id: 1,
      },
    });

    const totalSpend = wlAdminInfo
      .filter((item) => item._id.toString() !== id)
      .reduce((acc, item) => acc + item.casinoUserBalance, 0);

    console.log("totalSpend :: ", totalSpend);

    if (
      adminInfo &&
      adminInfo.casinoUserBalance < totalSpend + Number(casinoUserBalance)
    ) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        CUSTOM_MESSAGE.YOU_NOT_GIVE_EXTRA_LIMIT
      );
    }
  }
  const adminInfo = await mongo.bettingApp
    .model(mongo.models.admins)
    .updateMany({
      query: {
        _id: mongo.ObjectId(id),
        // agent_level: USER_LEVEL_NEW.WL,
      },
      update: {
        casinoWinLimit,
        casinoWinLimitMin,
        casinoUserBalance,
      },
    });

  adminInfo.msg = "webSite WL limit has been updated!";

  return adminInfo;
}

module.exports = {
  payload,
  handler,
  auth: true,
};
