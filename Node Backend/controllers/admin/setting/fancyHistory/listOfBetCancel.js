const joi = require("joi");
const mongo = require("../../../../config/mongodb");

const payload = {
  body: joi.object().keys({
    search: joi.string().optional().allow(""),
  }),
};

// one sports bet list
async function handler({ body }) {
  const { search } = body;

  // const playerIds = await mongo.bettingApp.model(mongo.models.users).distinct({
  //   field: "_id",
  //   query: {
  //     whoAdd: userId,
  //   },
  // });

  // const sportInfo = await mongo.bettingApp.model(mongo.models.sports).findOne({
  //   query: {},
  //   select: {
  //     name: 1,
  //     openDate: 1,
  //     startDate: 1,
  //     type: 1,
  //   },
  // });

  const query = {
    // type: sportInfo.type,
    betType: "session",
    betStatus: "completed",
    // matchId: mongo.ObjectId(id),
    tType: "cancel",
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
        populate: {
          path: "matchId",
          model: await mongo.bettingApp.model(mongo.models.sports),
          select: ["name", "gameId"],
        },
        select: {
          winner: 1,
          selection: 1,
          matchId: 1,
          createdAt: 1,
        },
      });
    history.push(winnerInfo);
  }
  const sendObject = {
    msg: "sport fancy manage cancel history List!",
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
