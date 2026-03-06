const joi = require("joi");
const mongo = require("../../../config/mongodb");

const payload = {
  body: joi.object().keys({
    filter: joi.string().optional(),
  }),
};

async function handler({ body, user }) {
  const { userId } = user;
  const { filter } = body;

  const query = {
    userId: mongo.ObjectId(userId),
    betStatus: "",
    deleted: false,
  };

  const sportIds = await mongo.bettingApp
    .model(mongo.models.betsHistory)
    .distinct({
      query,
      field: "matchId",
    });

  const sports = await mongo.bettingApp.model(mongo.models.sports).find({
    query: {
      _id: { $in: sportIds },
    },
    select: {
      name: 1,
      openDate: 1,
      startDate: 1,
    },
  });

  const sportList = [];
  const totalCount = sports.length;
  for await (const sport of sports) {
    const betCount = await mongo.bettingApp
      .model(mongo.models.betsHistory)
      .countDocuments({
        query: {
          matchId: sport._id,
          userId: mongo.ObjectId(userId),
          winner: "",
        },
      });
    sport.betCount = betCount;
    sportList.push(sport);
  }

  const sendObject = {
    msg: "sport bet List by count!",
    sports: sportList,
    totalCount,
  };

  return sendObject;
}

module.exports = {
  payload,
  handler,
  auth: true,
};
