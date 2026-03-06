const { IS_COM_ADMIN_GET_COMMISSION } = require("../../config/config");
const mongo = require("../../config/mongodb");
const { USER_LEVEL_NEW } = require("../../constants");
const {
  manageSatementForSport,
  manageSatementAfterRemove,
} = require("./statementHelper");

async function statementTrack(body) {
  const document = {
    userId: body.userId,
    credit: body.credit ? body.credit : 0,
    debit: body.debit ? body.debit : 0,
    balance: body.balance,
    Remark: body.remark ? body.remark : "",
    type: body.type ? body.type : "",
    matchId: body.matchId ? body.matchId : null,
    casinoMatchId: body.casinoMatchId ? body.casinoMatchId : null,
    betType: body.betType ? body.betType : "",
    from: body.from ? body.from : null,
    to: body.to ? body.to : null,
    fromModel: body.fromModel ? body.fromModel : "",
    toModel: body.toModel ? body.toModel : "",
    selection: body.selection ? body.selection : "",
    withdrawalsId: body.withdrawalsId ? body.withdrawalsId : null,
  };
  await mongo.bettingApp.model(mongo.models.statements).insertOne({
    document,
  });

  return true;
}

async function playerStatement(body) {
  console.log("playerStatement : body ::: ", body);
  const userInfo = await mongo.bettingApp.model(mongo.models.users).findOne({
    query: { _id: mongo.ObjectId(body.userId) },
    select: {
      balance: 1,
      remaining_balance: 1,
    },
  });
  // console.log("userInfo :: ", userInfo);
  body.balance = userInfo.remaining_balance;
  const flag = await statementTrack(body);

  return flag;
}
async function agentStatement(body) {
  console.log("agentStatement : body :: ", body);
  const userInfo = await mongo.bettingApp.model(mongo.models.admins).findOne({
    query: { _id: mongo.ObjectId(body.userId) },
    select: {
      remaining_balance: 1,
    },
  });

  body.balance = userInfo.remaining_balance;
  const flag = await statementTrack(body);

  return flag;
}

async function winnerStatementTrack(data) {
  const { userId, win, selection, matchId, betType } = data;

  let userInfo = await mongo.bettingApp.model(mongo.models.users).findOne({
    query: { _id: mongo.ObjectId(userId) },
    select: {
      balance: 1,
      exposure: 1,
      whoAdd: 1,
      admin: 1,
    },
  });

  console.log(new Date(), "winnerStatementTrack :: userInfo ::: ", userInfo);
  // cut or plush amount to this user
  let adminInfo = await mongo.bettingApp.model(mongo.models.admins).findOne({
    query: { _id: { $in: userInfo.whoAdd }, agent_level: USER_LEVEL_NEW.COM },
    select: {
      balance: 1,
      remaining_balance: 1,
      agent_level: 1,
      _id: 1,
    },
  });

  // inc the commission to this user
  let commissionAdminInfo;
  if (IS_COM_ADMIN_GET_COMMISSION) {
    commissionAdminInfo = adminInfo;
  } else {
    commissionAdminInfo = await mongo.bettingApp
      .model(mongo.models.admins)
      .findOne({
        query: { _id: userInfo.admin },
        select: {
          balance: 1,
          agent_level: 1,
          remaining_balance: 1,
          _id: 1,
        },
      });
  }

  const sportInfo = await mongo.bettingApp.model(mongo.models.sports).findOne({
    query: { _id: mongo.ObjectId(matchId) },
    select: {
      type: 1,
      name: 1,
    },
  });
  let betsHistoryQuery = {
    matchId: mongo.ObjectId(matchId),
    betType,
  };
  if (betType === "session" && betType === "premium") {
    betsHistoryQuery.selection = selection;
  }

  const betInfo = await mongo.bettingApp
    .model(mongo.models.betsHistory)
    .findOne({
      query: betsHistoryQuery,
      select: {
        betType: 1,
        winner: 1,
      },
    });

  const statementInfo = await mongo.bettingApp
    .model(mongo.models.statements)
    .findOne({
      query: {
        userId: mongo.ObjectId(userId),
        matchId: mongo.ObjectId(matchId),
        selection,
        betType,
      },
    });

  console.log(new Date(), "winnerStatementTrack :: ", statementInfo);

  console.log(new Date(), "winnerStatementTrack : userInfo ::: ", userInfo);
  if (!statementInfo) {
    await manageSatementForSport(
      data,
      sportInfo,
      betInfo,
      adminInfo,
      commissionAdminInfo
    );
  } else {
    console.log(new Date(), "not insert");
  }

  return true;
}

