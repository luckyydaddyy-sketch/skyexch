const mongo = require("../config/mongodb");

const test = async () => {
  console.time(" call the query ");
  const query = {
    userId: "supercasiboss2",
    // userId: "supercasiratna",
    platform: "FASTSPIN",
  };
  const betIfo = await mongo.bettingApp
    .model(mongo.models.casinoMatchHistory)
    .aggregate({
      pipeline: [
        {
          $match: query,
        },
        {
          $group: {
            _id: null,
            betAmount: { $sum: "$betAmount" },
          },
        },
        {
          $project: {
            betAmount: 1,
          },
        },
      ],
    });
  console.log(" betIfo ::  ", betIfo);
  const adminInfo = await mongo.bettingApp
    .model(mongo.models.casinoMatchHistory)
    .aggregate({
      pipeline: [
        {
          $match: query,
        },
        {
          $lookup: {
            from: "statements",
            let: { userId: "$userObjectId", casinoId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$userId", "$$userId"] },
                      { $eq: ["$casinoMatchId", "$$casinoId"] },
                    ],
                  },
                },
              },
              {
                $project: { _id: 1, credit: 1, debit: 1 },
              },
            ],
            as: "data",
          },
        },
        {
          $project: {
            userId: 1,
            betAmount: 1,
            data: 1,
          },
        },
        {
          $unwind: {
            path: "$data",
            // includeArrayIndex: 'string',
            // preserveNullAndEmptyArrays: boolean
          },
        },
        // {
        //   $limit: 5,
        // },
        {
          $group: {
            _id: "$userId",
            // totalBet: {
            //   $sum: "$betAmount",
            // },
            winSum: {
              $sum: "$data.credit",
            },
            lostSum: {
              $sum: "$data.debit",
            },
          },
        },
        {
          $project: {
            _id: 1,
            winSum: 1,
            lostSum: 1,
            totalAmount: { $subtract: ["$winSum", "$lostSum"] },
          },
        },
      ],
    });
  console.timeEnd(" call the query ");
  console.log("adminInfo :: ", adminInfo);
};

test();
