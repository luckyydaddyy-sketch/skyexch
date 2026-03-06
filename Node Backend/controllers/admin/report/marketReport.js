const joi = require("joi");

const mongo = require("../../../config/mongodb");
const { getStartEndDateTime } = require("../../../utils/comman/date");
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
  }),
};

async function handler({ body, user }) {
  const { id, limit, page, type, to, from } = body;

  //   const { userId } = user

  const query = {
    gameStatus: "completed",
  };

  let reportSport = [];

  const total = {
    matchPl: 0, // odds
    matchStack: 0, // odds
    bookMakerStack: 0, // bookMaker
    bookMakerPl: 0, // bookMaker
    fancyStack: 0, //  fancy
    fancyPl: 0, //  fancy
    premPl: 0, // prem
    premStack: 0, // prem
    total: 0, // total
  };

  if (id) query.userId = mongo.ObjectId(id);
  if (type && type !== "all") query.type = type;

  if (to && from) {
    const { endDate, startDate } = getStartEndDateTime(from, to);
    query.createdAt = {
      $gte: startDate,
      $lte: endDate,
    };
  }

  const sportsInfo = await mongo.bettingApp
    .model(mongo.models.sports)
    .paginate({
      query,
      page,
      limit,
      select:{
        _id: 1,
        name: 1,
      }
    });

  for await (const element of sportsInfo.results) {
    const betsHistory = await mongo.bettingApp
      .model(mongo.models.betsHistory)
      .find({
        query: {
          matchId: element._id,
          winner: { $ne: "" },
        },
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
    const staticData = {
      uid: element.name, // match name,
      matchPl: 0, // odds
      matchStack: 0, // odds
      bookMakerStack: 0, // bookMaker
      bookMakerPl: 0, // bookMaker
      fancyStack: 0, //  fancy
      fancyPl: 0, //  fancy
      premPl: 0, // prem
      premStack: 0, // prem
      total: 0, // total
    };
    // if (bet.winner !== "" && bet.winner !== "cancel") {
    //   if (bet.selection === bet.winner) {
    //   } else if (bet.selection !== bet.winner) {
    //   }
    // }
    for await (const bet of betsHistory) {
      if (bet.betType === "odds" || bet.betType === "bookMark") {
        if (bet.winner !== "" && bet.winner !== "cancel") {
          if (bet.selection === bet.winner) {
            if (bet.betSide === "lay") {
              bet.profit = bet.exposure;
            }
            // if (bet.betSide === "back") {
            staticData.matchPl += bet.profit;
            staticData.total += bet.profit;
            // } else {
            //   staticData.matchPl -= bet.profit;
            //   staticData.total -= bet.profit;
            // }
          } else if (bet.selection !== bet.winner) {
            if (bet.betSide === "back") {
              bet.profit = bet.exposure;
            }
            // if (bet.betSide === "back") {
            staticData.matchPl -= bet.betPlaced;
            staticData.total -= bet.betPlaced;
            // } else {
            //   staticData.matchPl += bet.betPlaced;
            //   staticData.total += bet.betPlaced;
            // }
          }
          staticData.matchStack += bet.stake;
        }
      }
      // else if (bet.betType === "bookMark") {
      //   if (bet.winner !== "" && bet.winner !== "cancel") {
      //     if (bet.selection === bet.winner) {
      //       if (bet.betSide === "back") {
      //         staticData.bookMakerPl += bet.profit;
      //         staticData.total += bet.profit;
      //       } else {
      //         staticData.bookMakerPl -= bet.profit;
      //         staticData.total -= bet.profit;
      //       }
      //       // staticData.bookMakerStack += bet.stake;
      //     } else if (bet.selection !== bet.winner) {
      //       if (bet.betSide === "back") {
      //         staticData.bookMakerPl -= bet.betPlaced;
      //         staticData.total -= bet.betPlaced;
      //       } else {
      //         staticData.bookMakerPl += bet.betPlaced;
      //         staticData.total += bet.betPlaced;
      //       }
      //     }
      //     staticData.bookMakerStack += bet.stake;
      //   }
      // }
      else if (bet.betType === "session") {
        if (bet.fancyYes === bet.fancyNo) {
          if (bet.betSide === "yes") {
            if (bet.fancyYes > Number(bet.winner)) {
              //lost
              staticData.fancyPl -= bet.betPlaced;
              staticData.total -= bet.betPlaced;
            } else {
              staticData.fancyPl += bet.profit;
              staticData.total += bet.profit;
            }
          } else {
            if (bet.fancyNo > Number(bet.winner)) {
              // win
              staticData.fancyPl += bet.betPlaced;
              staticData.total += bet.betPlaced;
            } else {
              staticData.fancyPl -= bet.profit;
              staticData.total -= bet.profit;
            }
          }
          staticData.fancyStack += bet.stake;
        } else {
          if (bet.betSide === "yes") {
            if (bet.fancyYes < Number(bet.winner)) {
              staticData.fancyPl -= bet.betPlaced;
              staticData.total -= bet.betPlaced;
            } else {
              staticData.fancyPl += bet.profit;
              staticData.total += bet.profit;
            }
          } else {
            if (bet.fancyNo > Number(bet.winner)) {
              staticData.fancyPl += bet.betPlaced;
              staticData.total += bet.betPlaced;
            } else {
              staticData.fancyPl -= bet.profit;
              staticData.total -= bet.profit;
            }
          }
          staticData.fancyStack += bet.stake;
        }
      } else if (bet.betType === "premium") {
        if (bet.winner !== "" && !bet.winner.includes("cancel")) {
          if (bet.winner.includes(bet.subSelection)) {
            staticData.fancyPl += bet.profit;
            staticData.total += bet.profit;
          } else if (!bet.winner.includes(bet.subSelection)) {
            staticData.fancyPl -= bet.betPlaced;
            staticData.total -= bet.betPlaced;
          }
          staticData.fancyStack += bet.stake;
        }
      }
    }
    reportSport.push(staticData);
  }

  // for await (const report of reportSport) {
  //   total.matchPl += report.matchPl;
  //   total.matchStack += report.matchStack;
  //   total.bookMakerStack += report.bookMakerStack;
  //   total.bookMakerPl += report.bookMakerPl;
  //   total.fancyStack += report.fancyStack;
  //   total.fancyPl += report.fancyPl;
  //   total.premPl += report.premPl;
  //   total.premStack += report.premStack;
  //   total.total += report.total;
  // }

  reportSport = reportSport.map((value) => {
    total.matchPl += value.matchPl;
    total.matchStack += value.matchStack;
    total.bookMakerStack += value.bookMakerStack;
    total.bookMakerPl += value.bookMakerPl;
    total.fancyStack += value.fancyStack;
    total.fancyPl += value.fancyPl;
    total.premPl += value.premPl;
    total.premStack += value.premStack;
    total.total += value.total;

    value.matchPl = Number(value.matchPl.toFixed(2));
    value.matchStack = Number(value.matchStack.toFixed(2));
    value.bookMakerStack = Number(value.bookMakerStack.toFixed(2));
    value.bookMakerPl = Number(value.bookMakerPl.toFixed(2));
    value.fancyStack = Number(value.fancyStack.toFixed(2));
    value.fancyPl = Number(value.fancyPl.toFixed(2));
    value.premPl = Number(value.premPl.toFixed(2));
    value.premStack = Number(value.premStack.toFixed(2));
    value.total = Number(value.total.toFixed(2));

    return value;
  });

  total.matchPl = Number(total.matchPl.toFixed(2));
  total.matchStack = Number(total.matchStack.toFixed(2));
  total.bookMakerStack = Number(total.bookMakerStack.toFixed(2));
  total.bookMakerPl = Number(total.bookMakerPl.toFixed(2));
  total.fancyStack = Number(total.fancyStack.toFixed(2));
  total.fancyPl = Number(total.fancyPl.toFixed(2));
  total.premPl = Number(total.premPl.toFixed(2));
  total.premStack = Number(total.premStack.toFixed(2));
  total.total = Number(total.total.toFixed(2));

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
