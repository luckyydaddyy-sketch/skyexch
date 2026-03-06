const mongo = require("../../../config/mongodb");
const { USER_LEVEL, USER_LEVEL_NEW } = require("../../../constants");

async function getAdminUserInfo(whoAdd, myId, adminId) {
  console.log(" getAdminUserInfo :: whoAdd :: ", whoAdd);
  console.log(" getAdminUserInfo :: myId :: ", myId);
  console.log(" getAdminUserInfo :: adminId :: ", adminId);
  whoAdd.push(myId);
  const query = {
    _id: { $in: whoAdd },
  };
  const adminInfo = await mongo.bettingApp.model(mongo.models.admins).findOne({
    query: { _id: mongo.ObjectId(adminId) },
    select: {
      _id: 1,
      user_name: 1,
      agent_level: 1,
    },
  });

  if (adminInfo.agent_level === USER_LEVEL_NEW.SUO) {
    query.agent_level = {
      $nin: [USER_LEVEL_NEW.COM],
    };
  } else if (adminInfo.agent_level === USER_LEVEL_NEW.WL) {
    query.agent_level = {
      $nin: [USER_LEVEL_NEW.COM, USER_LEVEL_NEW.SUO],
    };
  } else if (adminInfo.agent_level === USER_LEVEL_NEW.SP) {
    query.agent_level = {
      $nin: [USER_LEVEL_NEW.COM, USER_LEVEL_NEW.SUO, USER_LEVEL_NEW.WL],
    };
  } else if (adminInfo.agent_level === USER_LEVEL_NEW.AD) {
    query.agent_level = {
      $nin: [
        USER_LEVEL_NEW.COM,
        USER_LEVEL_NEW.SP,
        USER_LEVEL_NEW.WL,
        USER_LEVEL_NEW.SUO,
      ],
    };
  } else if (adminInfo.agent_level === USER_LEVEL_NEW.SUA) {
    query.agent_level = {
      $nin: [
        USER_LEVEL_NEW.COM,
        USER_LEVEL_NEW.SP,
        USER_LEVEL_NEW.WL,
        USER_LEVEL_NEW.SUO,
        USER_LEVEL_NEW.AD,
      ],
    };
  } else if (adminInfo.agent_level === USER_LEVEL_NEW.SS) {
    query.agent_level = {
      $nin: [
        USER_LEVEL_NEW.COM,
        USER_LEVEL_NEW.SP,
        USER_LEVEL_NEW.WL,
        USER_LEVEL_NEW.SUO,
        USER_LEVEL_NEW.AD,
        USER_LEVEL_NEW.SUA,
      ],
    };
  } else if (adminInfo.agent_level === USER_LEVEL_NEW.S) {
    query.agent_level = {
      $nin: [
        USER_LEVEL_NEW.COM,
        USER_LEVEL_NEW.SP,
        USER_LEVEL_NEW.WL,
        USER_LEVEL_NEW.SUO,
        USER_LEVEL_NEW.AD,
        USER_LEVEL_NEW.SUA,
        USER_LEVEL_NEW.SS,
      ],
    };
  } else if (adminInfo.agent_level === USER_LEVEL_NEW.M) {
    query.agent_level = {
      $nin: [
        USER_LEVEL_NEW.COM,
        USER_LEVEL_NEW.SP,
        USER_LEVEL_NEW.WL,
        USER_LEVEL_NEW.SUO,
        USER_LEVEL_NEW.AD,
        USER_LEVEL_NEW.SUA,
        USER_LEVEL_NEW.SS,
        USER_LEVEL_NEW.S,
      ],
    };
  }

  console.log(" getAdminUserInfo :: query :: ", query);
  const uperLineInfo = await mongo.bettingApp.model(mongo.models.admins).find({
    query,
    select: {
      _id: 1,
      user_name: 1,
      agent_level: 1,
    },
  });

  return uperLineInfo;
}

module.exports = {
  getAdminUserInfo,
};
