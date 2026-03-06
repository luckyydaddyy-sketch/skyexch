const mongo = require("../../../../config/mongodb");

// get regPl from vailble balance - credit refPl = RefPl
const calculatMyRefPl = async (userId) => {
  const plDetail = await mongo.bettingApp.model(mongo.models.users).aggregate({
    pipeline: [
      { $match: { whoAdd: userId } },
      { $group: { _id: "myPl", total: { $sum: "$ref_pl" } } },
    ],
  });
  console.log("calculatMyRefPl :: plDetail :: ", plDetail);
  console.log("calculatMyRefPl :: plDetail.length :: ", plDetail.length);
  return plDetail.length > 0 ? plDetail[0].total : 0;
};

// only for admin users
const calculatMyAvailbleBalance = async (userId) => {
  const AdDetail = await mongo.bettingApp.model(mongo.models.admins).aggregate({
    pipeline: [
      {
        $match: {
          $or: [
            {
              whoAdd: userId,
            },
            { _id: userId },
          ],

          // whoAdd: userId
        },
      },
      {
        $group: {
          _id: "remaining_balance",
          total: { $sum: "$remaining_balance" },
        },
      },
    ],
  });
  const plDetail = await mongo.bettingApp.model(mongo.models.users).aggregate({
    pipeline: [
      { $match: { whoAdd: userId } },
      { $group: { _id: "balance", total: { $sum: "$remaining_balance" } } },
    ],
  });
  console.log("calculatMyAvailbleBalance :: plDetail :: ", plDetail);
  console.log(
    "calculatMyAvailbleBalance :: plDetail.length :: ",
    plDetail.length
  );
  const plAmount = plDetail.length > 0 ? plDetail[0].total : 0;
  const adAmount = AdDetail.length > 0 ? AdDetail[0].total : 0;
  return plAmount + adAmount;
};

module.exports = { calculatMyRefPl, calculatMyAvailbleBalance };