// only for casinos
async function removeStatementTrack(data) {
  const { userId, casinoMatchId, betType, betAmount } = data;

  console.log(new Date(), "removeStatementTrack ::: data :: ", data);
  const query = {
    userId: mongo.ObjectId(userId),
    betType,
  };

  if (casinoMatchId !== "" && casinoMatchId !== null) {
    query.casinoMatchId = mongo.ObjectId(casinoMatchId);
    query.betAmount = betAmount;
  }

  const userStateMentInfo = await mongo.bettingApp
    .model(mongo.models.statements)
    .findOne({
      query,
    });

  console.log(new Date(), "removeStatementTrack ::: query :: ", query);
  const remove = await mongo.bettingApp
    .model(mongo.models.statements)
    .deleteOne({
      query,
    });

  // setup user statement
  await manageSatementAfterRemove(
    userStateMentInfo ? userStateMentInfo.createdAt : new Date(),
    userId
  );

  const userInfo = await mongo.bettingApp.model(mongo.models.users).findOne({
    query: { _id: mongo.ObjectId(userId) },
    select: {
      balance: 1,
      whoAdd: 1,
      cumulative_pl: 1,
      ref_pl: 1,
    },
  });

  console.log(new Date(), "removeStatementTrack ::: userInfo :: ", userInfo);
  // cut or plush amount to this user
  const adminInfo = await mongo.bettingApp.model(mongo.models.admins).findOne({
    query: { _id: { $in: userInfo.whoAdd }, agent_level: USER_LEVEL_NEW.COM },
    select: {
      _id: 1,
    },
  });
  console.log(new Date(), "removeStatementTrack ::: adminInfo : ", adminInfo);
  const adminQuery = {
    userId: adminInfo._id,
    openSportBetUserId: userId,
    casinoMatchId,
    betAmount,
  };

  const adminStateMentCasino = await mongo.bettingApp
    .model(mongo.models.statements)
    .find({
      query: adminQuery,
    });

  for await (const casinoAdminState of adminStateMentCasino) {
    let amountSet = 0;
    if (casinoAdminState.credit !== 0) {
      amountSet = casinoAdminState.credit;
    } else {
      amountSet -= casinoAdminState.debit;
    }
    const newAdminData = await mongo.bettingApp
      .model(mongo.models.admins)
      .updateOne({
        query: {
          _id: casinoAdminState.userId,
        },
        update: {
          $inc: {
            remaining_balance: -amountSet,
          },
        },
      });

    console.log(
      new Date(),
      "removeStatementTrack ::: newAdminData : ",
      newAdminData
    );
  }

  // remove admin statement
  await mongo.bettingApp.model(mongo.models.statements).deleteOne({
    query: adminQuery,
  });

  // setup admin statement
  await manageSatementAfterRemove(
    adminStateMentCasino.length > 0
      ? adminStateMentCasino[0].createdAt
      : new Date(),
    adminInfo._id
  );
  return remove;
}

