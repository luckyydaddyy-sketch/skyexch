const joi = require("joi");
const mongo = require("../../../config/mongodb");
const { betsHistoryDataFiter } = require("../../utils/filterData");

const payload = {
  body: joi.object().keys({
    // id: joi.string().required(), // sport id
  }),
};

async function handler({ body, user }) {
  const { userId } = user;

  const query = {
    winner: "",
    deleted: false,
    userId: mongo.ObjectId(userId),
  };

  let betsHistory = await mongo.bettingApp
    .model(mongo.models.betsHistory)
    .find({
      query,
      //   populate: {
      //     path: "userId",
      //     model: await mongo.bettingApp.model(mongo.models.users),
      //     select: ["agent_level", "user_name"],
      //   },
        populate: {
          path: "matchId",
          model: await mongo.bettingApp.model(mongo.models.sports),
          select: ["name"],
        },
      select: {
        type: 1,
        matchId: 1,
        betType: 1,
        selection: 1,
        subSelection: 1,
        betSide: 1,
        betId: 1,
        createdAt: 1,
        stake: 1,
        oddsUp: 1,
        oddsDown: 1,
        userId: 1,
        exposure: 1,
        deleted: 1,
        winnerSelection: 1,
        betPlaced: 1,
        profit: 1,
        fancyYes: 1,
        fancyNo: 1,
      },
    });

  // console.log("client : sports : bets list :: else : ", betsHistory);
  betsHistory = await betsHistoryDataFiter(betsHistory);
  // console.log("client : sports : bets list ::: ", betsHistory);
  betsHistory.msg = "client sports bet history.";

  return betsHistory;
}

module.exports = {
  payload,
  handler,
  auth: true,
};
