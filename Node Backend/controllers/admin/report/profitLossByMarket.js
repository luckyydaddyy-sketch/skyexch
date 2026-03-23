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
    type: joi.string().valid(SPORT_TYPE.CRICKET, SPORT_TYPE.SOCCER, SPORT_TYPE.TENNIS, SPORT_TYPE.ESOCCER, SPORT_TYPE.BASKETBALL, "all").optional(),
    filter: joi.string().valid("all", "today", "yesterday").optional(),
  }),
};

async function handler({ body, user }) {
  const { id, limit, page, type, to, from, filter } = body;
  const { userId } = user;

  const query = { gameStatus: "completed" };
  if (id) query.userId = mongo.ObjectId(id);
  if (type && type !== "all") query.type = type;
  if (filter && filter !== "all") {
    const { endDate, startDate } = getDate(filter);
    query.startDate = { $gte: startDate, $lte: endDate };
  } else if (to && from) {
    const { endDate, startDate } = getStartEndDateTime(from, to);
    query.startDate = { $gte: startDate, $lte: endDate };
  }

  const userIDs = await mongo.bettingApp.model(mongo.models.users).distinct({
    field: "_id", query: { whoAdd: userId },
  });

  const sportsInfo = await mongo.bettingApp.model(mongo.models.sports).paginate({
    query, page, limit, select: { _id: 1, name: 1 },
  });

  const results = sportsInfo.results || [];
  if (results.length === 0) {
    return { report: { results: [], page, limit, totalPages: 0, totalResults: 0 }, total: {}, msg: "market report!" };
  }

  const matchIds = results.map(r => r._id);
  const allBets = await mongo.bettingApp.model(mongo.models.betsHistory).find({
    query: { matchId: { $in: matchIds }, userId: { $in: userIDs }, winner: { $ne: "" } },
    select: { matchId: 1, betType: 1, winner: 1, selection: 1, betSide: 1, profit: 1, exposure: 1, betPlaced: 1, stake: 1, fancyYes: 1, fancyNo: 1, subSelection: 1 },
  });

  const matchBetsMap = {};
  allBets.forEach(bet => {
    const mid = bet.matchId.toString();
    if (!matchBetsMap[mid]) matchBetsMap[mid] = [];
    matchBetsMap[mid].push(bet);
  });

  const total = { downlinePl: 0, playerPl: 0, stake: 0, commission: 0, UpLinePl: 0 };

  const reportSport = results.map(element => {
    const mid = element._id.toString();
    const betsHistory = matchBetsMap[mid] || [];
    const staticData = { uid: element.name, downlinePl: 0, playerPl: 0, stake: 0, commission: 0, UpLinePl: 0 };

    betsHistory.forEach(bet => {
      if (bet.betType === "odds" || bet.betType === "bookMark") {
        if (bet.winner !== "" && bet.winner !== "cancel") {
          if (bet.selection === bet.winner) {
            if (bet.betSide === "lay") {
              staticData.downlinePl += (bet.profit || 0);
              staticData.UpLinePl += (bet.profit || 0);
              staticData.playerPl -= (bet.profit || 0);
            } else {
              staticData.downlinePl -= (bet.profit || 0);
              staticData.UpLinePl -= (bet.profit || 0);
              staticData.playerPl += (bet.profit || 0);
            }
          } else {
            if (bet.betSide === "back") {
              staticData.downlinePl += (bet.betPlaced || 0);
              staticData.UpLinePl += (bet.betPlaced || 0);
              staticData.playerPl -= (bet.betPlaced || 0);
            } else {
              staticData.downlinePl -= (bet.betPlaced || 0);
              staticData.UpLinePl -= (bet.betPlaced || 0);
              staticData.playerPl += (bet.betPlaced || 0);
            }
          }
        }
      } else if (bet.betType === "session") {
        const isSameFancy = (bet.fancyYes === bet.fancyNo);
        const winnerNum = Number(bet.winner);
        if (isSameFancy) {
          if (bet.betSide === "yes") {
            if (bet.fancyYes > winnerNum) { staticData.downlinePl += bet.betPlaced; staticData.UpLinePl += bet.betPlaced; staticData.playerPl -= bet.betPlaced; }
            else { staticData.downlinePl -= bet.profit; staticData.UpLinePl -= bet.profit; staticData.playerPl += bet.profit; }
          } else {
            if (bet.fancyNo > winnerNum) { staticData.downlinePl -= bet.betPlaced; staticData.UpLinePl -= bet.betPlaced; staticData.playerPl += bet.betPlaced; }
            else { staticData.downlinePl += bet.profit; staticData.UpLinePl += bet.profit; staticData.playerPl -= bet.profit; }
          }
        } else {
          if (bet.betSide === "yes") {
            if (bet.fancyYes < winnerNum) { staticData.downlinePl -= bet.profit; staticData.UpLinePl -= bet.profit; staticData.playerPl += bet.profit; }
            else { staticData.downlinePl += bet.betPlaced; staticData.UpLinePl += bet.betPlaced; staticData.playerPl -= bet.betPlaced; }
          } else {
            if (bet.fancyNo > winnerNum) { staticData.downlinePl -= bet.betPlaced; staticData.UpLinePl -= bet.betPlaced; staticData.playerPl += bet.betPlaced; }
            else { staticData.downlinePl += bet.profit; staticData.UpLinePl += bet.profit; staticData.playerPl -= bet.profit; }
          }
        }
      } else if (bet.betType === "premium") {
        if (bet.winner !== "" && !bet.winner.includes("cancel")) {
          if (bet.winner.includes(bet.subSelection)) { staticData.downlinePl -= bet.profit; staticData.UpLinePl -= bet.profit; staticData.playerPl += bet.profit; }
          else { staticData.downlinePl += bet.betPlaced; staticData.UpLinePl += bet.betPlaced; staticData.playerPl -= bet.betPlaced; }
        }
      }
      staticData.stake += (bet.betPlaced || 0);
    });

    total.UpLinePl += staticData.UpLinePl;
    total.commission += staticData.commission;
    total.downlinePl += staticData.downlinePl;
    total.playerPl += staticData.playerPl;
    total.stake += staticData.stake;

    ['UpLinePl', 'commission', 'downlinePl', 'playerPl', 'stake'].forEach(k => {
      staticData[k] = Number(staticData[k].toFixed(2));
    });

    return staticData;
  });

  ['UpLinePl', 'commission', 'downlinePl', 'playerPl', 'stake'].forEach(k => {
    total[k] = Number(total[k].toFixed(2));
  });

  return {
    report: { results: reportSport, page: sportsInfo.page, limit: sportsInfo.limit, totalPages: sportsInfo.totalPages, totalResults: sportsInfo.totalResults },
    total, msg: "market report!"
  };
}

module.exports = { payload, handler, auth: true };
