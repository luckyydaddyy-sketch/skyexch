const mongo = require("../config/mongodb");
const role = require("./roles");
const sports = require("./sports");
const accountSatem = require("./accountSatem");
const activities = require("./activities");
const betsHistory = require("./betsHistory");

async function insertData() {
  for await (const data of role) {
    console.log("----- i ----");
    await mongo.bettingApp.model(mongo.models.roles).insertOne({
      document: data,
    });
  }
}

insertData();
