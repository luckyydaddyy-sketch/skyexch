const mongo = require("../../../../config/mongodb");
const {
  winnerStatementTrack,
  removeStatementTrack,
  removeStatementTrackSports,
} = require("../../../utils/statementTrack");
const {
  sendUpdateBalanceEvent,
} = require("../../../../utils/comman/updateBalance");
const { getRedLock } = require("../../../../config/redLock");

async function distributAmountSub(odds, matchId, selection, betType) {
  const getLock = getRedLock();
  console.log(new Date(), "distributAmount :: odds :: betType : ", betType);
  console.log(JSON.stringify(odds));
  const { userId, exposure, winInfo } = odds;
  const userLock = await getLock.acquire([userId], 2000);
  try {
    const userQuery = {
      _id: userId,
    };

    const tempDetail = await mongo.bettingApp
      .model(mongo.models.users)
      .findOne({
        query: userQuery,
        select: {
          user_name: 1,
          balance: 1,
          exposure: 1,
          remaining_balance: 1,
        },
      });
    console.log(
      new Date(),
      exposure,
      "distributAmount : exposure remove from user account : before User Data : tempDetail:",
      tempDetail
    );

    // console.log("exposure remove from user account : exposure : ", exposure);
    await mongo.bettingApp.model(mongo.models.users).updateOne({
      query: userQuery,
      update: {
        $inc: {
          exposure: -exposure,
          balance: exposure,
        },
      },
    });

    const tempDetailAfterUpdate = await mongo.bettingApp
      .model(mongo.models.users)
      .findOne({
        query: userQuery,
        select: {
          user_name: 1,
          balance: 1,
          exposure: 1,
          remaining_balance: 1,
        },
      });
    console.log(
      new Date(),
      "distributAmount : exposure remove from user account : after User Data : tempDetailAfterUpdate : ",
      tempDetailAfterUpdate
    );

    for await (const bet of winInfo) {
      const { win, comm } = bet;
      console.log(new Date(), "distributAmount ::: bet ::", bet);
      // await mongo.bettingApp.model(mongo.models.users).updateOne({
      //   query: userQuery,
      //   update: {
      //     $inc: {
      //       remaining_balance: Number(win.toFixed(2)),
      //       balance: Number(win.toFixed(2)),
      //       commissionAmount: Number(comm.toFixed(2)),
      //     },
      //   },
      // });

      // insert trangection history
      await winnerStatementTrack({
        userId,
        win,
        selection,
        matchId,
        betType,
        comm,
      });
      sendUpdateBalanceEvent(userId, "");
    }

    return true;
  } catch (error) {
    console.log("error in : distributAmountSub : ", error);
    throw error;
  } finally {
    await getLock.release(userLock);
  }
}
async function distributAmount(matchDetail, matchId, selection, betType) {
  // const getLock = getRedLock();
  console.log(new Date(), "distributAmount : matchDetail :::: ", matchDetail);
  for await (const odds of matchDetail) {
    await distributAmountSub(odds, matchId, selection, betType);
    // console.log(new Date(), "distributAmount :: odds :: betType : ", betType);
    // console.log(JSON.stringify(odds));
    // const { userId, exposure, winInfo } = odds;
    // const userLock = await getLock.acquire([userId], 2000);
    // const userQuery = {
    //   _id: userId,
    // };

    // const tempDetail = await mongo.bettingApp
    //   .model(mongo.models.users)
    //   .findOne({
    //     query: userQuery,
    //     select: {
    //       user_name: 1,
    //       balance: 1,
    //       exposure: 1,
    //       remaining_balance: 1,
    //     },
    //   });
    // console.log(
    //   new Date(),
    //   exposure,
    //   "distributAmount : exposure remove from user account : before User Data : tempDetail:",
    //   tempDetail
    // );

    // // console.log("exposure remove from user account : exposure : ", exposure);
    // await mongo.bettingApp.model(mongo.models.users).updateOne({
    //   query: userQuery,
    //   update: {
    //     $inc: {
    //       exposure: -exposure,
    //       balance: exposure,
    //     },
    //   },
    // });

    // const tempDetailAfterUpdate = await mongo.bettingApp
    //   .model(mongo.models.users)
    //   .findOne({
    //     query: userQuery,
    //     select: {
    //       user_name: 1,
    //       balance: 1,
    //       exposure: 1,
    //       remaining_balance: 1,
    //     },
    //   });
    // console.log(
    //   new Date(),
    //   "distributAmount : exposure remove from user account : after User Data : tempDetailAfterUpdate : ",
    //   tempDetailAfterUpdate
    // );

    // for await (const bet of winInfo) {
    //   const { win, comm } = bet;
    //   console.log(new Date(), "distributAmount ::: bet ::", bet);
    //   // await mongo.bettingApp.model(mongo.models.users).updateOne({
    //   //   query: userQuery,
    //   //   update: {
    //   //     $inc: {
    //   //       remaining_balance: Number(win.toFixed(2)),
    //   //       balance: Number(win.toFixed(2)),
    //   //       commissionAmount: Number(comm.toFixed(2)),
    //   //     },
    //   //   },
    //   // });

    //   // insert trangection history
    //   await winnerStatementTrack({
    //     userId,
    //     win,
    //     selection,
    //     matchId,
    //     betType,
    //     comm,
    //   });
    //   sendUpdateBalanceEvent(userId, "");
    // }

    // await getLock.release(userLock);
  }
  return true;
}
async function distributAmountRevertSub(odds, matchId, selection, betType) {
  const getLock = getRedLock();
  const { userId, exposure, winInfo } = odds;
  const userLock = await getLock.acquire([userId], 2000);

  try {
    const userQuery = {
      _id: userId,
    };
    await mongo.bettingApp.model(mongo.models.users).updateOne({
      query: userQuery,
      update: {
        $inc: {
          exposure: exposure,
          balance: -exposure,
        },
      },
    });
    for await (const bet of winInfo) {
      const { win, comm } = bet;
      await mongo.bettingApp.model(mongo.models.users).updateOne({
        query: userQuery,
        update: {
          $inc: {
            remaining_balance: -win,
            balance: -win,
            cumulative_pl: -win,
            ref_pl: -win,
            commissionAmount: -comm,
            sportWinings: -win, // inc sport win amount
          },
        },
      });

      sendUpdateBalanceEvent(userId, "");
    }

    // await mongo.bettingApp.model(mongo.models.statements).deleteMany({
    //   query: {
    //     userId: mongo.ObjectId(userId),
    //     betType,
    //     matchId: mongo.ObjectId(matchId),
    //     selection: selection,
    //   },
    // });
    // remove trangection history
    await removeStatementTrackSports({
      userId,
      selection,
      matchId,
      betType,
      comm: 0,
    });
    console.log("final return");

    return true;
  } catch (error) {
    console.log("error in distributAmountRevertSub: ", error);
    throw error;
  } finally {
    await getLock.release(userLock);
    return true;
  }
}
async function distributAmountRevert(matchDetail, matchId, selection, betType) {
  // const getLock = getRedLock();
  console.log("distributAmountRevert: matchDetail :: ", matchDetail);
  console.log("distributAmountRevert: matchDetail :: ", matchDetail.length);

  for await (const odds of matchDetail) {
    const d = await distributAmountRevertSub(odds, matchId, selection, betType);
    console.log("it's done: distributAmountRevertSub", d);

    // const { userId, exposure, winInfo } = odds;
    // const userLock = await getLock.acquire([userId], 2000);
    // const userQuery = {
    //   _id: userId,
    // };
    // await mongo.bettingApp.model(mongo.models.users).updateOne({
    //   query: userQuery,
    //   update: {
    //     $inc: {
    //       exposure: exposure,
    //       balance: -exposure,
    //     },
    //   },
    // });
    // for await (const bet of winInfo) {
    //   const { win, comm } = bet;
    //   await mongo.bettingApp.model(mongo.models.users).updateOne({
    //     query: userQuery,
    //     update: {
    //       $inc: {
    //         remaining_balance: -win,
    //         balance: -win,
    //         cumulative_pl: -win,
    //         ref_pl: -win,
    //         commissionAmount: -comm,
    //         sportWinings: -win, // inc sport win amount
    //       },
    //     },
    //   });

    //   // remove trangection history
    //   await removeStatementTrackSports({
    //     userId,
    //     selection,
    //     matchId,
    //     betType,
    //     comm,
    //   });
    //   sendUpdateBalanceEvent(userId, "");
    // }
    // await getLock.release(userLock);
  }
  console.log("distributAmountRevertSub return");

  return true;
}

module.exports = {
  distributAmount,
  distributAmountRevert,
};
