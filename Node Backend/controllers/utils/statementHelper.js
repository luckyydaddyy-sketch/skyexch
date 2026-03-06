const mongo = require("../../config/mongodb");
const { USER_LEVEL_NEW } = require("../../constants");

const manageSatementForSport = async (
  data,
  sportInfo,
  betInfo,
  adminInfo,
  commissionAdminInfo
) => {
  const { userId, win, selection, matchId, comm } = data;

  console.log(" manageSatementForSport :  data : ", data);

  await mongo.bettingApp.model(mongo.models.users).updateOne({
    query: {
      _id: userId,
    },
    update: {
      $inc: {
        remaining_balance: win + comm,
        balance: win + comm,
        cumulative_pl: win + comm,
        ref_pl: win + comm,
        sportWinings: win + comm, // inc sport win amount
        // commissionAmount: Number(comm.toFixed(2)),
      },
    },
    // options: {
    //   returnNewDocument: true,
    //   new: true,
    // },
  });

  let userInfo = await mongo.bettingApp.model(mongo.models.users).findOne({
    query: {
      _id: userId,
    },
    select: {
      balance: 1,
      remaining_balance: 1,
      exposure: 1,
    },
  });

  console.log("manageSatementForSport :: userInfo : ", userInfo);
  const documentUserBet = {
    userId,
    openSportBetUserId: userId,
    credit: win + comm > 0 ? win + comm : 0,
    debit: win + comm < 0 ? -(win + comm) : 0,
    balance: userInfo.remaining_balance,
    Remark: `${sportInfo.type}/${sportInfo.name}/${betInfo.betType}/${selection}/${betInfo.winner}`,
    matchId: matchId,
    betType: betInfo.betType,
    selection,
    type: "sport",
    amountOfBalance:userInfo.balance
  };

  await mongo.bettingApp.model(mongo.models.statements).insertOne({
    document: documentUserBet,
  });

  await mongo.bettingApp.model(mongo.models.admins).updateOne({
    query: {
      _id: adminInfo._id,
    },
    update: {
      $inc: {
        // remaining_balance: Number(win.toFixed(2)),
        remaining_balance: -(win + comm),
        // commissionAmount: Number(comm.toFixed(2)),
      },
    },
    // options: {
    // returnNewDocument: true,
    // new: true,
    // },
  });

  adminInfo = await mongo.bettingApp.model(mongo.models.admins).findOne({
    query: {
      _id: adminInfo._id,
    },
    select: {
      balance: 1,
      remaining_balance: 1,
      _id: 1,
    },
  });
  console.log("manageSatementForSport : adminInfo ::: ", adminInfo);
  // admin amount cut or plush entry
  const documentAdminBet = {
    userId: adminInfo._id,
    openSportBetUserId: userId,
    debit: win + comm > 0 ? win + comm : 0,
    credit: win + comm < 0 ? -(win + comm) : 0,
    balance: adminInfo.remaining_balance,
    Remark: `${sportInfo.type}/${sportInfo.name}/${betInfo.betType}/${selection}/${betInfo.winner}`,
    matchId: matchId,
    betType: betInfo.betType,
    selection,
    type: "sport",
    amountOfBalance:adminInfo.balance
  };

  await mongo.bettingApp.model(mongo.models.statements).insertOne({
    document: documentAdminBet,
  });

  console.log("manageSatementForSport : comm :: ", comm);
  // if comminssin
  if (comm && comm > 0) {
    await mongo.bettingApp.model(mongo.models.users).updateOne({
      query: {
        _id: userId,
      },
      update: {
        $inc: {
          remaining_balance: -comm,
          balance: -comm,
          ref_pl: -comm,
          cumulative_pl: -comm,
          commissionAmount: comm,
        },
      },
      // options: {
      //   returnNewDocument: true,
      //   new: true,
      // },
    });
    userInfo = await mongo.bettingApp.model(mongo.models.users).findOne({
      query: {
        _id: userId,
      },
      select: {
        balance: 1,
        remaining_balance: 1,
        exposure: 1,
      },
    });

    console.log("manageSatementForSport :: userInfo : 111 : ", userInfo);

    const documentUserComm = {
      userId,
      openSportBetUserId: userId,
      credit: 0,
      debit: comm,
      balance: userInfo.remaining_balance,
      Remark: `commission`,
      matchId: matchId,
      betType: betInfo.betType,
      selection,
      type: "commission",
      amountOfBalance:userInfo?.balance || 0
    };

    await mongo.bettingApp.model(mongo.models.statements).insertOne({
      document: documentUserComm,
    });

    let updateAdminBalnce = {};
    if (commissionAdminInfo.agent_level === USER_LEVEL_NEW.COM) {
      updateAdminBalnce = {
          remaining_balance: comm,
      };
    } else {
      updateAdminBalnce = {
          balance: comm,
          remaining_balance: comm,
      };
    }
    console.log("updateAdminBalnce :com: ", updateAdminBalnce);
    await mongo.bettingApp.model(mongo.models.admins).updateOne({
      query: {
        _id:  mongo.ObjectId(commissionAdminInfo._id),
      },
      update: {
        $inc: updateAdminBalnce,
        // {
        //   // remaining_balance: Number(win.toFixed(2)),
        //   remaining_balance: Number(comm.toFixed(2)),
        //   // commissionAmount: Number(comm.toFixed(2)),
        // },
      },
      // options: {
      //   returnNewDocument: true,
      //   new: true,
      // },
    });

    commissionAdminInfo = await mongo.bettingApp
      .model(mongo.models.admins)
      .findOne({
        query: {
          _id: commissionAdminInfo._id,
        },
        select: {
          balance: 1,
          remaining_balance: 1,
          _id: 1,
        },
      });

    console.log(
      "manageSatementForSport : commissionAdminInfo ::: ",
      commissionAdminInfo
    );

    const documentAdminComm = {
      userId: commissionAdminInfo._id,
      openSportBetUserId: userId,
      credit: comm,
      debit: 0,
      balance: commissionAdminInfo.remaining_balance,
      Remark: `commission`,
      matchId: matchId,
      betType: betInfo.betType,
      selection,
      type: "commission",
      amountOfBalance:commissionAdminInfo?.balance || 0
    };

    await mongo.bettingApp.model(mongo.models.statements).insertOne({
      document: documentAdminComm,
    });
  }

  return true;
};

const manageSatementAfterRemove = async (date, userId) => {
  // return true
  console.log("manageSatementAfterRemove ::: date : ", date);
  console.log("manageSatementAfterRemove ::: userId : ", userId);
  const queryBeforData = {
    userId: mongo.ObjectId(userId),
    createdAt: { $lt: new Date(date) },
  };
  console.log(
    userId,
    " manageSatementAfterRemove ::: queryBeforData : ",
    queryBeforData
  );
  const queryAfterData = {
    userId: mongo.ObjectId(userId),
    createdAt: { $gt: new Date(date) },
  };
  console.log(
    userId,
    " manageSatementAfterRemove ::: queryAfterData : ",
    queryAfterData
  );

  const afterData = await mongo.bettingApp.model(mongo.models.statements).find({
    query: queryAfterData,
  });
  console.log(userId, " manageSatementAfterRemove ::: afterData : ", afterData.length);

  if (afterData.length > 0) {
    const beforData = await mongo.bettingApp
      .model(mongo.models.statements)
      .findOne({
        query: queryBeforData,
        sort: { createdAt: -1 },
      });

    console.log(
      userId,
      " manageSatementAfterRemove ::: beforData : ",
      beforData
    );

    if (beforData) {
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
  manageSatementForSport,
  manageSatementAfterRemove,
};
