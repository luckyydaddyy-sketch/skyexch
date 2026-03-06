const joi = require("joi");

const mongo = require("../../../../config/mongodb");
const { getStartEndDateTime } = require("../../../../utils/comman/date");
const { SPORT_TYPE } = require("../../../../constants");

const payload = {
  body: joi.object().keys({
    page: joi.number().required(),
    limit: joi.number().required(),
    id: joi.string().optional(),
    to: joi.string().optional(),
    from: joi.string().optional(),
    type: joi
      .string()
      .valid(
        SPORT_TYPE.CRICKET,
        SPORT_TYPE.SOCCER,
        SPORT_TYPE.TENNIS,
        SPORT_TYPE.ESOCCER,
        SPORT_TYPE.BASKETBALL
      )
      .optional(),
    betType: joi
      .string()
      .valid("market", "session", "toss", "session1", "premium")
      .optional(),
    sort: joi.string().valid("top", "bottom").optional(),
  }),
};

async function handler({ body, user }) {
  const { id, limit, page, type, to, from, betType } = body;

  //   const { userId } = user

  const query = {
    gameStatus: "completed",
  };
  const betHistoryQuery = {};

  if (id) query.userId = mongo.ObjectId(id);
  if (type && type !== "all") query.type = type;
  if (betType) {
    if (betType === "market") {
      query.betType = { $in: ["odds", "bookMark"] };
    } else {
      query.betType = betType;
    }
  }

  if (to && from) {
    const { endDate, startDate } = getStartEndDateTime(from, to);
    query.createdAt = {
      $gte: startDate,
      $lte: endDate,
    };
    betHistoryQuery.createdAt = {
      $gte: startDate,
      $lte: endDate,
    };
  }

  const userIds = await mongo.bettingApp
    .model(mongo.models.betsHistory)
    .distinct({
      query,
      field: "userId",
    });

  const totalRecord = userIds.length;

  const mainUserIDs = userIds.slice((page - 1) * limit, limit * page);
  let sportsReport = [];
  for (const userId of mainUserIDs) {
    const userDetail = await mongo.bettingApp
      .model(mongo.models.users)
      .findOne({
        query: { _id: userIds },
        select: {
          _id: 1,
          user_name: 1,
          firstName: 1,
        },
      });
    if (userDetail) {
      userDetail.total = 0;
      betHistoryQuery.userId = userId;
      betHistoryQuery.winner = { $ne: "" };

      const betsHistory = await mongo.bettingApp
        .model(mongo.models.betsHistory)
        .find({
          query: betHistoryQuery,
          select:{
            _id: 1,
            betType: 1,
            winner: 1,
            selection: 1,
            betSide: 1,
            profit: 1,
            exposure: 1,
            betPlaced: 1,
            stake: 1,
            fancyYes: 1,
            fancyNo: 1,
            subSelection: 1,
          }
        });

      for await (const bet of betsHistory) {
        if (bet.betType === "odds" || bet.betType === "bookMark") {
          if (bet.winner !== "" && bet.winner !== "cancel") {
            if (bet.selection === bet.winner) {
              if (bet.betSide === "lay") {
                // bet.profit = bet.exposure;
                // newStaticData.pnl -= bet.exposure;
                // newStaticData.finalPnl -= bet.exposure;
                userDetail.total -= bet.exposure;
              }
              if (bet.betSide === "back") {
                // newStaticData.pnlPlush += bet.profit;
                // newStaticData.finalPnl += bet.profit;
                userDetail.total += bet.profit;
              }
              // if (bet.betSide === "back") {
              //   staticData.matchPl += bet.profit;
              //   staticData.total += bet.profit;

              // } else {
              //   staticData.matchPl -= bet.profit;
              //   staticData.total -= bet.profit;
              // }
            } else if (bet.selection !== bet.winner) {
              if (bet.betSide === "back") {
                // bet.profit = bet.exposure;
                // newStaticData.pnl -= bet.exposure;
                // newStaticData.finalPnl -= bet.exposure;
                userDetail.total -= bet.exposure;
              }
              if (bet.betSide === "lay") {
                // newStaticData.pnlPlush += bet.exposure;
                // newStaticData.finalPnl += bet.exposure;
                userDetail.total += bet.exposure;
              }
              // if (bet.betSide === "back") {
              //   staticData.matchPl -= bet.betPlaced;
              //   staticData.total -= bet.betPlaced;
              // } else {
              //   staticData.matchPl += bet.betPlaced;
              //   staticData.total += bet.betPlaced;
              // }
            }
            // staticData.matchStack += bet.stake;
          }
        } else if (bet.betType === "session") {
          if (bet.fancyYes === bet.fancyNo) {
            if (bet.betSide === "yes") {
              if (bet.fancyYes > Number(bet.winner)) {
                //lost
                // staticData.fancyPl -= bet.betPlaced;
                // staticData.total -= bet.betPlaced;
                // newStaticData.pnl -= bet.betPlaced;
                // newStaticData.finalPnl -= bet.betPlaced;
                userDetail.total -= bet.betPlaced;
              } else {
                // staticData.fancyPl += bet.profit;
                // staticData.total += bet.profit;
                // newStaticData.pnlPlush += bet.profit;
                // newStaticData.finalPnl += bet.profit;
                userDetail.total += bet.profit;
              }
            } else {
              if (bet.fancyNo > Number(bet.winner)) {
                // win
                // staticData.fancyPl += bet.betPlaced;
                // staticData.total += bet.betPlaced;
                // newStaticData.pnlPlush += bet.betPlaced;
                // newStaticData.finalPnl += bet.betPlaced;
                userDetail.total += bet.betPlaced;
              } else {
                // staticData.fancyPl -= bet.profit;
                // staticData.total -= bet.profit;
                // newStaticData.pnlPlush -= bet.profit;
                // newStaticData.finalPnl -= bet.profit;
                userDetail.total -= bet.profit;
              }
            }
            // staticData.fancyStack += bet.stake;
          } else {
            if (bet.betSide === "yes") {
              if (bet.fancyYes < Number(bet.winner)) {
                // staticData.fancyPl -= bet.betPlaced;
                // staticData.total -= bet.betPlaced;
                // newStaticData.pnl -= bet.betPlaced;
                // newStaticData.finalPnl -= bet.betPlaced;
                userDetail.total -= bet.betPlaced;
              } else {
                // staticData.fancyPl += bet.profit;
                // staticData.total += bet.profit;
                // newStaticData.pnlPlush += bet.profit;
                // newStaticData.finalPnl += bet.profit;
                userDetail.total += bet.profit;
              }
            } else {
              if (bet.fancyNo > Number(bet.winner)) {
                // staticData.fancyPl += bet.betPlaced;
                // staticData.total += bet.betPlaced;
                // newStaticData.pnlPlush += bet.betPlaced;
                // newStaticData.finalPnl += bet.betPlaced;
                userDetail.total += bet.betPlaced;
              } else {
                // staticData.fancyPl -= bet.profit;
                // staticData.total -= bet.profit;
                // newStaticData.pnl -= bet.profit;
                // newStaticData.finalPnl -= bet.profit;
                userDetail.total -= bet.profit;
              }
            }
            // staticData.fancyStack += bet.stake;
          }
        } else if (bet.betType === "premium") {
          if (bet.winner !== "" && !bet.winner.includes("cancel")) {
            if (bet.winner.includes(bet.subSelection)) {
              //   staticData.fancyPl += bet.profit;
              //   staticData.total += bet.profit;
              //   newStaticData.pnlPlush += bet.profit;
              //   newStaticData.finalPnl += bet.profit;
              userDetail.total += bet.profit;
            } else if (!bet.winner.includes(bet.subSelection)) {
              //   staticData.fancyPl -= bet.betPlaced;
              //   staticData.total -= bet.betPlaced;
              //   newStaticData.pnlPlush -= bet.betPlaced;
              //   newStaticData.finalPnl -= bet.betPlaced;
              userDetail.total -= bet.betPlaced;
            }
            // staticData.fancyStack += bet.stake;
          }
        }
      }

      sportsReport.push(userDetail);
    }
  }

  sportsReport = sportsReport.map((value) => {
    value.total = Number(value.total.toFixed(2));
    return value;
  });

  const sendObject = {
    limit,
    page,
    totalResults: totalRecord,
    totalPages: Math.ceil(totalRecord / limit),
    results: sportsReport,
    msg: "sport profit lost by user!",
  };

  return sendObject;
}

module.exports = {
  payload,
  handler,
  auth: true,
};