async function removeStatementTrackSports(data) {
  const { userId, selection, matchId, betType } = data;

  console.log(new Date(), "removeStatementTrackSports ::: data :: ", data);
  const query = {
    userId: mongo.ObjectId(userId),
    betType,
  };

  const userInfo = await mongo.bettingApp.model(mongo.models.users).findOne({
    query: { _id: mongo.ObjectId(userId) },
    select: {
      balance: 1,
      whoAdd: 1,
      admin: 1,
    },
  });
  // cut or plush amount to this user
  const adminInfo = await mongo.bettingApp.model(mongo.models.admins).findOne({
    query: { _id: { $in: userInfo.whoAdd }, agent_level: USER_LEVEL_NEW.COM },
    select: {
      balance: 1,
      remaining_balance: 1,
      _id: 1,
      agent_level: 1,
    },
  });
  console.log(
    new Date(),
    "removeStatementTrackSports :: adminInfo : ",
    adminInfo
  );
  // inc the commission to this user
  let commissionAdminInfo;
  if (IS_COM_ADMIN_GET_COMMISSION) {
    commissionAdminInfo = adminInfo;
  } else {
    commissionAdminInfo = await mongo.bettingApp
      .model(mongo.models.admins)
      .findOne({
        query: { _id: userInfo.admin },
        select: {
          balance: 1,
          agent_level: 1,
          remaining_balance: 1,
          _id: 1,
        },
      });
  }
  console.log(
    new Date(),
    "removeStatementTrackSports :: commissionAdminInfo : ",
    commissionAdminInfo
  );
  const adminQueryBet = {
    userId: { $in: [adminInfo._id, commissionAdminInfo._id] },
    openSportBetUserId: mongo.ObjectId(userId),
    betType,
  };
  // const adminQueryCommi = {
  //   userId: mongo.ObjectId(commissionAdminInfo._id),
  //   openSportBetUserId: mongo.ObjectId(userId),
  //   betType,
  // };

  if (matchId && matchId !== "" && matchId !== null) {
    query.matchId = mongo.ObjectId(matchId);
    adminQueryBet.matchId = mongo.ObjectId(matchId);
  }

  if (betType === "premium" || betType === "session") {
    query.selection = selection;
    adminQueryBet.selection = selection;
  }

  // const usersStateMent = await mongo.bettingApp
  //   .model(mongo.models.statements)
  //   .find({
  //     query,
  //   });
  console.log(
    new Date(),
    "removeStatementTrackSports : adminQueryBet :: ",
    adminQueryBet
  );
  console.log(new Date(), "removeStatementTrackSports : query :: ", query);
  const adminStateMent = await mongo.bettingApp
    .model(mongo.models.statements)
    .find({
      query: adminQueryBet,
    });
  let adminLastDate = new Date();
  let adminCommisionLastDate = new Date();
  for (const adminBetState of adminStateMent) {
    let amountSet = 0;
    if (adminBetState.credit !== 0) {
      amountSet = adminBetState.credit;
    } else {
      amountSet -= adminBetState.debit;
    }

    console.log(new Date(), "adminBetState.userId : ", adminBetState.userId);
    console.log(new Date(), "adminInfo._id : ", adminInfo._id);
    console.log(
      new Date(),
      "commissionAdminInfo._id : ",
      commissionAdminInfo._id
    );
    console.log(
      new Date(),
      "adminBetState.userId === adminInfo._id ::: ",
      adminBetState.userId.toString() === adminInfo._id.toString()
    );
    if (adminBetState.userId.toString() === adminInfo._id.toString()) {
      adminLastDate = adminBetState.createdAt;
    }
    console.log(
      new Date(),
      "adminBetState.userId === commissionAdminInfo._id :: ",
      adminBetState.userId === commissionAdminInfo._id
    );
    if (
      adminBetState.userId.toString() === commissionAdminInfo._id.toString()
    ) {
      adminCommisionLastDate = adminBetState.createdAt;
    }

    let updateAdminBalnce = {};
    // if(adminInfo._id === adminBetState.userId)
    if (
      commissionAdminInfo._id === adminBetState.userId &&
      commissionAdminInfo.agent_level !== USER_LEVEL_NEW.COM
    ) {
      updateAdminBalnce = {
        $inc: {
          balance: -amountSet,
          remaining_balance: -amountSet,
        },
      };
    } else {
      updateAdminBalnce = {
        $inc: {
          remaining_balance: -amountSet,
        },
      };
    }
    const newAdminInfo = await mongo.bettingApp
      .model(mongo.models.admins)
      .updateOne({
        query: {
          _id: adminBetState.userId,
        },
        update: updateAdminBalnce,
        // {
        //   $inc: {
        //     remaining_balance: -Number(amountSet.toFixed(2)),
        //   },
        // },
      });

    console.log(
      new Date(),
      "removeStatementTrackSports :: newAdminInfo : ",
      newAdminInfo
    );
  }

  console.log(new Date(), "removeStatementTrackSports ::: query :: ", query);

  const userStateMentInfo = await mongo.bettingApp
    .model(mongo.models.statements)
    .findOne({
      query,
    });

  // remove user statement
  const remove = await mongo.bettingApp
    .model(mongo.models.statements)
    .deleteMany({
      query,
    });

  // setup user statement
  if (userStateMentInfo && userStateMentInfo.createdAt)
    await manageSatementAfterRemove(userStateMentInfo.createdAt, userId);

  // remove admin statement
  await mongo.bettingApp.model(mongo.models.statements).deleteMany({
    query: adminQueryBet,
  });

  // setup admin statement
  if (IS_COM_ADMIN_GET_COMMISSION) {
    await manageSatementAfterRemove(adminLastDate, adminInfo._id);
  } else {
    await manageSatementAfterRemove(adminLastDate, adminInfo._id);
    await manageSatementAfterRemove(
      adminCommisionLastDate,
      commissionAdminInfo._id
    );
  }
  return remove;
}

