const mongo = require("../../../config/mongodb");

async function getTotalExposure(adminId) {
    const userIds = await mongo.bettingApp.model(mongo.models.users).distinct({
        query : { whoAdd : mongo.ObjectId(adminId), status:"active" },
        field:"_id"
      });

    const getAllOnGoingMatch = await mongo.bettingApp.model(mongo.models.casinoMatchHistory).find({
        query : { userObjectId : { $in : userIds }, isMatchComplete: false },
        select:{
            betAmount: 1
        }
      });
    let totalExposure = 0;
    for await(const match of getAllOnGoingMatch) {
        totalExposure += match.betAmount;
    }

    return totalExposure;
}

module.exports = {
    getTotalExposure
}