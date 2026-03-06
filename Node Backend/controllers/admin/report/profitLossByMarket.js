const joi = require("joi");

const mongo = require("../../../config/mongodb");
const { getStartEndDateTime, getDate } = require("../../../utils/comman/date");
const { SPORT_TYPE } = require("../../../constants");

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
        SPORT_TYPE.BASKETBALL,
        "all"
      )
      .optional(),
    filter: joi.string().valid("all", "today", "yesterday").optional(),
  }),
};

async function handler({ body, user }) {
  const { id, limit, page, type, to, from, filter } = body;

  const { userId } = user;

  const query = {
    gameStatus: "completed",
  };

  let reportSport = [];

  const total = {
    downlinePl: 0, // admin win amount
    playerPl: 0, // player win amount
    stake: 0, // bet amount
    commission: 0, // bet commissions
    UpLinePl: 0, // UpLine Pl
  };

  if (id) query.userId = mongo.ObjectId(id);
  if (type && type !== "all") query.type = type;
  if (filter && filter !== "all") {
    const { endDate, startDate } = getDate(filter);
    query.startDate = {
      $gte: startDate,
      $lte: endDate,
    };
  } else if (to && from) {
    const { endDate, startDate } = getStartEndDateTime(from, to);
    query.startDate = {
      $gte: startDate,
      $lte: endDate,
    };
  }

  const userIDs = await mongo.bettingApp.model(mongo.models.users).distinct({
    field: "_id",
    query: { whoAdd: userId },
  });

  const sportsInfo = await mongo.bettingApp
    .model(mongo.models.sports)
    .paginate({
      query,
      page,
      limit,
      select: {
        _id: 1,
        name: 1,
      },
    });

  for await (const element of sportsInfo.results) {
    const betsHistory = await mongo.bettingApp
      .model(mongo.models.betsHistory)
      .find({
        query: {
          matchId: element._id,
          userId: { $in: userIDs },
          winner: { $ne: "" },
        },
        select: {
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
        },
      });
    const staticData = {
      uid: element.name, // match name,
      downlinePl: 0, // admin win amount
      playerPl: 0, // player win amount
      stake: 0, // bet amount
      commission: 0, // bet commissions
      UpLinePl: 0, // total
    };
    for await (const bet of betsHistory) {
      if (bet.betType === "odds" || bet.betType === "bookMark") {
        if (bet.winner !== "" && bet.winner !== "cancel") {
          if (bet.selection === bet.winner) {
            // player lost
            if (bet.betSide === "lay") {
              staticData.downlinePl += bet.profit;
              staticData.UpLinePl += bet.profit;
              staticData.playerPl -= bet.profit;
            } else {
              // player win
              staticData.downlinePl -= bet.profit;
              staticData.UpLinePl -= bet.profit;
              staticData.playerPl += bet.profit;
            }
          } else if (bet.selection !== bet.winner) {
            // player lost
            if (bet.betSide === "back") {
              staticData.downlinePl += bet.betPlaced;
              staticData.UpLinePl += bet.betPlaced;
              staticData.playerPl -= bet.betPlaced;
            } else {
              // player winner
              staticData.downlinePl -= bet.betPlaced;
              staticData.UpLinePl -= bet.betPlaced;
              staticData.playerPl += bet.betPlaced;
            }
          }
        }
      } else if (bet.betType === "session") {
        if (bet.fancyYes === bet.fancyNo) {
          if (bet.betSide === "yes") {
            if (bet.fancyYes > Number(bet.winner)) {
              //lost
              staticData.downlinePl += bet.betPlaced;
              staticData.UpLinePl += bet.betPlaced;
              staticData.playerPl -= bet.betPlaced;
            } else {
              // win
              staticData.downlinePl -= bet.profit;
              staticData.UpLinePl -= bet.profit;
              staticData.playerPl += bet.profit;
            }
          } else {
            if (bet.fancyNo > Number(bet.winner)) {
              // win
              staticData.downlinePl -= bet.betPlaced;
              staticData.UpLinePl -= bet.betPlaced;
              staticData.playerPl += bet.betPlaced;
            } else {
              // lost
              staticData.downlinePl += bet.profit;
              staticData.UpLinePl += bet.profit;
              staticData.playerPl -= bet.profit;
            }
          }
          // staticData.fancyStack += bet.stake;
        } else {
          if (bet.betSide === "yes") {
            if (bet.fancyYes < Number(bet.winner)) {
              // won
              staticData.downlinePl -= bet.profit;
              staticData.UpLinePl -= bet.profit;
              staticData.playerPl += bet.profit;
            } else {
              // lost
              staticData.downlinePl += bet.betPlaced;
              staticData.UpLinePl += bet.betPlaced;
              staticData.playerPl -= bet.betPlaced;
            }
          } else {
            if (bet.fancyNo > Number(bet.winner)) {
              // won
              staticData.downlinePl -= bet.betPlaced;
              staticData.UpLinePl -= bet.betPlaced;
              staticData.playerPl += bet.betPlaced;
            } else {
              // lost
              staticData.downlinePl += bet.profit;
              staticData.UpLinePl += bet.profit;
              staticData.playerPl -= bet.profit;
            }
          }
          // staticData.fancyStack += bet.stake;
        }
      } else if (bet.betType === "premium") {
        if (bet.winner !== "" && !bet.winner.includes("cancel")) {
          if (bet.winner.includes(bet.subSelection)) {
            staticData.downlinePl -= bet.profit;
            staticData.UpLinePl -= bet.profit;
            staticData.playerPl += bet.profit;
          } else if (!bet.winner.includes(bet.subSelection)) {
            staticData.downlinePl += bet.betPlaced;
            staticData.UpLinePl += bet.betPlaced;
            staticData.playerPl -= bet.betPlaced;
          }
        }
      }

      staticData.stake += bet.betPlaced;
    }
    reportSport.push(staticData);
  }

  reportSport = reportSport.map((value) => {
    total.UpLinePl += value.UpLinePl;
    total.commission += value.commission;
    total.downlinePl += value.downlinePl;
    total.playerPl += value.playerPl;
    total.stake += value.stake;

    value.UpLinePl = Number(value.UpLinePl.toFixed(2));
    value.commission = Number(value.commission.toFixed(2));
    value.downlinePl = Number(value.downlinePl.toFixed(2));
    value.playerPl = Number(value.playerPl.toFixed(2));
    value.stake = Number(value.stake.toFixed(2));

    return value;
  });

  total.UpLinePl = Number(total.UpLinePl.toFixed(2));
  total.commission = Number(total.commission.toFixed(2));
  total.downlinePl = Number(total.downlinePl.toFixed(2));
  total.playerPl = Number(total.playerPl.toFixed(2));
  total.stake = Number(total.stake.toFixed(2));

  const sendObject = {
    report: {
      results: reportSport,
      page: sportsInfo.page,
      limit: sportsInfo.limit,
      totalPages: sportsInfo.totalPages,
      totalResults: sportsInfo.totalResults,
    },
    total,
    msg: "market report!",
  };

  return sendObject;
}

module.exports = {
  payload,
  handler,
  auth: true,
};
