const mongo = require("../config/mongodb");
const { GAME_STATUS } = require("../constants");

const getUserReport = async (userId1, commission, to, from, filter) => {
  // const commission = 2;
  const userId = mongo.ObjectId(userId1);
  const query = {
    userId,
    // matchId: mongo.ObjectId("655dc9046254086d51478e9c"),
    deleted: false,
    // betType: "session",
    // selection: "1st Wkt MLSW",
    // betStatus: "completed",
    winner: { $ne: "cancel" },
  };
  const casinoQuery = {
    userObjectId: userId,
    winLostAmount: { $ne: 0 },
  };

  // const userInfoAgent = mongo.bettingApp.model(mongo.models.users).aggregate({
  //   pipeline: [
  //     {
  //       $matche: {
  //         userObjectId: mongo.ObjectId("655d3c1f6254086d513f3dd5"),
  //       },
  //     },
  //     {
  //       $group: {
  //         _id: { day: "_id" },
  //         // totalAmount: { $sum: { $multiply: [ "$price", "$quantity" ] } },
  //         count: { $sum: "" },
  //       },
  //     },
  //   ],
  // });
  const betsInfo = await mongo.bettingApp.model(mongo.models.betsHistory).find({
    query,
  });
  const report = {
    stack: 0,
    playerProfitLost: 0,
    comm: 0,
    upLineProfitLost: 0,
    casinoStack: 0,
    casinoProfitLost: 0,
  };
  console.log("betsInfo.leg :: ", betsInfo.length);

  let oddsAmount1 = {};

  for await (const bet of betsInfo) {
    report.stack += bet.stake;

    if (bet.betType === "odds" || bet.betType === "bookMark") {
      if (bet.winner !== "" && bet.winner !== "cancel") {
        if (bet.selection === bet.winner) {
          // new
          if (bet.betSide === "back") {
            let commi = 0;
            if (bet.betType === "odds") {
              // commi = (bet.profit * commission) / 100;

              if (oddsAmount1[bet.matchId]) {
                oddsAmount1[bet.matchId] += bet.profit;
              } else {
                oddsAmount1[bet.matchId] = bet.profit;
              }
            }
            report.playerProfitLost += bet.profit - commi;
            report.upLineProfitLost -= bet.profit - commi;
            report.comm += commi;
          } else {
            report.playerProfitLost -= bet.profit;
            report.upLineProfitLost += bet.profit;
            if (bet.betType === "odds") {
              if (oddsAmount1[bet.matchId]) {
                oddsAmount1[bet.matchId] -= bet.profit;
              } else {
                oddsAmount1[bet.matchId] = -bet.profit;
              }
            }
          }
          // old
          // if (bet.betSide === "lay") {
          //   bet.profit = bet.exposure;
          // }
          // let commi = 0;
          // if (bet.betType === "odds") {
          //   commi = (bet.profit * commission) / 100;
          // }
          // report.playerProfitLost += bet.profit - commi;
          // report.upLineProfitLost -= bet.profit - commi;
          // report.comm += commi;
        } else if (bet.selection !== bet.winner) {
          // new
          if (bet.betSide === "lay") {
            let commi = 0;
            if (bet.betType === "odds") {
              // commi = (bet.betPlaced * commission) / 100;

              if (oddsAmount1[bet.matchId]) {
                oddsAmount1[bet.matchId] += bet.betPlaced;
              } else {
                oddsAmount1[bet.matchId] = bet.betPlaced;
              }
            }
            report.playerProfitLost += bet.betPlaced - commi;
            report.upLineProfitLost -= bet.betPlaced - commi;
            report.comm += commi;
          } else {
            report.playerProfitLost -= bet.exposure;
            report.upLineProfitLost += bet.exposure;
            if (bet.betType === "odds") {
              if (oddsAmount1[bet.matchId]) {
                oddsAmount1[bet.matchId] -= bet.exposure;
              } else {
                oddsAmount1[bet.matchId] = -bet.exposure;
              }
            }
          }
          // old
          // if (bet.betSide === "back") {
          //   bet.profit = bet.exposure;
          // }

          // report.playerProfitLost -= bet.profit;
          // report.upLineProfitLost += bet.profit;
        }
      }
    } else if (bet.betType === "session") {
      if (bet.winner !== "" && bet.winner !== -2) {
        if (bet.fancyYes === bet.fancyNo) {
          if (bet.betSide === "yes") {
            if (bet.oddsUp <= Number(bet.winner)) {
              report.playerProfitLost += bet.profit;
              report.upLineProfitLost -= bet.profit;
            } else {
              report.playerProfitLost -= bet.exposure;
              report.upLineProfitLost += bet.exposure;
            }
          } else {
            if (bet.oddsUp > Number(bet.winner)) {
              report.playerProfitLost += bet.betPlaced;
              report.upLineProfitLost -= bet.betPlaced;
            } else {
              report.playerProfitLost -= bet.profit;
              report.upLineProfitLost += bet.profit;
            }
          }
        } else {
          if (bet.betSide === "yes") {
            if (bet.oddsUp <= Number(bet.winner)) {
              report.playerProfitLost += bet.profit;
              report.upLineProfitLost -= bet.profit;
            } else {
              report.playerProfitLost -= bet.exposure;
              report.upLineProfitLost += bet.exposure;
            }
          } else {
            if (bet.oddsUp > Number(bet.winner)) {
              report.playerProfitLost += bet.betPlaced;
              report.upLineProfitLost -= bet.betPlaced;
            } else {
              report.playerProfitLost -= bet.profit;
              report.upLineProfitLost += bet.profit;
            }
          }
        }
      }
    } else if (bet.betType === "premium") {
      if (bet.winner !== "" && bet.winner !== "cancel") {
        if (bet.subSelection === bet.winner) {
          report.playerProfitLost += bet.profit;
          report.upLineProfitLost -= bet.profit;
        } else if (bet.subSelection !== bet.winner) {
          report.playerProfitLost -= bet.exposure;
          report.upLineProfitLost += bet.exposure;
        }
      }
    }
  }

  console.log("oddsAmount1 :: ", oddsAmount1);
  Object.keys(oddsAmount1).forEach((key) => {
    if (oddsAmount1[key] > 0) {
      const commi = (oddsAmount1[key] * commission) / 100;
      console.log("commi :: ", commi);
      report.playerProfitLost -= commi;
      report.upLineProfitLost += commi;
      report.comm += commi;
    }
  });

  const casinoBetsInfo = await mongo.bettingApp
    .model(mongo.models.casinoMatchHistory)
    .find({
      query: casinoQuery,
    });

  console.log("casinoBetsInfo.leg :: ", casinoBetsInfo.length);

  for await (const casinoBet of casinoBetsInfo) {
    report.casinoStack += casinoBet.betAmount;

    if (casinoBet.gameStatus === GAME_STATUS.WIN) {
      report.casinoProfitLost += casinoBet.winLostAmount;
      report.upLineProfitLost -= casinoBet.winLostAmount;
    } else if (casinoBet.gameStatus === GAME_STATUS.LOSE) {
      report.casinoProfitLost -= casinoBet.winLostAmount;
      report.upLineProfitLost += casinoBet.winLostAmount;
    }
  }

  console.log("report :: ", report);
  return report;
};

