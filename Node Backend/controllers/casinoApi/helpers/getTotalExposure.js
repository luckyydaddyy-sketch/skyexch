const mongo = require("../../../config/mongodb");

async function getTotalExposure(adminId) {
    if (!adminId) return 0;

    try {
        // Senior Dev Optimization: Use Aggregation to calculate exposure on the database side
        // This avoids loading thousands of documents into Node.js memory, preventing OOM crashes.
        const result = await mongo.bettingApp.model(mongo.models.casinoMatchHistory).aggregate({
            pipeline: [
                { $match: { isMatchComplete: false } },
                {
                    $lookup: {
                        from: "users",
                        localField: "userObjectId",
                        foreignField: "_id",
                        as: "user"
                    }
                },
                { $unwind: "$user" },
                {
                    $match: {
                        "user.whoAdd": mongo.ObjectId(adminId),
                        "user.status": "active"
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalExposure: { $sum: "$betAmount" }
                    }
                }
            ]
        });

        return result[0]?.totalExposure || 0;
    } catch (error) {
        console.error("Error in optimized getTotalExposure:", error);
        return 0; // Fallback to 0 to prevent downstream crashes
    }
}

module.exports = {
    getTotalExposure
}