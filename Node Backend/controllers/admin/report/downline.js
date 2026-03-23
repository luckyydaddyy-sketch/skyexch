const httpStatus = require("http-status");
const joi = require("joi");

const CUSTOM_MESSAGE = require("../../../utils/message");
const mongo = require("../../../config/mongodb");
const ApiError = require("../../../utils/ApiError");
const { getDate, getStartEndDateTime } = require("../../../utils/comman/date");
const { GAME_STATUS, USER_LEVEL_NEW } = require("../../../constants");
const { getAdminUserInfo } = require("../utile/getdownLineUsersList");

async function getUsersReportBulk(userIds, to, from, filter, userCommissions = {}) {
  const query = {
    userId: { $in: userIds },
    deleted: false,
    winner: { $ne: "cancel" },
  };

  const casinoQuery = {
    userObjectId: { $in: userIds },
    winLostAmount: { $ne: 0 },
  };

  if (to && from) {
    const { endDate, startDate } = getStartEndDateTime(from, to);
    query.createdAt = { $gte: startDate, $lte: endDate };
    casinoQuery.createdAt = { $gte: startDate, $lte: endDate };
  } else if ((filter && (filter === "today" || filter === "yesterday"))) {
    const { endDate, startDate } = getDate(filter);
    query.createdAt = { $gte: startDate, $lte: endDate };
    casinoQuery.createdAt = { $gte: startDate, $lte: endDate };
  }

  const [allBets, allCasinoBets] = await Promise.all([
    mongo.bettingApp.model(mongo.models.betsHistory).find({
      query,
      select: {
        userId: 1, matchId: 1, betType: 1, stake: 1, winner: 1,
        selection: 1, betSide: 1, profit: 1, exposure: 1,
        betPlaced: 1, oddsUp: 1, subSelection: 1
      },
    }),
    mongo.bettingApp.model(mongo.models.casinoMatchHistory).find({
      query: casinoQuery,
      select: { userObjectId: 1, betAmount: 1, gameStatus: 1, winLostAmount: 1 },
    })
  ]);

  const reports = {};
  userIds.forEach(id => {
    reports[id.toString()] = {
      stack: 0, playerProfitLost: 0, comm: 0, 
      upLineProfitLost: 0, casinoStack: 0, casinoProfitLost: 0
    };
  });

  const oddsAmountMap = {}; // key: uid_matchId

  allBets.forEach(bet => {
    const uid = bet.userId.toString();
    const report = reports[uid];
    if (!report) return;
    
    report.stack += (bet.stake || 0);

    if (bet.betType === "odds" || bet.betType === "bookMark") {
      if (bet.winner !== "" && bet.winner !== "cancel") {
        if (bet.selection === bet.winner) {
          if (bet.betSide === "back") {
            if (bet.betType === "odds") {
              const key = `${uid}_${bet.matchId}`;
              oddsAmountMap[key] = (oddsAmountMap[key] || 0) + bet.profit;
            }
            report.playerProfitLost += (bet.profit || 0);
            report.upLineProfitLost -= (bet.profit || 0);
          } else {
            report.playerProfitLost -= (bet.profit || 0);
            report.upLineProfitLost += (bet.profit || 0);
            if (bet.betType === "odds") {
              const key = `${uid}_${bet.matchId}`;
              oddsAmountMap[key] = (oddsAmountMap[key] || 0) - (bet.profit || 0);
            }
          }
        } else if (bet.selection !== bet.winner) {
          if (bet.betSide === "lay") {
            if (bet.betType === "odds") {
              const key = `${uid}_${bet.matchId}`;
              oddsAmountMap[key] = (oddsAmountMap[key] || 0) + (bet.betPlaced || 0);
            }
            report.playerProfitLost += (bet.betPlaced || 0);
            report.upLineProfitLost -= (bet.betPlaced || 0);
          } else {
            report.playerProfitLost -= (bet.exposure || 0);
            report.upLineProfitLost += (bet.exposure || 0);
            if (bet.betType === "odds") {
              const key = `${uid}_${bet.matchId}`;
              oddsAmountMap[key] = (oddsAmountMap[key] || 0) - (bet.exposure || 0);
            }
          }
        }
      }
    } else if (bet.betType === "session") {
      if (bet.winner !== "" && bet.winner !== -2) {
        if (bet.oddsUp <= Number(bet.winner)) {
          if (bet.betSide === "yes") {
            report.playerProfitLost += (bet.profit || 0);
            report.upLineProfitLost -= (bet.profit || 0);
          } else {
            report.playerProfitLost -= (bet.profit || 0);
            report.upLineProfitLost += (bet.profit || 0);
          }
        } else {
            if (bet.betSide === "yes") {
              report.playerProfitLost -= (bet.exposure || 0);
              report.upLineProfitLost += (bet.exposure || 0);
            } else {
              report.playerProfitLost += (bet.betPlaced || 0);
              report.upLineProfitLost -= (bet.betPlaced || 0);
            }
        }
      }
    } else if (bet.betType === "premium") {
      if (bet.winner !== "" && !bet.winner.includes("cancel")) {
        if (bet.winner.includes(bet.subSelection)) {
          report.playerProfitLost += (bet.profit || 0);
          report.upLineProfitLost -= (bet.profit || 0);
        } else {
          report.playerProfitLost -= (bet.exposure || 0);
          report.upLineProfitLost += (bet.exposure || 0);
        }
      }
    }
  });

  // Apply commissions
  Object.keys(oddsAmountMap).forEach(key => {
    const [uid, matchId] = key.split('_');
    const amount = oddsAmountMap[key];
    const report = reports[uid];
    const commission = userCommissions[uid] || 0;
    if (amount > 0 && report) {
      const commi = (amount * commission) / 100;
      report.playerProfitLost -= commi;
      report.upLineProfitLost += commi;
      report.comm += commi;
    }
  });

  allCasinoBets.forEach(cBet => {
    const uid = cBet.userObjectId.toString();
    const report = reports[uid];
    if (report) {
      report.casinoStack += (cBet.betAmount || 0);
      if (cBet.gameStatus === GAME_STATUS.WIN) {
        report.casinoProfitLost += (cBet.winLostAmount || 0);
        report.upLineProfitLost -= (cBet.winLostAmount || 0);
      } else if (cBet.gameStatus === GAME_STATUS.LOSE) {
        report.casinoProfitLost -= (cBet.winLostAmount || 0);
        report.upLineProfitLost += (cBet.winLostAmount || 0);
      }
    }
  });

  return reports;
}

