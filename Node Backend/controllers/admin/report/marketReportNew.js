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
  let newReportSport = [];

  const total = {
    // matchPl: 0, // odds
    // matchStack: 0, // odds
    // bookMakerStack: 0, // bookMaker
    // bookMakerPl: 0, // bookMaker
    // fancyStack: 0, //  fancy
    // fancyPl: 0, //  fancy
    // premPl: 0, // prem
    // premStack: 0, // prem
    // total: 0, // total
  };

  const newTotal = {
    pnlPlush: 0,
    pnl: 0,
    commission: 0,
    finalPnl: 0,
  };

  if (id) query.userId = mongo.ObjectId(id);
  if (type && type !== "all") query.type = type;

  if (to && from) {
    const { endDate, startDate } = getStartEndDateTime(from, to);
    query.startDate = {
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
    // const staticData = {
    //   uid: element.name, // match name,
    //   matchPl: 0, // odds
    //   matchStack: 0, // odds
    //   bookMakerStack: 0, // bookMaker
    //   bookMakerPl: 0, // bookMaker
    //   fancyStack: 0, //  fancy
    //   fancyPl: 0, //  fancy
    //   premPl: 0, // prem
    //   premStack: 0, // prem
    //   total: 0, // total
    // };

    const newStaticData = {
      name: element.name, // match name,
      type: element.type, // match type,
      openDate: element.openDate, // match openDate,
      // pnlPlush: 0,
      pnl: 0,
      commission: 0,
      finalPnl: 0,
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
            // lost
            if (bet.betSide === "lay") {
              newStaticData.pnl += bet.profit;
              newStaticData.finalPnl += bet.profit;
              // bet.profit = bet.exposure;
              // newStaticData.pnl -= bet.exposure;
              // newStaticData.finalPnl -= bet.exposure;
            }else
            if (bet.betSide === "back") {
              // win
              newStaticData.pnl -= bet.profit;
              newStaticData.finalPnl -= bet.profit;
              // newStaticData.pnlPlush += bet.profit;
              // newStaticData.finalPnl += bet.profit;
            }
            // if (bet.betSide === "back") {
            // staticData.matchPl += bet.profit;
            // staticData.total += bet.profit;

            // } else {
            //   staticData.matchPl -= bet.profit;
            //   staticData.total -= bet.profit;
            // }
          } else if (bet.selection !== bet.winner) {
            // lost
            if (bet.betSide === "back") {
              newStaticData.pnl += bet.betPlaced;
              newStaticData.finalPnl += bet.betPlaced;
              // bet.profit = bet.exposure;
              // newStaticData.pnl -= bet.exposure;
              // newStaticData.finalPnl -= bet.exposure;
            }
            if (bet.betSide === "lay") {
              // win
              newStaticData.pnl += bet.betPlaced;
              newStaticData.finalPnl += bet.betPlaced;

              // newStaticData.pnlPlush += bet.exposure;
              // newStaticData.finalPnl += bet.exposure;
            }
            // if (bet.betSide === "back") {
            // staticData.matchPl -= bet.betPlaced;
            // staticData.total -= bet.betPlaced;
            // } else {
            //   staticData.matchPl += bet.betPlaced;
            //   staticData.total += bet.betPlaced;
            // }
          }
          // staticData.matchStack += bet.stake;
        }
      }
      else if (bet.betType === "session") {
        if (bet.fancyYes === bet.fancyNo) {
          if (bet.betSide === "yes") {
            if (bet.fancyYes > Number(bet.winner)) {
              //lost
              newStaticData.pnl += bet.betPlaced;
              newStaticData.finalPnl += bet.betPlaced;
            } else {
              //win
              newStaticData.pnl -= bet.profit;
              newStaticData.finalPnl -= bet.profit;
            }
          } else {
            if (bet.fancyNo > Number(bet.winner)) {
              // win
              newStaticData.pnl -= bet.betPlaced;
              newStaticData.finalPnl -= bet.betPlaced;
            } else {
              // lost
              newStaticData.pnl += bet.profit;
              newStaticData.finalPnl += bet.profit;
            }
          }
        } else {
          if (bet.betSide === "yes") {
            if (bet.fancyYes < Number(bet.winner)) {
              // won
              newStaticData.pnl -= bet.profit;
              newStaticData.finalPnl -= bet.profit;
            } else {
              // lost
              newStaticData.pnl += bet.betPlaced;
              newStaticData.finalPnl += bet.betPlaced;
            }
          } else {
            if (bet.fancyNo > Number(bet.winner)) {
              // won
              newStaticData.pnl -= bet.betPlaced;
              newStaticData.finalPnl -= bet.betPlaced;
            } else {
              // lost
              newStaticData.pnl += bet.profit;
              newStaticData.finalPnl += bet.profit;
            }
          }
        }
      } else if (bet.betType === "premium") {
        if (bet.winner !== "" && !bet.winner.includes("cancel")) {
          if (bet.winner.includes(bet.subSelection)) {
            newStaticData.pnl -= bet.profit;
            newStaticData.finalPnl -= bet.profit;
          } else if (!bet.winner.includes(bet.subSelection)) {
            newStaticData.pnl += bet.betPlaced;
            newStaticData.finalPnl += bet.betPlaced;
          }
          
        }
      }
    }
    newReportSport.push(newStaticData);
  }

  newReportSport = newReportSport.map((value) => {
    newTotal.pnl += value.pnl < 0 ? value.pnl : 0; // minus amount
    newTotal.finalPnl += value.finalPnl;
    newTotal.pnlPlush += value.pnl > 0 ? value.pnl : 0;
    newTotal.commission += value.commission;

    value.pnl = Number(value.pnl.toFixed(2));
    value.finalPnl = Number(value.finalPnl.toFixed(2));
    // value.pnlPlush = Number(value.pnlPlush.toFixed(2));
    value.commission = Number(value.commission.toFixed(2));

    return value;
  });
  // reportSport = reportSport.map((value) => {
  //   total.matchPl += value.matchPl;
  //   total.matchStack += value.matchStack;
  //   total.bookMakerStack += value.bookMakerStack;
  //   total.bookMakerPl += value.bookMakerPl;
  //   total.fancyStack += value.fancyStack;
  //   total.fancyPl += value.fancyPl;
  //   total.premPl += value.premPl;
  //   total.premStack += value.premStack;
  //   total.total += value.total;

  //   value.matchPl = Number(value.matchPl.toFixed(2));
  //   value.matchStack = Number(value.matchStack.toFixed(2));
  //   value.bookMakerStack = Number(value.bookMakerStack.toFixed(2));
  //   value.bookMakerPl = Number(value.bookMakerPl.toFixed(2));
  //   value.fancyStack = Number(value.fancyStack.toFixed(2));
  //   value.fancyPl = Number(value.fancyPl.toFixed(2));
  //   value.premPl = Number(value.premPl.toFixed(2));
  //   value.premStack = Number(value.premStack.toFixed(2));
  //   value.total = Number(value.total.toFixed(2));

  //   return value;
  // });

  newTotal.commission = Number(newTotal.commission.toFixed(2));
  newTotal.finalPnl = Number(newTotal.finalPnl.toFixed(2));
  newTotal.pnl = Number(newTotal.pnl.toFixed(2));
  newTotal.pnlPlush = Number(newTotal.pnlPlush.toFixed(2));

  // total.matchPl = Number(total.matchPl.toFixed(2));
  // total.matchStack = Number(total.matchStack.toFixed(2));
  // total.bookMakerStack = Number(total.bookMakerStack.toFixed(2));
  // total.bookMakerPl = Number(total.bookMakerPl.toFixed(2));
  // total.fancyStack = Number(total.fancyStack.toFixed(2));
  // total.fancyPl = Number(total.fancyPl.toFixed(2));
  // total.premPl = Number(total.premPl.toFixed(2));
  // total.premStack = Number(total.premStack.toFixed(2));
  // total.total = Number(total.total.toFixed(2));

  const sendObject = {
    report: {
      results: newReportSport,
      page: sportsInfo.page,
      limit: sportsInfo.limit,
      totalPages: sportsInfo.totalPages,
      totalResults: sportsInfo.totalResults,
    },
    total: newTotal,
    msg: "new market report!",
  };

  return sendObject;
}

module.exports = {
  payload,
  handler,
  auth: true,
};
