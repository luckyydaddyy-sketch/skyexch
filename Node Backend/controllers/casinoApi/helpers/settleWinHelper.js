const mongo = require("../../../config/mongodb");
const { USER_LEVEL_NEW } = require("../../../constants");
const settleWinHelper = async (
  betQuery,
  query,
  status,
  turnover,
  betAmount,
  winLoss,
  minusBetAmountObject = null,
  userInfoInput = null
) => {
  betQuery.isMatchComplete = false;
  const modificationObject = await mongo.bettingApp
    .model(mongo.models.casinoMatchHistory)
    .updateOne({
      query: betQuery,
      update: {
        $set: {
          isMatchComplete: true,
          gameStatus: status,
          winLostAmount: turnover,
        },
      },
    });

  console.log(
    new Date(),
    " settleWinHelper :: modificationObject ::: ",
    modificationObject
  );

  if (modificationObject.modifiedCount || betAmount === 0) {
    if (betAmount > 0 || (minusBetAmountObject && minusBetAmountObject.isUseLost))
      await mongo.bettingApp.model(mongo.models.users).updateOne({
        query,
        update: {
          $inc: {
            balance: minusBetAmountObject && minusBetAmountObject.isUseLost ? minusBetAmountObject?.winLostAmount : betAmount,
            exposure: -betAmount,
          },
        },
      });

    // const tempWinLoss = winLoss ? winLoss : winAmount - betAmount;
    await mongo.bettingApp.model(mongo.models.users).updateOne({
      query,
      update: {
        $inc: {
          remaining_balance: winLoss,
          balance: winLoss,
          cumulative_pl: winLoss,
          ref_pl: winLoss,
          casinoWinings: winLoss, // casino win amount inc
        },
      },
    });

    // Find user information
    const userInfo = userInfoInput || await mongo.bettingApp.model(mongo.models.users).findOne({
      query,
      select: {
        whoAdd: 1,
      },
    });

    // update casino amount in admin
    await mongo.bettingApp.model(mongo.models.admins).updateOne({
      query: {
        _id: { $in: userInfo.whoAdd },
        agent_level: USER_LEVEL_NEW.WL,
      },
      update: {
        $inc: {
          casinoWinings: winLoss, // casino win amount inc
        },
      },
    });
  }
  return true;
};

module.exports = {
  settleWinHelper,
};