async function addCasinoStateMentTrack(data) {
  const betType = "casino";
  const { userId, win, casinoMatchId, betAmount } = data;
  if (win > 0 || win < 0) {
    console.log(new Date(), "addCasinoStateMentTrack ::: data :: ", data);
    const userInfo = await mongo.bettingApp.model(mongo.models.users).findOne({
      query: { _id: mongo.ObjectId(userId) },
      select: {
        balance: 1,
        whoAdd: 1,
        remaining_balance: 1,
      },
    });
    // cut or plush amount to this user
    const adminInfo = await mongo.bettingApp
      .model(mongo.models.admins)
      .findOneAndUpdate({
        query: {
          _id: { $in: userInfo.whoAdd },
          agent_level: USER_LEVEL_NEW.COM,
        },
        update: {
          $inc: {
            // remaining_balance: Number(win.toFixed(2)),
            remaining_balance: -win,
          },
        },
        options: {
          returnNewDocument: true,
          new: true,
        },
      });
    console.log(
      new Date(),
      "addCasinoStateMentTrack : adminInfo :: ",
      adminInfo
    );
    const betInfo = await mongo.bettingApp
      .model(mongo.models.casinoMatchHistory)
      .findOne({
        query: { _id: mongo.ObjectId(casinoMatchId) },
        select: {
          betType: 1,
          winner: 1,
          platform: 1,
          gameName: 1,
          gameType: 1,
        },
      });

    const document = {
      userId,
      credit: win > 0 ? win : 0,
      debit: win < 0 ? -win : 0,
      balance: userInfo.remaining_balance,
      Remark: `${betInfo.platform}/${betInfo.gameName}/${betType}/${betInfo.gameType}`,
      betType: betType,
      betAmount,
      casinoMatchId,
      type: "casino",
      amountOfBalance: userInfo.balance,
    };

    await mongo.bettingApp.model(mongo.models.statements).insertOne({
      document,
    });

    const documentAdmin = {
      userId: adminInfo._id,
      openSportBetUserId: userId,
      credit: win < 0 ? -win : 0,
      debit: win > 0 ? win : 0,
      balance: adminInfo.remaining_balance,
      Remark: `${betInfo.platform}/${betInfo.gameName}/${betType}/${betInfo.gameType}`,
      betType: betType,
      betAmount,
      casinoMatchId,
      type: "casino",
      amountOfBalance: adminInfo.balance,
    };

    await mongo.bettingApp.model(mongo.models.statements).insertOne({
      document: documentAdmin,
    });
  }
  return true;
}

