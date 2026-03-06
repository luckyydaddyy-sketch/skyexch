const joi = require("joi");
const mongo = require("../../../config/mongodb");
const { SPORT_TYPE } = require("../../../constants");

const payload = {
  body: joi.object().keys({
    search: joi.string().optional().allow(""),
    type: joi
      .string()
      .valid(
        "all",
        SPORT_TYPE.CRICKET,
        SPORT_TYPE.SOCCER,
        SPORT_TYPE.TENNIS,
        SPORT_TYPE.ESOCCER,
        SPORT_TYPE.BASKETBALL
      )
      .optional(),
  }),
};

async function handler({ user, body }) {
  console.log("body :: ", body);
  const { userId } = user;
  const { type, search } = body;

  const userQuery = {
    whoAdd: userId,
  };
  //   if (search && search !== "") {
  //     userQuery.user_name = { $regex: `^${search}$`, $options: "i" };
  //   }
  const myUsersIds = await mongo.bettingApp.model(mongo.models.users).distinct({
    field: "_id",
    query: userQuery,
  });

  const query = {
    deleted: true,
    userId: {
      $in: myUsersIds,
    },
  };

  const sportIds = await mongo.bettingApp
    .model(mongo.models.betsHistory)
    .distinct({
      query,
      field: "matchId",
    });

  const sportsDetail = await mongo.bettingApp.model(mongo.models.sports).find({
    query: {
      _id: { $in: sportIds },
    },
    select: {
      name: 1,
      openDate: 1,
      _id: 1,
    },
  });

  const sendObject = {
    msg: "block sport list.",
    sportsDetail,
  };

  return sendObject;
}

module.exports = {
  payload,
  handler,
  auth: true,
};
