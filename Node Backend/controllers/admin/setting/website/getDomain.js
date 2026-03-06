const joi = require("joi");

const mongo = require("../../../../config/mongodb");
const { USER_LEVEL_NEW } = require("../../../../constants");

const payload = {
  query: joi.object().keys({}),
};

async function handler({ user }) {
  console.log(" get domain user ::: ", user)

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

    console.log("domain : adminInfo :: ", adminInfo)
    if(adminInfo){
      query = {
        _id : {
          $in : adminInfo.domain
        }
      }
    }
  }

  const siteInfo = await mongo.bettingApp.model(mongo.models.websites).find({
    query,
    select: {
      domain: 1,
      title: 1,
      _id: 1,
    },
  });

  console.log("siteInfo :: ", siteInfo);
  siteInfo.msg = "webSite domain info!";
  return siteInfo;
}

module.exports = {
  payload,
  handler,
  auth: true,
};
