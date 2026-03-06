const joi = require("joi");
const mongo = require("../../../config/mongodb");

const payload = {
  body: joi.object().keys({
    id: joi.string().required(), // sportId
  }),
};

async function handler({ body }) {
  const { id } = body;
  const userIds = await mongo.bettingApp
    .model(mongo.models.betsHistory)
    .distinct({
      query: {
        matchId: id,
        deleted: false
      },
      field: "userId",
    });

  const usersDetails = await mongo.bettingApp.model(mongo.models.users).find({
    query: {
      _id: { $in: userIds },
    },
    populate: {
      path: "whoAdd",
      model: await mongo.bettingApp.model(mongo.models.admins),
      select: ["agent_level", "user_name"],
    },
    select: {
      whoAdd: 1,
      user_name: 1,
      _id: 1,
    },
  });

  const userDetail = [];
  for (const user of usersDetails) {
    const bunchCount = await mongo.bettingApp
      .model(mongo.models.betsHistory)
      .countDocuments({
        query: {
          matchId: id,
          userId: user._id,
          deleted: false
        },
      });

      const count = await mongo.bettingApp
      .model(mongo.models.betsHistory)
      .countDocuments({
        query: {
          matchId: id,
          userId: user._id,
          deleted: false,
          isCheat: true
        },
      });

    user.count = count;
    user.bunchCount = bunchCount;

    userDetail.push(user);
  }

  const sendObject = {
    userDetail,
    msg: "bet count List!",
  };

  return sendObject;
}

module.exports = {
  payload,
  handler,
  auth: true,
};