async function casinoStateMentTrack(data) {
  const betType = "casino";
  const { userId, win, casinoMatchId, betAmount } = data;
  console.log(new Date(), "casinoStateMentTrack ::: data :: ", data);
  if (win > 0 || win < 0) {
    if (betAmount === 0) {
      await addCasinoStateMentTrack(data);
    } else {
      const userInfo = await mongo.bettingApp
        .model(mongo.models.users)
        .findOne({
          query: { _id: mongo.ObjectId(userId) },
          select: {
            balance: 1,
            remaining_balance: 1,
            whoAdd: 1,
          },
        });

      // cut or plush amount to this user
      let adminInfo = await mongo.bettingApp
        .model(mongo.models.admins)
        .findOne({
          query: {
            _id: { $in: userInfo.whoAdd },
            agent_level: USER_LEVEL_NEW.COM,
          },
        });

      console.log(
        new Date(),
        "casinoStateMentTrack : adminInfo :: ",
        adminInfo
      );
      const query = {
        userId: mongo.ObjectId(userId),
        casinoMatchId: mongo.ObjectId(casinoMatchId),
        betAmount,
      };

      const betInfo = await mongo.bettingApp
        .model(mongo.models.casinoMatchHistory)
        .findOne({
          query: { _id: mongo.ObjectId(casinoMatchId) },
          select: {
            betType: 1,
            winner: 1,
            platform: 1,
            gameName: 1,
            gameType: 1,
          },
        });

      const statementInfo = await mongo.bettingApp
        .model(mongo.models.statements)
        .findOne({
          query,
        });

      if (!statementInfo) {
        adminInfo = await mongo.bettingApp
          .model(mongo.models.admins)
          .findOneAndUpdate({
            query: {
              _id: { $in: userInfo.whoAdd },
              agent_level: USER_LEVEL_NEW.COM,
            },
            update: {
              $inc: {
                // remaining_balance: Number(win.toFixed(2)),
                remaining_balance: -win,
              },
            },
            options: {
              returnNewDocument: true,
              new: true,
            },
          });

        const document = {
          userId,
          credit: win > 0 ? win : 0,
          debit: win < 0 ? -win : 0,
          balance: userInfo.remaining_balance,
          Remark: `${betInfo.platform}/${betInfo.gameName}/${betType}/${betInfo.gameType}`,
          betType: betType,
          betAmount,
          casinoMatchId,
          type: "casino",
          amountOfBalance: userInfo.balance,
        };

        await mongo.bettingApp.model(mongo.models.statements).insertOne({
          document,
        });

        const documentAdmin = {
          userId: adminInfo._id,
          openSportBetUserId: userId,
          credit: win < 0 ? -win : 0,
          debit: win > 0 ? win : 0,
          balance: adminInfo.remaining_balance,
          Remark: `${betInfo.platform}/${betInfo.gameName}/${betType}/${betInfo.gameType}`,
          betType: betType,
          betAmount,
          casinoMatchId,
          type: "casino",
          amountOfBalance: adminInfo.balance,
        };

        await mongo.bettingApp.model(mongo.models.statements).insertOne({
          document: documentAdmin,
        });
      } else {
        // remove statement of user
        await mongo.bettingApp.model(mongo.models.statements).deleteOne({
          query,
        });

        // setup user statement
        await manageSatementAfterRemove(statementInfo.createdAt, userId);

        const adminQuery = {
          userId: adminInfo._id,
          openSportBetUserId: userId,
          casinoMatchId,
          betAmount,
        };

        const adminStateMentCasino = await mongo.bettingApp
          .model(mongo.models.statements)
          .find({
            query: adminQuery,
          });
        console.log(
          new Date(),
          "casinoStateMentTrack : adminStateMentCasino :: ",
          adminStateMentCasino
        );
        for await (const casinoAdminState of adminStateMentCasino) {
          let amountSet = 0;
          if (casinoAdminState.credit !== 0) {
            amountSet = casinoAdminState.credit;
          } else {
            amountSet -= casinoAdminState.debit;
          }
          const newAdminInfo = await mongo.bettingApp
            .model(mongo.models.admins)
            .findOneAndUpdate({
              query: {
                _id: casinoAdminState.userId,
              },
              update: {
                $inc: {
                  remaining_balance: -amountSet,
                },
              },
              options: {
                new: true,
              },
            });

          console.log(
            new Date(),
            "casinoStateMentTrack : newAdminInfo :: ",
            newAdminInfo
          );
        }

        // remove statement of user
        await mongo.bettingApp.model(mongo.models.statements).deleteOne({
          query: adminQuery,
        });

        // setup admin statement
        await manageSatementAfterRemove(
          adminStateMentCasino.length > 0
            ? adminStateMentCasino[0].createdAt
            : new Date(),
          adminInfo._id
        );
        await casinoStateMentTrack(data);
        console.log(new Date(), "not insert");
      }
    }
  }
  return true;
}

