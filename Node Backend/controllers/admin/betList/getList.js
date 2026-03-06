const joi = require("joi");
const mongo = require("../../../config/mongodb");
const { betsHistoryDataFiter } = require("../../utils/filterData");
const { getStartEndDateTime } = require("../../../utils/comman/date");
const { SPORT_TYPE } = require("../../../constants");

const payload = {
  body: joi.object().keys({
    matchId: joi.string().optional(),
    search: joi.string().optional(),
    type: joi
      .string()
      .valid(
        SPORT_TYPE.CRICKET,
        SPORT_TYPE.SOCCER,
        SPORT_TYPE.TENNIS,
        SPORT_TYPE.ESOCCER,
        SPORT_TYPE.BASKETBALL,
        "All",
        "cricket/fancy",
        "casino"
      )
      .required(),
    betType: joi
      .string()
      // .valid("odds", "bookMark", "session", "premium", "casino")
      .optional(),
    betSide: joi.string().valid("ALL", "back", "lay", "yes", "no").optional(),
    page: joi.string().required(),
    limit: joi.string().required(),
    to: joi.string().optional(),
    from: joi.string().optional(),
    oddsValue: joi.number().optional(),
  }),
};

async function handler({ body, user }) {
  const { userId } = user;
  const {
    search,
    type,
    page,
    limit,
    to,
    from,
    oddsValue,
    betSide,
    betType,
    matchId,
  } = body;

  const playerIds = await mongo.bettingApp.model(mongo.models.users).distinct({
    field: "_id",
    query: {
      whoAdd: userId,
    },
  });
  const casinoQuery = {
    isMatchComplete: false,
    userObjectId: { $in: playerIds },
  };
  const query = {
    winner: "",
    userId: { $in: playerIds },
    deleted: false,
  };

  if (to && from) {
    const { endDate, startDate } = getStartEndDateTime(to, from);
    query.createdAt = {
      $gte: startDate,
      $lte: endDate,
    };
  }

  if (oddsValue) {
    query.oddsUp = Number(oddsValue);
  }
  if (betType) {
    if (betType === "odds" || betType === "odds") query.betType = betType;
    else query.selection = betType;
  }
  if (betSide && betSide !== "ALL") {
    query.betSide = betSide;
  }
  if (matchId) {
    query.matchId = mongo.ObjectId(matchId);
  }

  if (search) {
    const userIds = await mongo.bettingApp.model(mongo.models.users).distinct({
      field: "_id",
      query: {
        _id: { $in: playerIds },
        $or: [
          { firstName: { $regex: search, $options: "i" } },
          { lastName: { $regex: search, $options: "i" } },
          { user_name: { $regex: search, $options: "i" } },
        ],
      },
    });
    query.userId = { $in: userIds };
    casinoQuery.userObjectId = { $in: userIds };
  }
  if (type) query.type = type;
  if (type && type === "All")
    query.type = {
      $in: [
        SPORT_TYPE.CRICKET,
        SPORT_TYPE.SOCCER,
        SPORT_TYPE.TENNIS,
        SPORT_TYPE.ESOCCER,
        SPORT_TYPE.BASKETBALL,
      ],
    };
  if (type && type === "cricket/fancy") {
    query.type = "cricket";
    query.betType = "session";
  }
  let casinoBetsInfo = [];

  if (type && type === "casino")
    casinoBetsInfo = await mongo.bettingApp
      .model(mongo.models.casinoMatchHistory)
      .paginate({
        query: casinoQuery,
        page,
        limit,
        populate: {
          path: "userObjectId",
          model: await mongo.bettingApp.model(mongo.models.users),
          select: ["agent_level", "user_name", "whoAdd"],
          populate: {
            path: "whoAdd",
            model: await mongo.bettingApp.model(mongo.models.admins),
            select: ["agent_level", "user_name"],
          },
        },
        sort: {createdAt : -1}
      });

  let betsHistory;
  if (!type || (type && type !== "casino")) {
    betsHistory = await mongo.bettingApp
      .model(mongo.models.betsHistory)
      .paginate({
        query,
        page,
        limit,
        populate: {
          path: "userId",
          model: await mongo.bettingApp.model(mongo.models.users),
          select: ["agent_level", "user_name", "whoAdd"],
          populate: {
            path: "whoAdd",
            model: await mongo.bettingApp.model(mongo.models.admins),
            select: ["agent_level", "user_name"],
          },
        },
        sort: {createdAt : -1},
        select: {
          type: 1,
          matchId: 1,
          betType: 1,
          selection: 1,
          betSide: 1,
          betId: 1,
          createdAt: 1,
          stake: 1,
          oddsUp: 1,
          oddsDown: 1,
          userId: 1,
          exposure: 1,
          subSelection: 1,
          profit: 1,
        },
      });

    betsHistory.results = await betsHistoryDataFiter(betsHistory.results);
  }
  console.log("bets list ::: ", betsHistory);
  const bets = [];
  if (!type || (type && type !== "casino"))
    for await (const bet of betsHistory.results) {
      if (
        bet.type === SPORT_TYPE.CRICKET ||
        bet.type === SPORT_TYPE.SOCCER ||
        bet.type === SPORT_TYPE.TENNIS ||
        bet.type === SPORT_TYPE.ESOCCER ||
        bet.type === SPORT_TYPE.BASKETBALL
      ) {
        let sport = await mongo.bettingApp.model(mongo.models.sports).findOne({
          query: { _id: bet.matchId },
          select: {
            name: 1,
          },
        });
        bet.name = sport.name;
        bets.push(bet);
      }
    }
  else
    for (const casinoBet of casinoBetsInfo.results) {
      const tempBet = {
        _id: casinoBet._id,
        userId: casinoBet.userObjectId,
        createdAt: casinoBet.createdAt,
        type: casinoBet.gameType,
        name: casinoBet.platform,
        betType:
          !casinoBet.betType || casinoBet.betType === ""
            ? ""
            : casinoBet.betType,
        selection: casinoBet.roundId,
        betSide:
          !casinoBet.platformTxId || casinoBet.platformTxId === ""
            ? casinoBet.refPlatformTxId
            : casinoBet.platformTxId,
        oddsUp: casinoBet.betAmount,
        oddsDown: 0,
        stake: casinoBet.betAmount,
        profit: casinoBet.winLostAmount,
        exposure: casinoBet.betAmount,
        tType: casinoBet.gameStatus,
      };
      bets.push(tempBet);
    }

  let sendObject = {};
  if (!type || (type && type !== "casino")) sendObject = betsHistory;
  else sendObject = casinoBetsInfo;

  sendObject.results = bets;
  // } else {
  //   const casinoQuery = {
  //     isMatchComplete: false,
  //   };
  // }
  sendObject.msg = "bet history.";

  return sendObject;
}

module.exports = {
  payload,
  handler,
  auth: true,
};
