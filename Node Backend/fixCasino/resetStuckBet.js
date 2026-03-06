const mongo = require("../config/mongodb");
const { USER_LEVEL_NEW } = require("../constants");
const { casinoStateMentTrack } = require("../controllers/utils/statementTrack");

async function fixIssue() {
  let count = await mongo.bettingApp
    .model(mongo.models.casinoMatchHistory)
    .countDocuments({
      query: {
        isMatchComplete: false,
        // createdAt: { $lte: new Date("2023-10-21T15:40:07.778Z") },
      },
    });
  console.log("count :: ", count);
  const betType = "casino";
  while (count > 0) {
    let betInfo = await mongo.bettingApp
      .model(mongo.models.casinoMatchHistory)
      .findOne({
        query: {
          isMatchComplete: false,
          // createdAt: { $lte: new Date("2023-10-21T15:40:07.778Z") },
        },
        select: {
          userObjectId: 1,
          betAmount: 1,
          platform: 1,
          gameName: 1,
          gameType: 1,
        },
      });
    console.log("betInfo :: ", betInfo);

    const userData = await mongo.bettingApp
      .model(mongo.models.users)
      .findOneAndUpdate({
        query: {
          _id: betInfo.userObjectId,
        },
        update: {
          $inc: {
            balance: -betInfo.betAmount,
            remaining_balance: -betInfo.betAmount,
            cumulative_pl: -betInfo.betAmount,
            ref_pl: -betInfo.betAmount,
          },
        },
        options: {
          returnNewDocument: true,
          new: true,
        },
      });
    console.log("userData :: ", userData);

    // cut or plush amount to this user
    const adminInfo = await mongo.bettingApp
      .model(mongo.models.admins)
      .findOneAndUpdate({
        query: {
          _id: { $in: userData.whoAdd },
          agent_level: USER_LEVEL_NEW.COM,
        },
        update: {
          $inc: {
            // remaining_balance: Number(win.toFixed(2)),
            remaining_balance: betInfo.betAmount,
          },
        },
        options: {
          returnNewDocument: true,
          new: true,
        },
      });

    const document = {
      userId: betInfo.userObjectId,
      credit: 0,
      debit: -betInfo.betAmount,
      balance: userData.remaining_balance,
      Remark: `${betInfo.platform}/${betInfo.gameName}/${betType}/${betInfo.gameType}`,
      betType: betType,
      betAmount: betInfo.betAmount,
      casinoMatchId: betInfo._id,
      type: "casino",
      amountOfBalance:userInfo.balance
    };

    await mongo.bettingApp.model(mongo.models.statements).insertOne({
      document,
    });

    const documentAdmin = {
      userId: adminInfo._id,
      openSportBetUserId: betInfo.userObjectId,
      credit: betInfo.betAmount,
      debit: 0,
      balance: adminInfo.remaining_balance,
      Remark: `${betInfo.platform}/${betInfo.gameName}/${betType}/${betInfo.gameType}`,
      betType: betType,
      betAmount: betInfo.betAmount,
      casinoMatchId: betInfo._id,
      type: "casino",
      amountOfBalance:adminInfo.balance
    };

    await mongo.bettingApp.model(mongo.models.statements).insertOne({
      document: documentAdmin,
    });

    await mongo.bettingApp.model(mongo.models.casinoMatchHistory).updateOne({
      query: {
        _id: betInfo._id,
      },
      update: {
        $set: {
          gameStatus: "LOSE",
          isMatchComplete: true,
          winLostAmount: betInfo.betAmount,
          manualiySet: true,
        },
      },
    });
    count -= 1;
  }
}

fixIssue();
