const joi = require("joi");
const mongo = require("../../../config/mongodb");
const { SPORT_TYPE } = require("../../../constants");
const payload = {
  body: joi.object().keys({
    sportId: joi.string().required(), // stortId
    type: joi
      .string()
      .valid(
        SPORT_TYPE.CRICKET,
        SPORT_TYPE.SOCCER,
        SPORT_TYPE.TENNIS,
        SPORT_TYPE.ESOCCER,
        SPORT_TYPE.BASKETBALL
      )
      .required(),
    flag: joi.boolean().required(), // true = pin and false = unpin
  }),
};

async function handler({ body, user }) {
  const { sportId, type, flag } = body;
  const { userId } = user;
  if (flag) {
    await mongo.bettingApp.model(mongo.models.pins).findOneAndUpdate({
      query: {
        userId,
        type,
      },
      update: {
        $push: {
          pin: mongo.ObjectId(sportId),
        },
      },
      options: {
        upsert: true,
        new: true,
      },
    });
  } else {
    await mongo.bettingApp.model(mongo.models.pins).findOneAndUpdate({
      query: {
        userId,
        type,
      },
      update: {
        $pull: {
          pin: mongo.ObjectId(sportId),
        },
      },
      options: {
        upsert: true,
        new: true,
      },
    });
  }

  const sendObject = {
    msg: "add in pin.",
  };

  return sendObject; // Return response
}

module.exports = {
  payload,
  handler,
  auth: true,
};
