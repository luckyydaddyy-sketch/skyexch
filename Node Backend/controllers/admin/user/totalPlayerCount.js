const joi = require("joi");
// const httpStatus = require("http-status");
// var randomstring = require("randomstring");

const mongo = require("../../../config/mongodb");
// const ApiError = require("../../../utils/ApiError");
// const auth = require("../../../utils/auth");
// const CUSTOM_MESSAGE = require("../../../utils/message");
const { getDate } = require("../../../utils/comman/date");
const { USER_LEVEL_NEW } = require("../../../constants");

const payload = {
  body: joi.object().keys({
    id: joi.string().optional(),
  }),
};

async function handler({ body, user }) {
  const { id } = body;
  const { userId } = user;
  const adminDetail = await mongo.bettingApp
    .model(mongo.models.admins)
    .findOne({
      query:{
        _id: userId
      }, select:{
        domain:1,
        agent_level:1,
      }
    });

  const totalUsers = await mongo.bettingApp
    .model(mongo.models.users)
    .countDocuments({
      query:{
        whoAdd : userId
      }
    });
   const {endDate, startDate} = getDate("yesterday");
   console.log("startDate : ", startDate);
  const yesterdayTotalUsers = await mongo.bettingApp
    .model(mongo.models.users)
    .countDocuments({
      query: {
        whoAdd : userId,
        createdAt: { $gte: startDate },
      },
    });
  const queryWebSite = {};
  console.log("adminDetail : ", adminDetail);
  if (adminDetail.agent_level !== USER_LEVEL_NEW.COM) {
    queryWebSite._id = {$in : adminDetail.domain};
  }
  const websites = await mongo.bettingApp.model(mongo.models.websites).find({
    query: queryWebSite,
    select: {
      _id: 1,
      domain: 1,
    },
  });

  const websiteList = [];
  let totalUsersForList = 0;
  for await (const webId of websites) {
    const userList = await mongo.bettingApp.model(mongo.models.admins).find({
      query: {
        domain: webId._id,
        whoAdd : userId
      },
      select: {
        firstName: 1,
        user_name: 1,
      },
    });

    const userString = userList
      .map((value) => {
        return `${value.user_name}(${value.firstName})`;
      })
      .join(",");
    totalUsersForList += userList.length;
    const siteData = {
      name: webId.domain,
      users: userString,
      count: userList.length,
    };

    websiteList.push(siteData);
  }
  let resData = {
    totalUsers,
    yesterdayTotalUsers,
    websiteList,
    totalUsersForList,
    msg: "Token verifed.",
  };
  return resData; // Return response
}

module.exports = {
  payload,
  handler,
  auth: true,
};
