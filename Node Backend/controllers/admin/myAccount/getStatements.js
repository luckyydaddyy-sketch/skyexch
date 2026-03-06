const joi = require("joi");
const httpStatus = require("http-status");

const mongo = require("../../../config/mongodb");
const ApiError = require("../../../utils/ApiError");
const CUSTOM_MESSAGE = require("../../../utils/message");
const { formentStatements } = require("../../utils/formentStatements");
const { getStartEndDateTime } = require("../../../utils/comman/date");

// https://www.mongodb.com/community/forums/t/can-a-reference-field-in-a-mongoose-schema-pertain-to-more-than-one-data-model/153708/3
// https://mongoosejs.com/docs/populate.html
const payload = {
  body: joi.object().keys({
    page: joi.number().required(),
    limit: joi.number().required(),
    id: joi.string().optional(),
    to: joi.string().optional(),
    from: joi.string().optional(),
    report: joi.string().optional(), // remove
    type: joi.string().valid("", "game", "deposit").optional(), // Deposit/Withdraw Report, Game Report, All
  }),
};

async function handler({ body, user }) {
  console.log("getStatements : body ::: body :: ", body);
  const { id, limit, page, to, from, type } = body;

  const { userId } = user;

  const query = {
    userId,
  };

  if (id) query.userId = mongo.ObjectId(id);

  if (to && from) {
    const { endDate, startDate } = getStartEndDateTime(from, to);
    query.createdAt = {
      $gte: startDate,
      $lte: endDate,
    };
  }

  if (type && type === "game") {
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
    // query.matchId = { $ne: null };
  } else if (type && type === "deposit") {
    query.to = { $ne: null };
  }

  console.log("getStatements : query :: ", query);
  const userStatement = await mongo.bettingApp
    .model(mongo.models.statements)
    .paginate({
      query,
      page,
      limit,
      sort: {
        createdAt: -1,
      },
    });

  const formentStatment = await formentStatements(userStatement, userId);
  userStatement.results = formentStatment;
  //   if (userInfo.length ==)
  //     throw new ApiError(httpStatus.BAD_REQUEST, CUSTOM_MESSAGE.RECORD_NOT_FOUND);

  const sendObject = {
    userStatement,
    msg: "account statement!",
  };

  return sendObject;
}

module.exports = {
  payload,
  handler,
  auth: true,
};
