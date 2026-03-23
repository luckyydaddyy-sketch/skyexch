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
    type: joi.string().valid(SPORT_TYPE.CRICKET, SPORT_TYPE.SOCCER, SPORT_TYPE.TENNIS, SPORT_TYPE.ESOCCER, SPORT_TYPE.BASKETBALL, "all").optional(),
  }),
};

async function handler({ body, user }) {
  const { id, limit, page, type, to, from } = body;

  const query = { gameStatus: "completed" };
  if (id) query.userId = mongo.ObjectId(id);
  if (type && type !== "all") query.type = type;
  if (to && from) {
    const { endDate, startDate } = getStartEndDateTime(from, to);
    query.createdAt = { $gte: startDate, $lte: endDate };
  }

  const sportsInfo = await mongo.bettingApp.model(mongo.models.sports).paginate({
    query, page, limit, select: { _id: 1, name: 1 }
  });

  const results = sportsInfo.results || [];
  if (results.length === 0) {
    return { report: { results: [], page, limit, totalPages: 0, totalResults: 0 }, total: {}, msg: "market report!" };
  }

  const matchIds = results.map(r => r._id);
  const allBets = await mongo.bettingApp.model(mongo.models.betsHistory).find({
    query: { matchId: { $in: matchIds }, winner: { $ne: "" } },
    select: { matchId: 1, betType: 1, winner: 1, selection: 1, betSide: 1, profit: 1, exposure: 1, betPlaced: 1, stake: 1, fancyYes: 1, fancyNo: 1, subSelection: 1 }
  });

  const matchBetsMap = {};
  allBets.forEach(bet => {
    const mid = bet.matchId.toString();
    if (!matchBetsMap[mid]) matchBetsMap[mid] = [];
    matchBetsMap[mid].push(bet);
  });

  const total = { matchPl: 0, matchStack: 0, bookMakerStack: 0, bookMakerPl: 0, fancyStack: 0, fancyPl: 0, premPl: 0, premStack: 0, total: 0 };

  const reportSport = results.map(element => {
    const mid = element._id.toString();
    const betsHistory = matchBetsMap[mid] || [];
    const staticData = { uid: element.name, matchPl: 0, matchStack: 0, bookMakerStack: 0, bookMakerPl: 0, fancyStack: 0, fancyPl: 0, premPl: 0, premStack: 0, total: 0 };

    betsHistory.forEach(bet => {
      if (bet.betType === "odds" || bet.betType === "bookMark") {
        if (bet.winner !== "" && bet.winner !== "cancel") {
          if (bet.selection === bet.winner) {
            if (bet.betSide === "lay") bet.profit = bet.exposure;
            staticData.matchPl += (bet.profit || 0);
            staticData.total += (bet.profit || 0);
          } else {
            if (bet.betSide === "back") bet.profit = bet.exposure;
            staticData.matchPl -= (bet.betPlaced || 0);
            staticData.total -= (bet.betPlaced || 0);
          }
          staticData.matchStack += (bet.stake || 0);
        }
      } else if (bet.betType === "session") {
        const isSameFancy = (bet.fancyYes === bet.fancyNo);
        const winnerNum = Number(bet.winner);
        if (isSameFancy) {
          if (bet.betSide === "yes") {
            if (bet.fancyYes > winnerNum) { staticData.fancyPl -= bet.betPlaced; staticData.total -= bet.betPlaced; }
            else { staticData.fancyPl += bet.profit; staticData.total += bet.profit; }
          } else {
            if (bet.fancyNo > winnerNum) { staticData.fancyPl += bet.betPlaced; staticData.total += bet.betPlaced; }
            else { staticData.fancyPl -= bet.profit; staticData.total -= bet.profit; }
          }
        } else {
          if (bet.betSide === "yes") {
            if (bet.fancyYes < winnerNum) { staticData.fancyPl -= bet.betPlaced; staticData.total -= bet.betPlaced; }
            else { staticData.fancyPl += bet.profit; staticData.total += bet.profit; }
          } else {
            if (bet.fancyNo > winnerNum) { staticData.fancyPl += bet.betPlaced; staticData.total += bet.betPlaced; }
            else { staticData.fancyPl -= bet.profit; staticData.total -= bet.profit; }
          }
        }
        staticData.fancyStack += bet.stake;
      } else if (bet.betType === "premium") {
        if (bet.winner !== "" && !bet.winner.includes("cancel")) {
          if (bet.winner.includes(bet.subSelection)) { staticData.fancyPl += bet.profit; staticData.total += bet.profit; }
          else { staticData.fancyPl -= bet.betPlaced; staticData.total -= bet.betPlaced; }
          staticData.fancyStack += bet.stake;
        }
      }
    });

    // Update global totals
    total.matchPl += staticData.matchPl;
    total.matchStack += staticData.matchStack;
    total.bookMakerStack += staticData.bookMakerStack;
    total.bookMakerPl += staticData.bookMakerPl;
    total.fancyStack += staticData.fancyStack;
    total.fancyPl += staticData.fancyPl;
    total.premPl += staticData.premPl;
    total.premStack += staticData.premStack;
    total.total += staticData.total;

    // Formatting decimals
    ['matchPl', 'matchStack', 'bookMakerStack', 'bookMakerPl', 'fancyStack', 'fancyPl', 'premPl', 'premStack', 'total'].forEach(k => {
      staticData[k] = Number(staticData[k].toFixed(2));
    });

    return staticData;
  });

  ['matchPl', 'matchStack', 'bookMakerStack', 'bookMakerPl', 'fancyStack', 'fancyPl', 'premPl', 'premStack', 'total'].forEach(k => {
    total[k] = Number(total[k].toFixed(2));
  });

  return {
    report: { results: reportSport, page: sportsInfo.page, limit: sportsInfo.limit, totalPages: sportsInfo.totalPages, totalResults: sportsInfo.totalResults },
    total, msg: "market report!"
  };
}

module.exports = { payload, handler, auth: true };
