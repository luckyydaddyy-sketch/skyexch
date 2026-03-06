const joi = require("joi");
const mongo = require("../../../config/mongodb");

const payload = {
  body: joi.object().keys({}),
};

async function handler({ body }) {
  const sportIds = await mongo.bettingApp
    .model(mongo.models.betsHistory)
    .distinct({
      field: "matchId",
      query: {
        isCheat: true
      }
    });

  const sportDetails = await mongo.bettingApp.model(mongo.models.sports).find({
    query: {
      _id: { $in: sportIds },
    },
    sort: {
      createdAt: -1,
    },
    select: {
      name: 1,
      _id: 1,
      createdAt: 1,
      type: 1,
    },
  });

  const sportDetail = [];
  for await (const sport of sportDetails) {
    const count = await mongo.bettingApp
      .model(mongo.models.betsHistory)
      .distinct({
        query: {
          matchId: sport._id,
          deleted: false
        },
        field: "userId",
      });
    console.log("count :: ", count);
    sport.count = count.length;

    sportDetail.push(sport);
  }

  const sendObject = {
    sportDetail,
    msg: "user count List!",
  };

  return sendObject;
}

module.exports = {
  payload,
  handler,
  auth: true,
};
