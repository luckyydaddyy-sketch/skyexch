const joi = require("joi");
const mongo = require("../../../config/mongodb");
const { getSport } = require("../../../config/sportsAPI");
const { getDate } = require("../../../utils/comman/date");
const { setSportLeageData } = require("../../cron/setSportsData");
const { SPORT_TYPE } = require("../../../constants");

const payload = {
  body: joi.object().keys({
    type: joi
      .string()
      .valid(
        SPORT_TYPE.CRICKET,
        SPORT_TYPE.SOCCER,
        SPORT_TYPE.TENNIS,
        SPORT_TYPE.ESOCCER,
        SPORT_TYPE.BASKETBALL
      )
      .required(),
    page: joi.string().required(),
    limit: joi.string().required(),
  }),
};

async function handler({ body }) {
  const { type, page, limit } = body;

  // const { endDate } = getDate("yesterday");
  // const query = {
  //   type,
  //   startDate: { $gt: endDate },
  // };

  let number = 1;
  if (type === SPORT_TYPE.CRICKET) {
    number = 4;
  } else if (type === SPORT_TYPE.SOCCER) {
    number = 1;
  } else if (type === SPORT_TYPE.TENNIS) {
    number = 2;
  } else if (type === SPORT_TYPE.ESOCCER) {
    number = 137;
  } else if (type === SPORT_TYPE.BASKETBALL) {
    number = 7522;
  }
  const siteInfo = await mongo.bettingApp
    .model(mongo.models.websites)
    .findOne({});

  const sportDefaultLimit = await mongo.bettingApp
    .model(mongo.models.deafultSetting)
    .findOne({});
  const sport = await getSport(number);
  // console.log("sportleage :: sport :: ", sport);
  const sportDetail =
    sport && sport.data
      ? await setSportLeageData(sport.data, type, siteInfo, sportDefaultLimit)
      : [];
  // const sports = await mongo.bettingApp
  //   .model(mongo.models.sportsLeage)
  //   .paginate({
  //     query,
  //     page,
  //     limit,
  //     select: {
  //       name: 1,
  //       marketId: 1,
  //       gameId: 1,
  //       openDate: 1,
  //       startDate: 1,
  //       activeStatus: 1,
  //       status: 1,
  //     },
  //     sort: { startDate: 1 },
  //   });

  // console.log("sportleage ::  sportDetail ::: ", sportDetail);
  const sendObject = {
    results: sportDetail,
    page: 0,
    limit: 0,
    totalPages: 0,
    totalResults: 0,
    msg: "sport List!",
  };

  // sports.msg = "sport List!";

  return sendObject;
}

module.exports = {
  payload,
  handler,
  auth: true,
};