async function addCasinoBonusStateMentTrack(data) {
  const betType = "casino";
  const { userId, win, casinoBonusId } = data;
  if (win > 0 || win < 0) {
    console.log(new Date(), "addCasinoBonusStateMentTrack ::: data :: ", data);
    const userInfo = await mongo.bettingApp.model(mongo.models.users).findOne({
      query: { _id: mongo.ObjectId(userId) },
      select: {
        balance: 1,
        remaining_balance: 1,
        whoAdd: 1,
      },
    });

    // cut or plush amount to this user
    const adminInfo = await mongo.bettingApp
      .model(mongo.models.admins)
      .findOneAndUpdate({
        query: {
          _id: { $in: userInfo.whoAdd },
          agent_level: USER_LEVEL_NEW.COM,
        },
        update: {
          $inc: {
            // remaining_balance: Number(win.toFixed(2)),
            remaining_balance: -win,
          },
        },
        options: {
          returnNewDocument: true,
          new: true,
        },
      });
    console.log(
      new Date(),
      "addCasinoBonusStateMentTrack : adminInfo : ",
      adminInfo
    );
    const document = {
      userId,
      credit: win > 0 ? win : 0,
      debit: win < 0 ? -win : 0,
      balance: userInfo.remaining_balance,
      Remark: `casino/bonus`,
      betType: betType,
      casinoBonusId,
      type: "casino",
      amountOfBalance: userInfo?.balance || 0,
    };

    await mongo.bettingApp.model(mongo.models.statements).insertOne({
      document,
    });

    const documentAdmin = {
      userId: adminInfo._id,
      openSportBetUserId: userId,
      credit: win < 0 ? -win : 0,
      debit: win > 0 ? win : 0,
      balance: adminInfo.remaining_balance,
      Remark: `casino/bonus`,
      betType: betType,
      casinoBonusId,
      type: "casino",
      amountOfBalance: adminInfo?.balance || 0,
    };

    await mongo.bettingApp.model(mongo.models.statements).insertOne({
      document: documentAdmin,
    });
  }
  return true;
}
async function addCasinoFreeSpinStateMentTrack(data) {
  const betType = "casino";
  const { userId, win, casinoBonusId } = data;
  if (win > 0 || win < 0) {
    console.log(new Date(), "addCasinoBonusStateMentTrack ::: data :: ", data);
    const userInfo = await mongo.bettingApp.model(mongo.models.users).findOne({
      query: { _id: mongo.ObjectId(userId) },
      select: {
        balance: 1,
        remaining_balance: 1,
        whoAdd: 1,
      },
    });

    // cut or plush amount to this user
    const adminInfo = await mongo.bettingApp
      .model(mongo.models.admins)
      .findOneAndUpdate({
        query: {
          _id: { $in: userInfo.whoAdd },
          agent_level: USER_LEVEL_NEW.COM,
        },
        update: {
          $inc: {
            // remaining_balance: Number(win.toFixed(2)),
            remaining_balance: -win,
          },
        },
        options: {
          returnNewDocument: true,
          new: true,
        },
      });
    console.log(
      new Date(),
      "addCasinoBonusStateMentTrack : adminInfo : ",
      adminInfo
    );
    const document = {
      userId,
      credit: win > 0 ? win : 0,
      debit: win < 0 ? -win : 0,
      balance: userInfo.remaining_balance,
      Remark: `casino/freeSpin`,
      betType: betType,
      casinoMatchId: casinoBonusId,
      type: "casino",
      amountOfBalance: userInfo.balance,
    };

    await mongo.bettingApp.model(mongo.models.statements).insertOne({
      document,
    });

    const documentAdmin = {
      userId: adminInfo._id,
      openSportBetUserId: userId,
      credit: win < 0 ? -win : 0,
      debit: win > 0 ? win : 0,
      balance: adminInfo.remaining_balance,
      Remark: `casino/freeSpin`,
      betType: betType,
      casinoMatchId: casinoBonusId,
      type: "casino",
      amountOfBalance: adminInfo.balance,
    };

    await mongo.bettingApp.model(mongo.models.statements).insertOne({
      document: documentAdmin,
    });
  }
  return true;
}

