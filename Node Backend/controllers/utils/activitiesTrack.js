const mongo = require("../../config/mongodb");

async function activitiesTrack(document) {
  await mongo.bettingApp.model(mongo.models.activities).insertOne({
    document,
  });

  return true;
}

module.exports = activitiesTrack;
