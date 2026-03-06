const config = require("../../../config/config");
const mongo = require("../../../config/mongodb");

async function getDomainList(userInfo) {
  const data = [];
  for await (const user of userInfo) {
    const domainList = await mongo.bettingApp
      .model(mongo.models.websites)
      .find({
        query: { _id: { $in: user.domain } },
        select: { domain: 1 },
      });
    user.domain = domainList;
    data.push(user);
  }

  return data;
}

async function checkUserNameIsAvalibleOrNot(user_name) {
  console.log("checkUserNameIsAvalibleOrNot : user_name :::", user_name);
  let flag = false;

  let findQuery = {};

  if (config.IS_CASE_SENSITIVE_LOGIN) {
    findQuery = {
      user_name,
    };
  } else {
    findQuery = {
      user_name: { $regex: `^${user_name}$`, $options: "i" },
    };
  }

  const adminInfo = await mongo.bettingApp.model(mongo.models.admins).findOne({
    query: findQuery,
    select: { user_name: 1 },
  });
  const userInfo = await mongo.bettingApp.model(mongo.models.users).findOne({
    query: findQuery,
    select: { user_name: 1 },
  });

  if (adminInfo || userInfo) flag = true;
  return flag;
}

async function getAllUsersIdsByDownline(userId, userIds) {
  const adminInfo = await mongo.bettingApp.model(mongo.models.admins).findOne({
    query: { _id: userId },
    select: { player: 1, agent: 1 },
  });

  if (adminInfo) {
    userIds = userIds.concat(adminInfo.player);

    if (adminInfo.agent.length > 0) {
      for await (const agent of adminInfo.agent) {
        userIds = await getAllUsersIdsByDownline(agent, userIds);
      }
    }
  }

  return userIds;
}
module.exports = {
  getDomainList,
  checkUserNameIsAvalibleOrNot,
  getAllUsersIdsByDownline,
};