// withdrawal statement track
async function removeStatementTrackWithdrawal(data) {
  const { userId, withdrawalsId, amount } = data;

  console.log(new Date(), "removeStatementTrackWithdrawal ::: data :: ", data);
  const query = {
    userId: mongo.ObjectId(userId),
    withdrawalsId: mongo.ObjectId(withdrawalsId),
  };

  const userStateMentInfo = await mongo.bettingApp
    .model(mongo.models.statements)
    .findOne({
      query,
    });

  if (!userStateMentInfo) {
    return false;
  }

  const updateUser = {
    $inc: {
      balance: amount,
      remaining_balance: amount,
    },
  };

  await mongo.bettingApp.model(mongo.models.users).updateOne({
    query: { _id: mongo.ObjectId(userId) },
    update: updateUser,
  });

  console.log(
    new Date(),
    "removeStatementTrackWithdrawal ::: query :: ",
    query
  );
  const remove = await mongo.bettingApp
    .model(mongo.models.statements)
    .deleteOne({
      query,
    });

  // setup user statement
  await manageSatementAfterRemove(
    userStateMentInfo ? userStateMentInfo.createdAt : new Date(),
    userId
  );

  return true;
}

async function updateStatementRemark(data) {
  const { userId, withdrawalsId, debit, remark } = data;

  console.log(new Date(), "updateStatementRemark ::: data :: ", data);
  const query = {
    userId: userId,
    withdrawalsId: withdrawalsId,
  };

  const userStateMentInfo = await mongo.bettingApp
    .model(mongo.models.statements)
    .findOne({
      query,
    });
  if (userStateMentInfo) {
    console.log("going to update data updateStatementRemark:");

    await mongo.bettingApp.model(mongo.models.statements).updateOne({
      query,
      update: {
        $set: {
          Remark: remark,
        },
      },
    });
  } else {
    console.log("going  to add data updateStatementRemark:");
    const updateUser = {
      $inc: {
        balance: -debit,
        remaining_balance: -debit,
      },
    };

    await mongo.bettingApp.model(mongo.models.users).updateOne({
      query: { _id: userId },
      update: updateUser,
    });
    await playerStatement(data);
  }
}
module.exports = {
  statementTrack,
  agentStatement,
  playerStatement,
  winnerStatementTrack,
  removeStatementTrack,
  addCasinoStateMentTrack,
  casinoStateMentTrack,
  addCasinoBonusStateMentTrack,
  removeStatementTrackSports,
  addCasinoFreeSpinStateMentTrack,
  removeStatementTrackWithdrawal,
  updateStatementRemark,
};
