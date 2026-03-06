const joi = require("joi");
const mongo = require("../../../config/mongodb");
const payload = {
  body: joi.object().keys({
    defaultStack: joi.number().optional(),
    stack: joi.array().items(joi.number().required()).optional(),
    highLightsOdds: joi.boolean().optional(),
    acceptFancyOdds: joi.boolean().optional(),
    acceptBookmakerOdds: joi.boolean().optional(),
  }),
};

async function handler({ body, user }) {
  const {
    defaultStack,
    stack,
    highLightsOdds,
    acceptFancyOdds,
    acceptBookmakerOdds,
  } = body;
  const { userId } = user;
  const stackInfo = await mongo.bettingApp
    .model(mongo.models.stacks)
    .findOneAndUpdate({
      query: {
        userId,
      },
      update: {
        $set: {
          defaultStack,
          stack,
          highLightsOdds,
          acceptFancyOdds,
          acceptBookmakerOdds,
        },
      },
      options: {
        upsert: true,
        returnNewDocument: true,
        new: true,
      },
    });

  if (stackInfo) stackInfo.msg = "update stack info.";

  return stackInfo; // Return response
}

module.exports = {
  payload,
  handler,
  auth: true,
};
