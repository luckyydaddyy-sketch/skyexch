const joi = require("joi");
const mongo = require("../../../config/mongodb");
const { SPORT_TYPE } = require("../../../constants");
const {
  betsLastExposureOdds,
  betsLastExposure,
  betsLastExposurePremium,
} = require("../../utils/sport/getUserBets");

const payload = {
  body: joi.object().keys({
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
      .required(),
    sorting: joi.string().valid("amount", "expouser").required(),
  }),
};

async function handler({ body, user }) {
  const { type, sorting } = body;

  const userIdsForFind = await mongo.bettingApp
    .model(mongo.models.users)
    .distinct({
      field: "_id",
      query: {
        whoAdd: user?.userId,
      },
    });

  const query = {
    betStatus: { $ne: "completed" },
    deleted: false,
    userId : {$in: userIdsForFind}
  };
  let types = [];
  if (type && type !== "all") {
    query.type = type;
    types = [type];
  }

  if (types.length === 0) {
    types = await mongo.bettingApp.model(mongo.models.betsHistory).distinct({
      field: "type",
      query,
    });
  }

  const userIds = await mongo.bettingApp
    .model(mongo.models.betsHistory)
    .distinct({
      field: "userId",
      query,
    });

  // const e = {
  //   userId: { $in: userIds },
  //   deleted: false,
  //   betStatus: { $ne: "completed" },
  // };

  // const betsInfo = await mongo.bettingApp.model(mongo.models.betsHistory).find({
  //   query,
  //   select: {
  //     _id: 1,
  //     betType: 1,
  //     winner: 1,
  //     selection: 1,
  //     betSide: 1,
  //     matchId: 1,
  //     userId: 1,
  //     profit: 1,
  //     betPlaced: 1,
  //     exposure: 1,
  //     fancyYes: 1,
  //     fancyNo: 1,
  //     oddsUp: 1,
  //     subSelection: 1,
  //   },
  // });
  let userDetails = [];
  for await (const tempType of types) {
    for await (const userId of userIds) {
      let userIndex = userDetails.findIndex((value) => value.userId === userId);
      if (userIndex === -1) {
        const userDetail = await mongo.bettingApp
          .model(mongo.models.users)
          .findOne({
            query: { _id: userId },
            select: {
              user_name: 1,
            },
          });
        userDetails.push({
          userId,
          totalExp: 0,
          betAmount: 0,
          userName: userDetail?.user_name,
        });
      }
      userIndex = userDetails.findIndex((value) => value.userId === userId);

      const matchIds = await mongo.bettingApp
        .model(mongo.models.betsHistory)
        .distinct({
          field: "matchId",
          query: {
            userId,
            deleted: false,
            betStatus: { $ne: "completed" },
            type: tempType,
          },
        });

      for await (const matchId of matchIds) {
        const betTypes = await mongo.bettingApp
          .model(mongo.models.betsHistory)
          .distinct({
            field: "betType",
            query: {
              userId,
              matchId,
              deleted: false,
              betStatus: { $ne: "completed" },
              type: tempType,
            },
          });

        for await (const betType of betTypes) {
          if (betType === "odds" || betType === "bookMark") {
            const { betAmount, oldExpAmount } = await betsLastExposureOdds(
              userId,
              matchId,
              tempType,
              betType
            );
            userDetails[userIndex].betAmount += betAmount;
            userDetails[userIndex].totalExp += oldExpAmount;
          } else if (betType === "session") {
            const selectionList = await mongo.bettingApp
              .model(mongo.models.betsHistory)
              .distinct({
                field: "selection",
                query: {
                  userId,
                  matchId,
                  betType,
                  deleted: false,
                  betStatus: { $ne: "completed" },
                  type: tempType,
                },
              });

            for await (const selection of selectionList) {
              const { exposure, betAmount } = await betsLastExposure(
                userId,
                selection,
                matchId,
                tempType,
                betType
              );

              userDetails[userIndex].betAmount += betAmount;
              userDetails[userIndex].totalExp += exposure;
            }
          } else if (betType === "premium") {
            const selectionList = await mongo.bettingApp
              .model(mongo.models.betsHistory)
              .distinct({
                field: "selection",
                query: {
                  userId,
                  matchId,
                  betType,
                  deleted: false,
                  betStatus: { $ne: "completed" },
                  type: tempType,
                },
              });

            for await (const selection of selectionList) {
              const { betAmount, oldExposure } = await betsLastExposurePremium(
                userId,
                selection,
                matchId,
                tempType,
                betType
              );

              userDetails[userIndex].betAmount += betAmount;
              userDetails[userIndex].totalExp += oldExposure;
            }
          }
        }
      }
    }
  }

  if (sorting === "amount") {
    userDetails = userDetails.sort((a, b) => b.betAmount - a.betAmount);
  } else if (sorting === "expouser") {
    userDetails = userDetails.sort((a, b) => a.totalExp - b.totalExp);
  }

  const finalResult = userDetails.slice(0, 20);

  const sendObject = {
    result: finalResult,
    msg: "get list of bet big amount and expocure wise.",
  };

  return sendObject;
}

module.exports = {
  payload,
  handler,
  auth: true,
};
