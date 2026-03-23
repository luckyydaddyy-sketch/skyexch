const joi = require("joi");

const mongo = require("../../../../config/mongodb");
const { USER_LEVEL_NEW } = require("../../../../constants");

const payload = {
  query: joi.object().keys({}),
};

async function handler({ user }) {

  let query = {}
  if(user.role !== USER_LEVEL_NEW.COM){
    const adminInfo = await mongo.bettingApp.model(mongo.models.admins).findOne({
      query:{
        _id : mongo.ObjectId(user.userId)
      },
      select:{
        domain :1
      }
    }) 

    console.log("website :list : adminInfo :: ", adminInfo)
    if(adminInfo){
      query = {
        _id : {
          $in : adminInfo.domain
        },
        isDeleted: { $ne: true }
      }
    }
  } else {
    query = {
      isDeleted: { $ne: true }
    }
  }

  const siteInfo = await mongo.bettingApp.model(mongo.models.websites).find({query});

  siteInfo.msg = "webSite info!";

  return siteInfo;
}

module.exports = {
  payload,
  handler,
  auth: true,
};
