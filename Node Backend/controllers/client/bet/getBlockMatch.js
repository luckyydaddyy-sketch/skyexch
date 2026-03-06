const joi = require("joi");
const mongo = require("../../../config/mongodb");

const payload = {
  body: joi.object().keys({
    matchId: joi.string().required(),
  }),
};

async function handler({ body, user }) {
  const { userId } = user;
  const { matchId } = body;

  let blockMatchQuery = {};
  let blockMatchDetail = {};

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
    blockMatchQuery = {
      userId: {$in : playerDetail.whoAdd},
      matchId: mongo.ObjectId(matchId),
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
