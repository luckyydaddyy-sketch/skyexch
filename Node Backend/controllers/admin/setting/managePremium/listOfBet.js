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
    betType: "premium",
    betStatus: { $ne: "completed" },
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

  const betList = [];
  for (const list of betUnique) {
    query.selection = list;
    const bet = await mongo.bettingApp.model(mongo.models.betsHistory).distinct({
      query,
      field:"winnerSelection"
      // select: {
      //   winnerSelection: 1,
      // },
    });
    betList.push({
      name: list,
      winnerSelection: bet,
    });
  }

  const sendObject = {
    msg: "sport premium manage List!",
    betList,
    sportInfo,
  };

  return sendObject;
}

module.exports = {
  payload,
  handler,
  auth: true,
};