const agReport = async () => {
  let mypl = 0;
  // const userId = mongo.ObjectId("6534119492cbd599f79d3ca1");
  const userIds = [
    mongo.ObjectId("6534119492cbd599f79d3ca1"),
    mongo.ObjectId("653ab8fd71eab49b51a5e8a1"),
    mongo.ObjectId("653b4ab371eab49b51a845e2"),
    mongo.ObjectId("653d254e991429587a794dfc"),
    mongo.ObjectId("6548bc7dd1b08fd4386b66ad"),
    mongo.ObjectId("654a339cd1b08fd43896d73e"),
    mongo.ObjectId("655449783ef2fcd089bb63ad"),
  ];

  for await (const userId of userIds) {
    const query = {
      userId,
      // matchId: mongo.ObjectId("655dc9046254086d51478e9c"),
      deleted: false,
      // betType: "session",
      // selection: "1st Wkt MLSW",
      betStatus: "completed",
      winner: { $ne: "cancel" },
    };
    const casinoQuery = {
      userObjectId: userId,
      winLostAmount: { $ne: 0 },
    };
    console.time("starrt:::userInfoAgent");
    const userInfoAgent = await mongo.bettingApp
      .model(mongo.models.betsHistory)
      .aggregate({
        pipeline: [
          {
            $match: query,
          },
          {
            $group: {
              _id: "$matchId",
              odds: {
                $sum: {
                  $cond: {
                    if: {
                      $and: [
                        {
                          $and: [
                            {
                              $ne: ["$winner", ""],
                            },
                            {
                              $ne: ["$winner", "cancel"],
                            },
                          ],
                        },
                        {
                          $eq: ["$betType", "odds"],
                        },
                        {
                          $eq: ["$betSide", "back"],
                        },
                        {
                          $eq: ["$selection", "$winner"],
                        },
                      ],
                    },
                    then: "$profit",
                    else: {
                      $cond: {
                        if: {
                          $and: [
                            {
                              $and: [
                                {
                                  $ne: ["$winner", ""],
                                },
                                {
                                  $ne: ["$winner", "cancel"],
                                },
                              ],
                            },
                            {
                              $eq: ["$betType", "odds"],
                            },
                            {
                              $eq: ["$betSide", "back"],
                            },
                            {
                              $ne: ["$selection", "$winner"],
                            },
                          ],
                        },
                        then: {
                          $subtract: [0, "$exposure"],
                        },
                        else: {
                          $cond: {
                            if: {
                              $and: [
                                {
                                  $and: [
                                    {
                                      $ne: ["$winner", ""],
                                    },
                                    {
                                      $ne: ["$winner", "cancel"],
                                    },
                                  ],
                                },
                                {
                                  $eq: ["$betType", "odds"],
                                },
                                {
                                  $eq: ["$betSide", "lay"],
                                },
                                {
                                  $ne: ["$selection", "$winner"],
                                },
                              ],
                            },
                            then: "$betPlaced",
                            else: {
                              $cond: {
                                if: {
                                  $and: [
                                    {
                                      $and: [
                                        {
                                          $ne: ["$winner", ""],
                                        },
                                        {
                                          $ne: ["$winner", "cancel"],
                                        },
                                      ],
                                    },
                                    {
                                      $eq: ["$betType", "odds"],
                                    },
                                    {
                                      $eq: ["$betSide", "lay"],
                                    },
                                    {
                                      $eq: ["$selection", "$winner"],
                                    },
                                  ],
                                },
                                then: {
                                  $subtract: [0, "$exposure"],
                                },
                                else: 0,
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
              bookMark: {
                $sum: {
                  $cond: {
                    if: {
                      $and: [
                        {
                          $and: [
                            {
                              $ne: ["$winner", ""],
                            },
                            {
                              $ne: ["$winner", "cancel"],
                            },
                          ],
                        },
                        {
                          $eq: ["$betType", "bookMark"],
                        },
                        {
                          $eq: ["$betSide", "back"],
                        },
                        {
                          $eq: ["$selection", "$winner"],
                        },
                      ],
                    },
                    then: "$profit",
                    else: {
                      $cond: {
                        if: {
                          $and: [
                            {
                              $and: [
                                {
                                  $ne: ["$winner", ""],
                                },
                                {
                                  $ne: ["$winner", "cancel"],
                                },
                              ],
                            },
                            {
                              $eq: ["$betType", "bookMark"],
                            },
                            {
                              $eq: ["$betSide", "back"],
                            },
                            {
                              $ne: ["$selection", "$winner"],
                            },
                          ],
                        },
                        then: {
                          $subtract: [0, "$exposure"],
                        },
                        else: {
                          $cond: {
                            if: {
                              $and: [
                                {
                                  $and: [
                                    {
                                      $ne: ["$winner", ""],
                                    },
                                    {
                                      $ne: ["$winner", "cancel"],
                                    },
                                  ],
                                },
                                {
                                  $eq: ["$betType", "bookMark"],
                                },
                                {
                                  $eq: ["$betSide", "lay"],
                                },
                                {
                                  $ne: ["$selection", "$winner"],
                                },
                              ],
                            },
                            then: "$betPlaced",
                            else: {
                              $cond: {
                                if: {
                                  $and: [
                                    {
                                      $and: [
                                        {
                                          $ne: ["$winner", ""],
                                        },
                                        {
                                          $ne: ["$winner", "cancel"],
                                        },
                                      ],
                                    },
                                    {
                                      $eq: ["$betType", "bookMark"],
                                    },
                                    {
                                      $eq: ["$betSide", "lay"],
                                    },
                                    {
                                      $eq: ["$selection", "$winner"],
                                    },
                                  ],
                                },
                                then: {
                                  $subtract: [0, "$exposure"],
                                },
                                else: 0,
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
              Session: {
                $sum: {
                  $cond: {
                    if: {
                      $and: [
                        {
                          $and: [
                            {
                              $ne: ["$winner", ""],
                            },
                            {
                              $ne: ["$winner", -2],
                            },
                          ],
                        },
                        {
                          $eq: ["$betType", "session"],
                        },
                        {
                          $eq: ["$betSide", "yes"],
                        },
                        {
                          $lte: ["$oddsUp", "$winner"],
                        },
                      ],
                    },
                    then: "$profit",
                    else: {
                      $cond: {
                        if: {
                          $and: [
                            {
                              $and: [
                                {
                                  $ne: ["$winner", ""],
                                },
                                {
                                  $ne: ["$winner", -2],
                                },
                              ],
                            },
                            {
                              $eq: ["$betType", "session"],
                            },
                            {
                              $eq: ["$betSide", "yes"],
                            },
                            {
                              $gt: ["$oddsUp", "$winner"],
                            },
                          ],
                        },
                        then: {
                          $subtract: [0, "$exposure"],
                        },
                        else: {
                          $cond: {
                            if: {
                              $and: [
                                {
                                  $and: [
                                    {
                                      $ne: ["$winner", ""],
                                    },
                                    {
                                      $ne: ["$winner", -2],
                                    },
                                  ],
                                },
                                {
                                  $eq: ["$betType", "session"],
                                },
                                {
                                  $eq: ["$betSide", "no"],
                                },
                                {
                                  $gt: ["$oddsUp", "$winner"],
                                },
                              ],
                            },
                            then: "$betPlaced",
                            else: {
                              $cond: {
                                if: {
                                  $and: [
                                    {
                                      $and: [
                                        {
                                          $ne: ["$winner", ""],
                                        },
                                        {
                                          $ne: ["$winner", -2],
                                        },
                                      ],
                                    },
                                    {
                                      $eq: ["$betType", "session"],
                                    },
                                    {
                                      $eq: ["$betSide", "no"],
                                    },
                                    {
                                      $lte: ["$oddsUp", "$winner"],
                                    },
                                  ],
                                },
                                then: {
                                  $subtract: [0, "$profit"],
                                },
                                else: 0,
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
              Premium: {
                $sum: {
                  $cond: {
                    if: {
                      $and: [
                        {
                          $and: [
                            {
                              $ne: ["$winner", ""],
                            },
                            {
                              $ne: ["$winner", "cancel"],
                            },
                          ],
                        },
                        {
                          $eq: ["$betType", "premium"],
                        },
                        {
                          $eq: ["$betSide", "back"],
                        },
                        {
                          $eq: ["$selection", "$winner"],
                        },
                      ],
                    },
                    then: "$profit",
                    else: {
                      $cond: {
                        if: {
                          $and: [
                            {
                              $and: [
                                {
                                  $ne: ["$winner", ""],
                                },
                                {
                                  $ne: ["$winner", "cancel"],
                                },
                              ],
                            },
                            {
                              $eq: ["$betType", "premium"],
                            },
                            {
                              $eq: ["$betSide", "back"],
                            },
                            {
                              $ne: ["$selection", "$winner"],
                            },
                          ],
                        },
                        then: {
                          $subtract: [0, "$exposure"],
                        },
                        else: 0,
                      },
                    },
                  },
                },
              },
            },
          },
          {
            $project: {
              bookMark: 1,
              Session: 1,
              Premium: 1,
              odds: 1,
              oddsNew: {
                $cond: {
                  if: {
                    $gt: ["$odds", 0],
                  },
                  then: {
                    $subtract: [
                      "$odds",
                      {
                        $multiply: [
                          "$odds",
                          {
                            $divide: [2, 100],
                          },
                        ],
                      },
                    ],
                  },
                  else: "$odds",
                },
              },
              rake: {
                $cond: {
                  if: {
                    $gt: ["$odds", 0],
                  },
                  then: {
                    $multiply: [
                      "$odds",
                      {
                        $divide: [2, 100],
                      },
                    ],
                  },
                  else: 0,
                },
              },
            },
          },
          {
            $project: {
              totalAmount: {
                $sum: ["$bookMark", "$Session", "$Premium", "$oddsNew"],
              },
              rake: 1,
            },
          },
          {
            $group: {
              _id: "null",
              amount: {
                $sum: "$totalAmount",
              },
              rake: {
                $sum: "$rake",
              },
            },
          },
        ],
      });
    console.timeEnd("starrt:::userInfoAgent");
    console.time("starrt:::casinoHisab");
    const casinoHisab = await mongo.bettingApp
      .model(mongo.models.casinoMatchHistory)
      .aggregate({
        pipeline: [
          {
            $match: casinoQuery,
          },
          {
            $group: {
              _id: null,
              totalAmountWin: {
                $sum: {
                  $cond: {
                    if: { $eq: ["$gameStatus", "WIN"] },
                    then: "$winLostAmount",
                    else: 0,
                  },
                },
              },
              totalAmountLost: {
                $sum: {
                  $cond: {
                    if: { $eq: ["$gameStatus", "LOSE"] },
                    then: "$winLostAmount",
                    else: 0,
                  },
                },
              },
            },
          },
          {
            $project: {
              totalAmount: {
                $subtract: ["$totalAmountWin", "$totalAmountLost"],
              },
            },
          },
        ],
      });
    console.timeEnd("starrt:::casinoHisab");
    console.log("userInfoAgent :: ", userInfoAgent);
    console.log("casinoHisab :: ", casinoHisab);
    if (userInfoAgent && userInfoAgent.length > 0 && userInfoAgent[0].amount) {
      mypl += userInfoAgent[0].amount;
    }
    if (casinoHisab && casinoHisab.length > 0 && casinoHisab[0].totalAmount) {
      mypl += casinoHisab[0].totalAmount;
    }
  }
  console.log("mypl :: ", mypl);
};

agReport();
// getUserReport("65570886b2baef4a15223c29", 2, "", "", "");
async function user(id = "", to = "", from = "", filter = "") {
  const userId = mongo.ObjectId("6556f2edb2baef4a1521b60e");
  let userQuery = {
    whoAdd: userId, // for all users
  };
  const adminQuery = {
    admin: userId,
  };
  const query = {
    _id: userId,
  };
  const userList = [];

  const adminInfo = await mongo.bettingApp.model(mongo.models.admins).findOne({
    query,
    select: {
      user_name: 1,
      agent_level: 1,
      whoAdd: 1,
    },
  });

  if (adminInfo.agent_level === "DL") {
    if (id !== "") {
      userQuery = {
        _id: mongo.ObjectId(id),
      };
    }
    // if have the user
    const userInfo = await mongo.bettingApp.model(mongo.models.users).find({
      query: userQuery,
      select: {
        agent_level: 1,
        user_name: 1,
        createdAt: 1,
        commission: 1,
      },
    });

    console.log(" downline report userInfo ::  ", userInfo);
    for await (const user of userInfo) {
      const call = await getUserReport(
        user._id,
        user.commission,
        to,
        from,
        filter
      );

      console.log(`userName : ${user.user_name} :: call : ${call}`);
      userList.push({
        ...user,
        ...call,
      });
    }
  } else {
    const agentInfo = await mongo.bettingApp.model(mongo.models.admins).find({
      query: adminQuery,
      select: {
        agent_level: 1,
        user_name: 1,
        createdAt: 1,
        _id: 1,
      },
    });
    for await (const agent of agentInfo) {
      const report = {
        stack: 0,
        playerProfitLost: 0,
        comm: 0,
        upLineProfitLost: 0,
        casinoStack: 0,
        casinoProfitLost: 0,
      };
      userQuery.whoAdd = mongo.ObjectId(agent._id);

      const userInfoAgent = await mongo.bettingApp
        .model(mongo.models.users)
        .find({
          query: userQuery,
          select: {
            agent_level: 1,
            user_name: 1,
            createdAt: 1,
            commission: 1,
          },
        });
      for await (const user of userInfoAgent) {
        const call = await getUserReport(
          user._id,
          user.commission,
          to,
          from,
          filter
        );
        console.log(`else : userName : ${user.user_name} :: call : ${call}`);
        report.stack += call.stack;
        report.playerProfitLost += call.playerProfitLost;
        report.comm += call.comm;
        report.upLineProfitLost += call.upLineProfitLost;
        report.casinoStack += call.casinoStack;
        report.casinoProfitLost += call.casinoProfitLost;
      }

      console.log(
        `else : agent : userName : ${agent.user_name} :: report : ${report}`
      );
      userList.push({
        ...agent,
        ...report,
      });
    }
  }
  userList.forEach((element, index) => {
    if (userList[index].commission)
      userList[index].commission =
        element.commission !== 0
          ? element.commission.toFixed(2)
          : element.commission;
    userList[index].stack =
      element.stack !== 0 ? element.stack.toFixed(2) : element.stack;
    userList[index].playerProfitLost =
      element.playerProfitLost !== 0
        ? element.playerProfitLost.toFixed(2)
        : element.playerProfitLost;
    userList[index].comm =
      element.comm !== 0 ? element.comm.toFixed(2) : element.comm;
    userList[index].upLineProfitLost =
      element.upLineProfitLost !== 0
        ? element.upLineProfitLost.toFixed(2)
        : element.upLineProfitLost;
    userList[index].casinoStack =
      element.casinoStack !== 0
        ? element.casinoStack.toFixed(2)
        : element.casinoStack;
    userList[index].casinoProfitLost =
      element.casinoProfitLost !== 0
        ? element.casinoProfitLost.toFixed(2)
        : element.casinoProfitLost;
  });
  const total = {
    stack: 0,
    playerProfitLost: 0,
    comm: 0,
    upLineProfitLost: 0,
    casinoStack: 0,
    casinoProfitLost: 0,
  };

  for await (const user of userList) {
    total.stack += Number(user.stack);
    total.playerProfitLost += Number(user.playerProfitLost);
    total.comm += Number(user.comm);
    total.upLineProfitLost += Number(user.upLineProfitLost);
    total.casinoStack += Number(user.casinoStack);
    total.casinoProfitLost += Number(user.casinoProfitLost);
  }

  total.stack =
    total.stack !== 0 ? Number(total.stack.toFixed(2)) : total.stack;
  total.playerProfitLost =
    total.playerProfitLost !== 0
      ? Number(total.playerProfitLost.toFixed(2))
      : total.playerProfitLost;
  total.comm = total.comm !== 0 ? Number(total.comm.toFixed(2)) : total.comm;
  total.upLineProfitLost =
    total.upLineProfitLost !== 0
      ? Number(total.upLineProfitLost.toFixed(2))
      : total.upLineProfitLost;
  total.casinoStack =
    total.casinoStack !== 0
      ? Number(total.casinoStack.toFixed(2))
      : total.casinoStack;
  total.casinoProfitLost =
    total.casinoProfitLost !== 0
      ? Number(total.casinoProfitLost.toFixed(2))
      : total.casinoProfitLost;

  const sendObject = {
    userList,
    total,
  };

  console.log("sendObject :: ", sendObject);
}

// user();
// db.getCollection('casinomatchhistories').aggregate(
//     [
//         {
//            $match : {"userObjectId" : {$in : [
//             ObjectId("65632a25069884d84866740a")
//         ]}, winLostAmount : { $gt : 0 }}
//         },
//         {
//             $group: {
//                 _id : null,
//                 totalAmountWin: {
//                         $sum : {
//                                 $cond:{
//                                          if: { $eq: ["$gameStatus", "WIN"] },
//                                                 then: "$winLostAmount",
//                                                 else: 0
//                                         }
//                             }
//                     },
//                  totalAmountLost: {
//                         $sum : {
//                                 $cond:{
//                                          if: { $eq: ["$gameStatus", "LOSE"] },
//                                                 then: "$winLostAmount",
//                                                 else: 0
//                                         }
//                             }
//                     }
//                 }
//         },
//         {
//              $project: {
//                 totalAmount: {
//                         $subtract: ["$totalAmountWin", "$totalAmountLost"]
//                     }
//         }
//         }
//     ]
//     )

//     db.getCollection('betshistories').aggregate(
//         [
//             {
//                $match : {"userObjectId" : {$in : [
//                 ObjectId("65632a25069884d84866740a")
//             ]}, "betStatus" : "completed"}
//             },
//             {
//                 $group: {
//                     _id : null,
//                     totalAmountWin: {
//                             $sum : {
//                                     $cond:{
//                                              if: { $and : [
//                                                     { $and : [ {$ne: ["$winner",""]}, {$ne: ["$winner","cancel"]} ] },
//                                                     {
//                                                      $or:[
//                                                         $eq: ["$betType", "odds"],
//                                                         $eq: ["$betType", "bookMark"]
//                                                         ]
//                                                      }
//                                                  ]
//                                                   },
//                                                     then: "$winLostAmount",
//                                                     else: 0
//                                             }
//                                 }
//                         },
//                      totalAmountLost: {
//                             $sum : {
//                                     $cond:{
//                                              if: { $eq: ["$gameStatus", "LOSE"] },
//                                                     then: "$winLostAmount",
//                                                     else: 0
//                                             }
//                                 }
//                         }
//                     }
//             },
//             {
//                  $project: {
//                     totalAmount: {
//                             $subtract: ["$totalAmountWin", "$totalAmountLost"]
//                         }
//             }
//             }
//         ]
//         )

// db.getCollection('statements').aggregate(
//   [
//       {
//          $match : {"userId" : ObjectId("65570886b2baef4a15223c29"), matchId : { $ne : null }
//              }
//       },
//       {
//           $group: {
//               _id : null,
//               totalAmountWin: {
//                       $sum : "$credit"
//                   },
//                totalAmountLost: {
//                       $sum : "$debit"
//                   }
//               }
//       },
//       {
//            $project: {
//               totalAmount: {
//                       $subtract: ["$totalAmountWin", "$totalAmountLost"]
//                   }
//       }
//       }
//   ]
//   )
