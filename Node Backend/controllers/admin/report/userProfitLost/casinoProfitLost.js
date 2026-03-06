const joi = require("joi");

const mongo = require("../../../../config/mongodb");
const { getStartEndDateTime } = require("../../../../utils/comman/date");

const payload = {
  body: joi.object().keys({
    page: joi.number().required(),
    limit: joi.number().required(),
    id: joi.string().optional(),
    to: joi.string().optional(),
    from: joi.string().optional(),
    type: joi.string().valid("awc", "inter").optional(),
    betType: joi.string().valid("top", "bottom").optional(),
    sort: joi.string().valid("top", "bottom").optional(),
  }),
};

async function handler({ body, user }) {
  const { id, limit, page, type, to, from, betType } = body;

  //   const { userId } = user

  const query = {
    gameStatus: "completed",
  };
  const betHistoryQuery = {
    winLostAmount: { $ne: 0 },
  };

  if (id) query.userObjectId = mongo.ObjectId(id);
  // if (type && type !== "all") query.type = type;
  // if (betType){
  //   if(betType === "market"){
  //       query.betType = {$in : ["odds", "bookMark"]};
  //   }else{
  //       query.betType = betType;
  //   }
  // }

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
    .model(mongo.models.casinoMatchHistory)
    .distinct({
      query,
      field: "userObjectId",
    });

  const totalRecord = userIds.length;

  let sportsReport = [];
  for (const userId of userIds) {
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

      const casinoBetsHistory = await mongo.bettingApp
        .model(mongo.models.casinoMatchHistory)
        .find({
          query: betHistoryQuery,
          select: {
            _id: 1,
            betAmount: 1,
            gameStatus: 1,
            winLostAmount: 1,
          },
        });

      for await (const casinoBet of casinoBetsHistory) {
        const betStateMent = await mongo.bettingApp
          .model(mongo.models.statements)
          .find({
            query: {
              userId: userId,
              casinoMatchId: casinoBet._id,
            },
            select: {
              credit: 1,
              userId: 1,
              debit: 1,
            },
          });
        console.log(" betStateMent :::  ", betStateMent);
        for await (const betState of betStateMent) {
          if (betState.credit !== 0) {
            userDetail.total += betState.credit;
          } else if (betState.debit !== 0) {
            userDetail.total -= betState.debit;
          }
        }
      }

      sportsReport.push(userDetail);
    }
  }
  sportsReport.sort((a, b) => betType === "top" ? a - b : b - a);
   let mainData = sportsReport.slice((page-1) * limit,limit*page);
  mainData = mainData.map((value) => {
    value.total = Number(value.total.toFixed(2));
    return value;
  });

  const sendObject = {
    limit,
    page,
    totalResults: totalRecord,
    totalPages: Math.ceil(totalRecord / limit),
    results: mainData,
    msg: "sport profit lost by user!",
  };

  return sendObject;
}

module.exports = {
  payload,
  handler,
  auth: true,
};
