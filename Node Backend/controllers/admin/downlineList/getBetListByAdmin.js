const joi = require("joi");
const mongo = require("../../../../config/mongodb");
const {
  getStartEndDateTime,
  getDate,
} = require("../../../../utils/comman/date");
const { betsHistoryDataFiter } = require("../../../utils/filterData");
const { SPORT_TYPE } = require("../../../../constants");

const payload = {
  body: joi.object().keys({
    id: joi.string().required(), // user id
    type: joi.string().valid("player", "admin").required(),
  }),
};

async function handler({ body, user }) {
  const { id, type } = body;

  let query = {

  };
  if(type === "admin"){
    const userQuery = {
      whoAdd: id,
    };
    const myUsersIds = await mongo.bettingApp.model(mongo.models.users).distinct({
      field: "_id",
      query: userQuery,
    });

    query = {
      userId : { $in : myUsersIds },
      betStatus: { $in: ["running", "pending"] },
    }
  }else{
    query = {
      userId: id,
      betStatus: { $in: ["running", "pending"] },
    }
  }
  
  let betsHistory = await mongo.bettingApp
    .model(mongo.models.betsHistory)
    .find({
      query,
      populate: {
        path: "userId",
        model: await mongo.bettingApp.model(mongo.models.users),
        select: ["agent_level", "user_name"],
      },
      select: {
        type: 1,
        matchId: 1,
        betType: 1,
        selection: 1,
        betSide: 1,
        betId: 1,
        createdAt: 1,
        stake: 1,
        oddsUp: 1,
        oddsDown: 1,
        tType: 1,
        profit: 1,
        exposure: 1,
        subSelection: 1,
      },
    });

  betsHistory = await betsHistoryDataFiter(betsHistory);
  const bets = [];
  for await (const bet of betsHistory) {
    if (
      bet.type === SPORT_TYPE.CRICKET ||
      bet.type === SPORT_TYPE.SOCCER ||
      bet.type === SPORT_TYPE.TENNIS ||
      bet.type === SPORT_TYPE.ESOCCER ||
      bet.type === SPORT_TYPE.BASKETBALL
    ) {
      let sport = await mongo.bettingApp.model(mongo.models.sports).findOne({
        query: { _id: bet.matchId },
        select: {
          name: 1,
        },
      });
      bet.name = sport.name;
      bets.push(bet);
    } else if (bet.type === "Casino") {
    }
  }

  bets.msg = "bet history.";

  return bets;
}

module.exports = {
  payload,
  handler,
  auth: true,
};
