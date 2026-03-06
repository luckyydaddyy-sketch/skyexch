const joi = require("joi");
const mongo = require("../../../../config/mongodb");
const { SPORT_TYPE } = require("../../../../constants");

const payload = {
  body: joi.object().keys({
    search: joi.string().optional(),
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
  const { search, type, page, limit } = body;

  // const playerIds = await mongo.bettingApp.model(mongo.models.users).distinct({
  //   field: "_id",
  //   query: {
  //     whoAdd: userId,
  //   },
  // });

  const query = {
    type,
    betType: "session",
    betStatus: "completed",
  };
  if (search) {
    // query.$or = [
    //   { name: { $regex: search, $options: "i" } },
    //   { gameId: { $regex: search, $options: "i" } },
    //   { marketId: { $regex: search, $options: "i" } },
    // ];

    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { marketId: { $regex: search, $options: "i" } },
    ];

    if (/^\d+$/.test(search)) {
      query.$or.push({ gameId: Number(search) });
    }
  }
  const sportIds = await mongo.bettingApp
    .model(mongo.models.betsHistory)
    .distinct({
      query,
      field: "matchId",
    });

  const sports = await mongo.bettingApp.model(mongo.models.sports).paginate({
    query: {
      _id: { $in: sportIds },
    },
    page,
    limit,
    select: {
      name: 1,
      openDate: 1,
      startDate: 1,
    },
    sort:{
      createdAt: -1
    }
  });

  const sportList = [];
  for await (const sport of sports.results) {
    const betCount = await mongo.bettingApp
      .model(mongo.models.betsHistory)
      .distinct({
        query: {
          betType: "session",
          type,
          betStatus: "completed",
          matchId: sport._id,
        },
        field: "selection",
      });
    sport.betCount = betCount.length;
    sportList.push(sport);
  }

  sports.results = sportList;
  sports.msg = "sport fancy history List!";

  return sports;
}

module.exports = {
  payload,
  handler,
  auth: true,
};
