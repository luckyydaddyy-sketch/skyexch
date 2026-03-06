const joi = require("joi");

const mongo = require("../../../config/mongodb");
const { formentStatements } = require("../../utils/formentStatements");
const { getStartEndDateTime } = require("../../../utils/comman/date");
const { USER_LEVEL_NEW } = require("../../../constants");

const payload = {
  body: joi.object().keys({
    page: joi.number().required(),
    limit: joi.number().required(),
    id: joi.string().optional(),
    to: joi.string().optional(),
    from: joi.string().optional(),
    reportType: joi.string().valid("", "game", "deposit").optional(),
    report: joi.string().valid("up/down", "up", "down").optional(),
  }),
};

async function handler({ body, user }) {
  const { id, limit, page, to, from, reportType } = body;
  const { userId } = user;

  const adminInfo = await mongo.bettingApp.model(mongo.models.admins).findOne({
    query: { _id: userId },
    select: {
      _id: 1,
      agent: 1,
      player: 1,
      agent_level: 1,
    },
  });

  const query = {};

  if (adminInfo.agent_level !== USER_LEVEL_NEW.COM) {
    adminInfo.agent.push(adminInfo._id);
    const userIds = adminInfo.agent.concat(adminInfo.player);
    query.userId = { $in: userIds };
  }

  if (to && from) {
    const { endDate, startDate } = getStartEndDateTime(from, to);
    query.createdAt = {
      $gte: startDate,
      $lte: endDate,
    };
  }

  if (reportType && reportType === "game") {
    // query.matchId = { $ne: null };
    query["$or"] = [
      {
        matchId: { $ne: null },
      },
      {
        casinoMatchId: { $ne: null },
      },
      {
        casinoBonusId: { $ne: null },
      },
    ];
  } else if (reportType && reportType === "deposit") {
    query.to = { $ne: null };
  }

  if (id) query.userId = mongo.ObjectId(id);
  else query.userId = userId;
  console.log("query : statement : ", query);
  const userStatement = await mongo.bettingApp
    .model(mongo.models.statements)
    .paginate({
      query,
      page,
      limit,
      sort: { createdAt: -1 },
    });
  const formentStatment = await formentStatements(userStatement, userId);
  userStatement.results = formentStatment;
  const sendObject = {
    userStatement,
    msg: "account statement report!",
  };

  return sendObject;
}

module.exports = {
  payload,
  handler,
  auth: true,
};

// DL
// 647f1f8a7a4b95931c2db21e

// 647f20717a4b95931c2e0a3b
