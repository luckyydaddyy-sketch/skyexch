const config = require("../config/config");
const mongo = require("../config/mongodb");

async function init() {
  let defaultString = "casi";
  const userData = await mongo.bettingApp.model(mongo.models.users).find({
    query: { isCasinoUser: true },
    select: {
      _id: 1,
      user_name: 1,
    },
  });

  for await (const user of userData) {
    await mongo.bettingApp.model(mongo.models.users).updateOne({
      query: { _id: user._id },
      update: {
        casinoUserName: `${config.PRIFIX}${defaultString}${user.user_name}`,
      },
    });
    console.log("script continues::");
  }

  console.log("script Done::");
}

init();
