const mongo = require("../config/mongodb");
const { USER_LEVEL_NEW } = require("../constants");

async function defultData() {
  const adminInfo = await mongo.bettingApp.model(mongo.models.admins).findOne({
    query: { user_name: "adminUser" },
    select: {
      user_name: 1,
    },
  });

  if (!adminInfo) {
    await mongo.bettingApp.model(mongo.models.admins).insertOne({
      document: {
        password: "admin123",
        agent_level: USER_LEVEL_NEW.COM,
        user_name: "adminUser",
      },
    });
  }
}

module.exports = defultData;
