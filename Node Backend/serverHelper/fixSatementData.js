const mongo = require("../config/mongodb");

const manageSatementAfterRemoveScript = async (date, userId) => {
  console.log(" manualiy manageSatementAfterRemove ::: date : ", date);
  console.log(" manualiy manageSatementAfterRemove ::: userId : ", userId);
  const queryBeforData = {
    userId: mongo.ObjectId(userId),
    createdAt: { $lt: new Date(date) },
  };
  console.log(
    userId,
    " manualiy manageSatementAfterRemove ::: queryBeforData : ",
    queryBeforData
  );
  const queryAfterData = {
    userId: mongo.ObjectId(userId),
    createdAt: { $gte: new Date(date) },
  };
  console.log(
    userId,
    " manualiy manageSatementAfterRemove ::: queryAfterData : ",
    queryAfterData
  );

  const afterData = await mongo.bettingApp.model(mongo.models.statements).find({
    query: queryAfterData,
  });
  console.log(
    userId,
    " manualiy manageSatementAfterRemove ::: afterData : ",
    afterData
  );

  if (afterData.length > 0) {
    const beforData = await mongo.bettingApp
      .model(mongo.models.statements)
      .findOne({
        query: queryBeforData,
        sort: { createdAt: -1 },
      });
    if (beforData) {
      console.log(
        userId,
        " manualiy manageSatementAfterRemove ::: beforData : ",
        beforData
      );
      let userMainBlance = beforData.balance;

      for await (const stateInfo of afterData) {
        if (stateInfo.credit > 0) {
          userMainBlance += stateInfo.credit;
        } else if (stateInfo.debit > 0) {
          userMainBlance -= stateInfo.debit;
        }

        await mongo.bettingApp.model(mongo.models.statements).updateOne({
          query: { _id: stateInfo._id },
          update: {
            $set: {
              balance: userMainBlance,
            },
          },
        });
      }
    }

    return true;
  } else {
    return true;
  }
};
module.exports = {
  manageSatementAfterRemoveScript,
};
// manageSatementAfterRemoveScript(
//   "2023-08-10T08:09:32.013Z",
//   "64d47e6cc294bc6b78ea0bf1"
// );
