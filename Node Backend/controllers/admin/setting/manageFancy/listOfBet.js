const joi = require("joi");
const mongo = require("../../../../config/mongodb");

const payload = {
  body: joi.object().keys({
    search: joi.string().optional(),
    id: joi.string().optional(), // sport id
    gameId: joi.string().optional(), // sport id
  }),
};

// one sports bet list
async function handler({ body }) {
  const { search, id, gameId } = body;

  // const playerIds = await mongo.bettingApp.model(mongo.models.users).distinct({
  //   field: "_id",
  //   query: {
  //     whoAdd: userId,
  //   },
  // });
  let sportQuery = {
    _id: id,
  };
  if (gameId) {
    sportQuery = {
      gameId,
    };
  }
  const sportInfo = await mongo.bettingApp.model(mongo.models.sports).findOne({
    query: sportQuery,
    select: {
      name: 1,
      openDate: 1,
      startDate: 1,
      type: 1,
    },
  });

  const query = {
    type: sportInfo.type,
    betType: "session",
    betStatus: { $ne: "completed" },
    matchId: sportInfo._id,
  };
  if (search) {
    query.selection = { $regex: search, $options: "i" };
  }

  const betUnique = await mongo.bettingApp
    .model(mongo.models.betsHistory)
    .distinct({
      query,
      field: "selection",
    });

  // betUnique.msg = "sport fancy manage List!";

  const sendObject = {
    msg: "sport fancy manage List!",
    sportInfo,
    betUnique,
  };

  return sendObject;
}

module.exports = {
  payload,
  handler,
  auth: true,
};
