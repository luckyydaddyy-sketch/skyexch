const joi = require("joi");
const mongo = require("../../../config/mongodb");

const payload = {
  body: joi.object().keys({}),
};

async function handler({ body, user }) {
  await mongo.bettingApp.model(mongo.models.admins).updateMany({
    update: {
      $set: {
        balance: 0,
        remaining_balance: 0,
        exposure: 0.0,
        cumulative_pl: 0.0,
        ref_pl: 0.0,
        credit_ref: 0,
        exposer_limit: 0.0,
      },
    },
  });
  await mongo.bettingApp.model(mongo.models.users).updateMany({
    update: {
      $set: {
        balance: 0,
        remaining_balance: 0,
        exposure: 0,
        cumulative_pl: 0,
        ref_pl: 0,
        credit_ref: 0,
        exposer_limit: 0.0,
      },
    },
  });
  await mongo.bettingApp.model(mongo.models.blockMatch).deleteMany({});
  await mongo.bettingApp.model(mongo.models.betsHistory).deleteMany({});
  await mongo.bettingApp.model(mongo.models.activities).deleteMany({});
  await mongo.bettingApp.model(mongo.models.sports).deleteMany({});
  await mongo.bettingApp.model(mongo.models.sportsLeage).deleteMany({});
  await mongo.bettingApp.model(mongo.models.statements).deleteMany({});
  // await mongo.bettingApp.model(mongo.models.users).deleteMany({});
  // await mongo.bettingApp.model(mongo.models.stacks).deleteMany({});
  await mongo.bettingApp.model(mongo.models.casinoBonus).deleteMany({});
  await mongo.bettingApp.model(mongo.models.casinoMatchHistory).deleteMany({});
  await mongo.bettingApp.model(mongo.models.pins).deleteMany({});
  await mongo.bettingApp.model(mongo.models.blockMarketLists).deleteMany({});
  await mongo.bettingApp.model(mongo.models.tokens).deleteMany({});
  let deleteDocument = {};

  deleteDocument.msg = "data is clear.";

  return deleteDocument;
}
handler({
  body: 0,
  user: 0,
});
module.exports = {
  payload,
  handler,
  auth: true,
};
