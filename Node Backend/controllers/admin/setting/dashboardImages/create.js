const joi = require("joi");
const mongo = require("../../../../config/mongodb");

const payload = {
  body: joi.object().keys({
    domain: joi.string().required(),
    title: joi.string().required(),
    image: joi.string().required(),
    link: joi.string().optional(),
    Width: joi.string().valid("fullSize", "halfWidth", "squareSize").required(),
    platform: joi.string().optional().allow(""),
    gameType: joi.string().optional().allow(""),
    gameCode: joi.string().optional().allow(""),
    gameName: joi.string().optional().allow(""),
    gameLimit: joi.string().optional().allow(""),
    catalog: joi.string().optional().allow(""),
    isLatest: joi.boolean().optional(),
  }),
};

async function handler({ body }) {
  const dashboardImages = await mongo.bettingApp
    .model(mongo.models.dashboardImages)
    .insertOne({
      document: body,
    });

  dashboardImages.msg = "Create dashboard Images.";

  return dashboardImages;
}

module.exports = {
  payload,
  handler,
  auth: true,
};
