const joi = require("joi");
const mongo = require("../../../../config/mongodb");

const payload = {
  body: joi.object().keys({
    search: joi.string().optional(),
    id: joi.string().required(), // sport id
  }),
};

// one sports bet list
async function handler({ body }) {
  const { search, id } = body;

  // const playerIds = await mongo.bettingApp.model(mongo.models.users).distinct({
  //   field: "_id",
  //   query: {
  //     whoAdd: userId,
  //   },
  // });

  const sportInfo = await mongo.bettingApp.model(mongo.models.sports).findOne({
    query: {
      _id: id,
    },
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
    betStatus: "completed",
    matchId: mongo.ObjectId(id),
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

  const history = [];

  for await (const selection of betUnique) {
    const winnerInfo = await mongo.bettingApp
      .model(mongo.models.betsHistory)
      .findOne({
        query: {
          matchId: mongo.ObjectId(id),
          selection,
        },
        select: {
          winner: 1,
          selection: 1,
        },
      });
    history.push(winnerInfo);
  }
  const sendObject = {
    msg: "sport fancy manage history List!",
    sportInfo,
    history,
  };
  // history.msg = "sport fancy manage history List!";

  return sendObject;
}

module.exports = {
  payload,
  handler,
  auth: true,
};
