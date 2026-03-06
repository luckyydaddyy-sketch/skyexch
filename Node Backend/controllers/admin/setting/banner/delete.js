const joi = require("joi");
const fs = require("fs");
const mongo = require("../../../../config/mongodb");

const payload = {
  body: joi.object().keys({
    id: joi.string().required(),
  }),
};

async function handler({ body }) {
  const { id } = body;

  const banner = await mongo.bettingApp.model(mongo.models.banners).findOne({
    query: {
      _id: id,
    },
  });

  if (
    banner &&
    typeof banner.fileName !== "undefined" &&
    fs.existsSync(`./uploads/${banner.fileName}`)
  ) {
    // console.log("file is here");
    fs.unlinkSync(`./uploads/${banner.fileName}`);
  }

  await mongo.bettingApp.model(mongo.models.banners).deleteOne({
    query: {
      _id: id,
    },
  });

  banner.msg = "deleted banner Images.";

  return banner;
}

module.exports = {
  payload,
  handler,
  auth: true,
};