const payload = {
  body: joi.object().keys({
    filter: joi.string().valid("all", "today", "yesterday").optional(),
    to: joi.string().optional(),
    from: joi.string().optional(),
    id: joi.string().optional(),
  }),
};

async function handler({ body, user }) {
  const { id, to, from, filter } = body;
  const { userId } = user;

  const targetId = id ? mongo.ObjectId(id) : userId;

  const adminInfo = await mongo.bettingApp.model(mongo.models.admins).findOne({
    query: { _id: targetId },
    select: { user_name: 1, agent_level: 1, whoAdd: 1, agent: 1, player: 1 },
  });

  if (!adminInfo) throw new ApiError(httpStatus.BAD_REQUEST, CUSTOM_MESSAGE.USER_NOT_FOUND);

  let userList = [];
  if (adminInfo.agent_level === USER_LEVEL_NEW.M) {
    const users = await mongo.bettingApp.model(mongo.models.users).find({
      query: { whoAdd: targetId },
      select: { agent_level: 1, user_name: 1, createdAt: 1, commission: 1 },
    });
    
    const userIds = users.map(u => u._id);
    const commissions = {};
    users.forEach(u => commissions[u._id.toString()] = u.commission);
    
    const reportData = await getUsersReportBulk(userIds, to, from, filter, commissions);
    
    userList = users.map(u => ({
      ...u,
      ...reportData[u._id.toString()]
    }));
  } else {
    // Normal case (Agent List)
    const agents = await mongo.bettingApp.model(mongo.models.admins).find({
      query: { admin: targetId },
      select: { agent_level: 1, user_name: 1, createdAt: 1, agent: 1, player: 1 },
    });

    const allRelevantUserIds = new Set();
    const agentToUserMap = {};

    agents.forEach(agent => {
      const uids = (agent.agent || []).concat(agent.player || []);
      agentToUserMap[agent._id.toString()] = uids;
      uids.forEach(uid => allRelevantUserIds.add(uid.toString()));
    });

    const playersInBulk = await mongo.bettingApp.model(mongo.models.users).find({
      query: { _id: { $in: Array.from(allRelevantUserIds).map(id => mongo.ObjectId(id)) } },
      select: { commission: 1 }
    });
    const commissions = {};
    playersInBulk.forEach(p => commissions[p._id.toString()] = p.commission);

    const reportData = await getUsersReportBulk(Array.from(allRelevantUserIds).map(id => mongo.ObjectId(id)), to, from, filter, commissions);

    userList = agents.map(agent => {
      const aid = agent._id.toString();
      const combinedReport = {
        stack: 0, playerProfitLost: 0, comm: 0,
        upLineProfitLost: 0, casinoStack: 0, casinoProfitLost: 0
      };
      
      const downlineIds = agentToUserMap[aid] || [];
      downlineIds.forEach(uid => {
        const uReport = reportData[uid.toString()];
        if (uReport) {
          combinedReport.stack += uReport.stack;
          combinedReport.playerProfitLost += uReport.playerProfitLost;
          combinedReport.comm += uReport.comm;
          combinedReport.upLineProfitLost += uReport.upLineProfitLost;
          combinedReport.casinoStack += uReport.casinoStack;
          combinedReport.casinoProfitLost += uReport.casinoProfitLost;
        }
      });

      return { ...agent, ...combinedReport };
    });
  }

  const total = { stack: 0, playerProfitLost: 0, comm: 0, upLineProfitLost: 0, casinoStack: 0, casinoProfitLost: 0 };

  const finalUserList = userList.map(item => {
    const formatted = { ...item };
    
    total.stack += (item.stack || 0);
    total.playerProfitLost += (item.playerProfitLost || 0);
    total.comm += (item.comm || 0);
    total.upLineProfitLost += (item.upLineProfitLost || 0);
    total.casinoStack += (item.casinoStack || 0);
    total.casinoProfitLost += (item.casinoProfitLost || 0);

    ['stack', 'playerProfitLost', 'comm', 'upLineProfitLost', 'casinoStack', 'casinoProfitLost'].forEach(key => {
      if (formatted[key] !== undefined) {
        formatted[key] = Number(formatted[key].toFixed(2));
      }
    });
    if (formatted.commission) formatted.commission = Number(formatted.commission).toFixed(2);
    
    return formatted;
  });

  ['stack', 'playerProfitLost', 'comm', 'upLineProfitLost', 'casinoStack', 'casinoProfitLost'].forEach(key => {
    total[key] = Number(total[key].toFixed(2));
  });

  const uperLineInfo = await getAdminUserInfo(adminInfo.whoAdd, targetId, userId);

  return {
    userList: finalUserList,
    total,
    uperLineInfo,
    msg: "downline report!",
  };
}

module.exports = {
  payload,
  handler,
  auth: true,
};
