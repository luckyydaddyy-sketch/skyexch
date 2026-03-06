const joi = require("joi");
const mongo = require("../../../../config/mongodb");

const payload = {
  body: joi.object().keys({
    id: joi.string().required(),
    title: joi.string().optional(),
    image: joi.string().optional(),
    link: joi.string().optional(),
    Width: joi.string().valid("fullSize", "halfWidth", "squareSize").optional(),
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
  const {
    id,
    title,
    image,
    link,
    Width,
    platform,
    gameType,
    gameCode,
    gameName,
    gameLimit,
  } = body;

  const dashboardImages = await mongo.bettingApp
    .model(mongo.models.dashboardImages)
    .updateOne({
      query: {
        _id: id,
      },
      update: {
        title,
        image,
        link,
        Width,
        platform,
        gameType,
        gameCode,
        gameName,
        gameLimit,
      },
    });

  dashboardImages.msg = "update dashboard Images.";

  return dashboardImages;
}

module.exports = {
  payload,
  handler,
  auth: true,
};
