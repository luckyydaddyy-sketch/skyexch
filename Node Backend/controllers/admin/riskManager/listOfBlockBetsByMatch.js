const joi = require("joi");
const mongo = require("../../../config/mongodb");

const payload = {
  body: joi.object().keys({
    id: joi.string().required(),
  }),
};

async function handler({ user, body }) {
  console.log("body :: ", body);
  const { userId } = user;
  const { id } = body;

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
    matchId: id,
  };

  const betsHistory = await mongo.bettingApp
    .model(mongo.models.betsHistory)
    .find({
      query,
      populate: [
        {
          path: "userId",
          model: await mongo.bettingApp.model(mongo.models.users),
          select: ["agent_level", "user_name"],
        },
        {
          path: "matchId",
          model: await mongo.bettingApp.model(mongo.models.sports),
          select: ["name"],
        },
      ],
    });
  betsHistory = await betsHistoryDataFiter(betsHistory);

  const sendObject = {
    msg: "block bet list history.",
    betsHistory,
  };

  return sendObject;
}

module.exports = {
  payload,
  handler,
  auth: true,
};
