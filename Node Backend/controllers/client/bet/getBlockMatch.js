const joi = require("joi");
const mongo = require("../../../config/mongodb");

const payload = {
  body: joi.object().keys({
    matchId: joi.string().allow("", null).optional(),
  }),
};

async function handler({ body, user }) {
  const { userId } = user;
  const { matchId } = body;

  let blockMatchQuery = {};
  let blockMatchDetail = {};

  // If no matchId provided (e.g. FastOdds event not yet synced to DB), return empty
  if (!matchId) {
    blockMatchDetail = {
      blockMatchDetail: {},
    };
    blockMatchDetail.msg = "get block match.";
    return blockMatchDetail;
  }

  const playerDetail = await mongo.bettingApp
    .model(mongo.models.users)
    .findOne({
      query: {
        _id: mongo.ObjectId(userId),
      },
      select: {
        admin: 1,
        whoAdd: 1
      },
    });
    // console.log("getBloackMatch : playerDetail :: ", playerDetail);
    
  if (playerDetail) {
    let matchIdFilter = matchId;
    if (mongo.isValidObjectId(matchId)) {
      matchIdFilter = { $in: [matchId, mongo.ObjectId(matchId)] };
    }

    blockMatchQuery = {
      userId: { $in: playerDetail.whoAdd },
      matchId: matchIdFilter,
    };
    // console.log("getBloackMatch :: blockMatchQuery :: ", blockMatchQuery);

    const blockMatchSend = await mongo.bettingApp
      .model(mongo.models.blockMatch)
      .findOne({
        query: blockMatchQuery,
      });

      // console.log("getBloackMatch :: blockMatchSend :: ", blockMatchSend);
      
    blockMatchDetail = {
      blockMatchDetail: blockMatchSend ? blockMatchSend : {},
    };
  }

  blockMatchDetail.msg = "get block match.";

  return blockMatchDetail;
}

module.exports = {
  payload,
  handler,
  auth: true,
};
