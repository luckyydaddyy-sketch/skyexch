const mongo = require("../config/mongodb");
const { USER_LEVEL_NEW } = require("../constants");

async function getUserReport(userId, commission, to, from, filter) {
    const query = {
      userId,
      deleted: false,
      // betStatus: "completed",
      winner: { $ne: "cancel" },
    };
  
    const casinoQuery = {
      userObjectId: userId,
      winLostAmount: { $ne: 0 },
    };
  
    // if (filter && filter === "date" && to && from) {
    if (to && from) {
      const { endDate, startDate } = getStartEndDateTime(from, to);
      query.createdAt = {
        $gte: startDate,
        $lte: endDate,
      };
      casinoQuery.createdAt = {
        $gte: startDate,
        $lte: endDate,
      };
    } else if ((filter && filter === "today") || filter === "yesterday") {
      const { endDate, startDate } = getDate(filter);
      query.createdAt = {
        $gte: startDate,
        $lte: endDate,
      };
      casinoQuery.createdAt = {
        $gte: startDate,
        $lte: endDate,
      };
    }
  
    const betsInfo = await mongo.bettingApp.model(mongo.models.betsHistory).find({
      query,
      select: {
        _id: 1,
        userId: 1,
        matchId: 1,
        betType: 1,
        stake: 1,
        winner: 1,
        selection: 1,
        betSide: 1,
        profit: 1,
        exposure: 1,
        betPlaced: 1,
        fancyYes: 1,
        fancyNo: 1,
        oddsUp: 1,
        subSelection: 1,
      },
    });
  
    console.log("getUserReport : betsInfo ::");
    console.log(betsInfo);
    const report = {
      stack: 0,
      playerProfitLost: 0,
      comm: 0,
      upLineProfitLost: 0,
      casinoStack: 0,
      casinoProfitLost: 0,
      total: 0,
    };
    console.log("getUserReport : report :: ", report);
    // for await (const bet of betsInfo) {
    //   report.stack += bet.stake;
  
    //   if (bet.betType === "odds" || bet.betType === "bookMark") {
    //     if (bet.winner !== "" && bet.winner !== "cancel") {
    //       if (bet.selection === bet.winner) {
    //         if (bet.betSide === "lay") {
    //           bet.profit = bet.exposure;
    //         }
    //         let commi = 0;
    //         if (bet.betType === "odds") {
    //           commi = (bet.profit * commission) / 100;
    //         }
    //         report.playerProfitLost += bet.profit - commi;
    //         report.upLineProfitLost -= bet.profit - commi;
    //         report.comm += commi;
    //       } else if (bet.selection !== bet.winner) {
    //         if (bet.betSide === "back") {
    //           bet.profit = bet.exposure;
    //         }
    //         report.playerProfitLost -= bet.profit;
    //         report.upLineProfitLost += bet.profit;
    //       }
    //     }
    //   } else if (bet.betType === "session") {
    //     if (bet.winner !== "" && bet.winner !== -2) {
    //       if (bet.fancyYes === bet.fancyNo) {
    //         if (bet.betSide === "yes") {
    //           if (bet.fancyYes < Number(bet.winner)) {
    //             report.playerProfitLost += bet.profit;
    //             report.upLineProfitLost -= bet.profit;
    //           } else {
    //             report.playerProfitLost -= bet.exposure;
    //             report.upLineProfitLost += bet.exposure;
    //           }
    //         } else {
    //           if (bet.fancyNo > Number(bet.winner)) {
    //             report.playerProfitLost += bet.exposure;
    //             report.upLineProfitLost -= bet.exposure;
    //           } else {
    //             report.playerProfitLost -= bet.profit;
    //             report.upLineProfitLost += bet.profit;
    //           }
    //         }
    //       } else {
    //         if (bet.betSide === "yes") {
    //           if (bet.fancyYes <= Number(bet.winner)) {
    //             report.playerProfitLost += bet.profit;
    //             report.upLineProfitLost -= bet.profit;
    //           } else {
    //             report.playerProfitLost -= bet.exposure;
    //             report.upLineProfitLost += bet.exposure;
    //           }
    //         } else {
    //           if (bet.fancyNo >= Number(bet.winner)) {
    //             report.playerProfitLost += bet.exposure;
    //             report.upLineProfitLost -= bet.exposure;
    //           } else {
    //             report.playerProfitLost -= bet.profit;
    //             report.upLineProfitLost += bet.profit;
    //           }
    //         }
    //       }
    //     }
    //   } else if (bet.betType === "premium") {
    //     if (bet.winner !== "" && bet.winner !== "cancel") {
    //       if (bet.subSelection === bet.winner) {
    //         report.playerProfitLost += bet.profit;
    //         report.upLineProfitLost -= bet.profit;
    //       } else if (bet.subSelection !== bet.winner) {
    //         report.playerProfitLost -= bet.exposure;
    //         report.upLineProfitLost += bet.exposure;
    //       }
    //     }
    //   }
    // }
  
    // console.log("send : sport :  report : ", report);
  
    // const casinoBetsInfo = await mongo.bettingApp
    //   .model(mongo.models.casinoMatchHistory)
    //   .find({
    //     query: casinoQuery,
    //   });
  
    // for await (const casinoBet of casinoBetsInfo) {
    //   report.casinoStack += casinoBet.betAmount;
  
    //   if (casinoBet.gameStatus === GAME_STATUS.WIN) {
    //     report.casinoProfitLost += casinoBet.winLostAmount;
    //     report.upLineProfitLost -= casinoBet.winLostAmount;
    //   } else if (casinoBet.gameStatus === GAME_STATUS.LOSE) {
    //     report.casinoProfitLost -= casinoBet.winLostAmount;
    //     report.upLineProfitLost += casinoBet.winLostAmount;
    //   }
    // }
  
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
        report.comm -= commi;
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
  
      const betStateMent = await mongo.bettingApp
        .model(mongo.models.statements)
        .find({
          query: {
            userId: userId,
            casinoMatchId: casinoBet._id,
          },
          select: {
            credit: 1,
            userId: 1,
            debit: 1,
          },
        });
  
      for await (const betState of betStateMent) {
        if (betState.credit !== 0) {
          // report.casinoProfitLost += betState.credit;
  
          report.casinoProfitLost += betState.credit;
          report.upLineProfitLost -= betState.credit;
        } else if (betState.debit !== 0) {
          // report.casinoProfitLost -= betState.debit;
          report.casinoProfitLost -= betState.debit;
          report.upLineProfitLost += betState.debit;
        }
      }
  
      // if (casinoBet.gameStatus === GAME_STATUS.WIN) {
      //   report.casinoProfitLost += casinoBet.winLostAmount;
      //   report.upLineProfitLost -= casinoBet.winLostAmount;
      // } else if (casinoBet.gameStatus === GAME_STATUS.LOSE) {
      //   report.casinoProfitLost -= casinoBet.winLostAmount;
      //   report.upLineProfitLost += casinoBet.winLostAmount;
      // }
    }
    return report;
  }
  async function getUserReportForAdmin(userId, commission, to, from, filter) {
    const query = {
      userId,
      deleted: false,
      // betStatus: "completed",
      winner: { $ne: "cancel" },
    };
  
    const casinoQuery = {
      userObjectId: userId,
      winLostAmount: { $ne: 0 },
    };
  
    // if (filter && filter === "date" && to && from) {
    if (to && from) {
      const { endDate, startDate } = getStartEndDateTime(from, to);
      query.createdAt = {
        $gte: startDate,
        $lte: endDate,
      };
      casinoQuery.createdAt = {
        $gte: startDate,
        $lte: endDate,
      };
    } else if ((filter && filter === "today") || filter === "yesterday") {
      const { endDate, startDate } = getDate(filter);
      query.createdAt = {
        $gte: startDate,
        $lte: endDate,
      };
      casinoQuery.createdAt = {
        $gte: startDate,
        $lte: endDate,
      };
    }
  
    const betsInfo = await mongo.bettingApp.model(mongo.models.betsHistory).find({
      query,
      select: {
        _id: 1,
        userId: 1,
        matchId: 1,
        betType: 1,
        stake: 1,
        winner: 1,
        selection: 1,
        betSide: 1,
        profit: 1,
        exposure: 1,
        betPlaced: 1,
        fancyYes: 1,
        fancyNo: 1,
        oddsUp: 1,
        subSelection: 1,
      },
    });
  
    console.log("getUserReport : betsInfo ::");
    console.log(betsInfo);
    const report = {
      stack: 0,
      playerProfitLost: 0,
      comm: 0,
      upLineProfitLost: 0,
      casinoStack: 0,
      casinoProfitLost: 0,
      total: 0,
    };
    console.log("getUserReport : report :: ", report);
    // for await (const bet of betsInfo) {
    //   report.stack += bet.stake;
  
    //   if (bet.betType === "odds" || bet.betType === "bookMark") {
    //     if (bet.winner !== "" && bet.winner !== "cancel") {
    //       if (bet.selection === bet.winner) {
    //         if (bet.betSide === "lay") {
    //           bet.profit = bet.exposure;
    //         }
    //         let commi = 0;
    //         if (bet.betType === "odds") {
    //           commi = (bet.profit * commission) / 100;
    //         }
    //         report.playerProfitLost += bet.profit - commi;
    //         report.upLineProfitLost -= bet.profit - commi;
    //         report.comm += commi;
    //       } else if (bet.selection !== bet.winner) {
    //         if (bet.betSide === "back") {
    //           bet.profit = bet.exposure;
    //         }
    //         report.playerProfitLost -= bet.profit;
    //         report.upLineProfitLost += bet.profit;
    //       }
    //     }
    //   } else if (bet.betType === "session") {
    //     if (bet.winner !== "" && bet.winner !== -2) {
    //       if (bet.fancyYes === bet.fancyNo) {
    //         if (bet.betSide === "yes") {
    //           if (bet.fancyYes < Number(bet.winner)) {
    //             report.playerProfitLost += bet.profit;
    //             report.upLineProfitLost -= bet.profit;
    //           } else {
    //             report.playerProfitLost -= bet.exposure;
    //             report.upLineProfitLost += bet.exposure;
    //           }
    //         } else {
    //           if (bet.fancyNo > Number(bet.winner)) {
    //             report.playerProfitLost += bet.exposure;
    //             report.upLineProfitLost -= bet.exposure;
    //           } else {
    //             report.playerProfitLost -= bet.profit;
    //             report.upLineProfitLost += bet.profit;
    //           }
    //         }
    //       } else {
    //         if (bet.betSide === "yes") {
    //           if (bet.fancyYes <= Number(bet.winner)) {
    //             report.playerProfitLost += bet.profit;
    //             report.upLineProfitLost -= bet.profit;
    //           } else {
    //             report.playerProfitLost -= bet.exposure;
    //             report.upLineProfitLost += bet.exposure;
    //           }
    //         } else {
    //           if (bet.fancyNo >= Number(bet.winner)) {
    //             report.playerProfitLost += bet.exposure;
    //             report.upLineProfitLost -= bet.exposure;
    //           } else {
    //             report.playerProfitLost -= bet.profit;
    //             report.upLineProfitLost += bet.profit;
    //           }
    //         }
    //       }
    //     }
    //   } else if (bet.betType === "premium") {
    //     if (bet.winner !== "" && bet.winner !== "cancel") {
    //       if (bet.subSelection === bet.winner) {
    //         report.playerProfitLost += bet.profit;
    //         report.upLineProfitLost -= bet.profit;
    //       } else if (bet.subSelection !== bet.winner) {
    //         report.playerProfitLost -= bet.exposure;
    //         report.upLineProfitLost += bet.exposure;
    //       }
    //     }
    //   }
    // }
  
    // console.log("send : sport :  report : ", report);
  
    // const casinoBetsInfo = await mongo.bettingApp
    //   .model(mongo.models.casinoMatchHistory)
    //   .find({
    //     query: casinoQuery,
    //   });
  
    // for await (const casinoBet of casinoBetsInfo) {
    //   report.casinoStack += casinoBet.betAmount;
  
    //   if (casinoBet.gameStatus === GAME_STATUS.WIN) {
    //     report.casinoProfitLost += casinoBet.winLostAmount;
    //     report.upLineProfitLost -= casinoBet.winLostAmount;
    //   } else if (casinoBet.gameStatus === GAME_STATUS.LOSE) {
    //     report.casinoProfitLost -= casinoBet.winLostAmount;
    //     report.upLineProfitLost += casinoBet.winLostAmount;
    //   }
    // }
  
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
              report.playerProfitLost -= bet.profit - commi;
              report.upLineProfitLost -= bet.profit - commi;
              report.comm += commi;
            } else {
              report.playerProfitLost += bet.profit;
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
              report.playerProfitLost -= bet.betPlaced - commi;
              report.upLineProfitLost -= bet.betPlaced - commi;
              report.comm += commi;
            } else {
              report.playerProfitLost += bet.exposure;
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
                report.playerProfitLost -= bet.profit;
                report.upLineProfitLost -= bet.profit;
              } else {
                report.playerProfitLost += bet.exposure;
                report.upLineProfitLost += bet.exposure;
              }
            } else {
              if (bet.oddsUp > Number(bet.winner)) {
                report.playerProfitLost -= bet.betPlaced;
                report.upLineProfitLost -= bet.betPlaced;
              } else {
                report.playerProfitLost += bet.profit;
                report.upLineProfitLost += bet.profit;
              }
            }
          } else {
            if (bet.betSide === "yes") {
              if (bet.oddsUp <= Number(bet.winner)) {
                report.playerProfitLost -= bet.profit;
                report.upLineProfitLost -= bet.profit;
              } else {
                report.playerProfitLost += bet.exposure;
                report.upLineProfitLost += bet.exposure;
              }
            } else {
              if (bet.oddsUp > Number(bet.winner)) {
                report.playerProfitLost -= bet.betPlaced;
                report.upLineProfitLost -= bet.betPlaced;
              } else {
                report.playerProfitLost += bet.profit;
                report.upLineProfitLost += bet.profit;
              }
            }
          }
        }
      } else if (bet.betType === "premium") {
        if (bet.winner !== "" && bet.winner !== "cancel") {
          if (bet.subSelection === bet.winner) {
            report.playerProfitLost -= bet.profit;
            report.upLineProfitLost -= bet.profit;
          } else if (bet.subSelection !== bet.winner) {
            report.playerProfitLost += bet.exposure;
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
        report.playerProfitLost += commi;
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
  
      const betStateMent = await mongo.bettingApp
        .model(mongo.models.statements)
        .find({
          query: {
            userId: userId,
            casinoMatchId: casinoBet._id,
          },
          select: {
            credit: 1,
            userId: 1,
            debit: 1,
          },
        });
  
      for await (const betState of betStateMent) {
        if (betState.credit !== 0) {
          // report.casinoProfitLost += betState.credit;
  
          report.casinoProfitLost -= betState.credit;
          report.upLineProfitLost -= betState.credit;
        } else if (betState.debit !== 0) {
          // report.casinoProfitLost -= betState.debit;
          report.casinoProfitLost += betState.debit;
          report.upLineProfitLost += betState.debit;
        }
      }
  
      // if (casinoBet.gameStatus === GAME_STATUS.WIN) {
      //   report.casinoProfitLost += casinoBet.winLostAmount;
      //   report.upLineProfitLost -= casinoBet.winLostAmount;
      // } else if (casinoBet.gameStatus === GAME_STATUS.LOSE) {
      //   report.casinoProfitLost -= casinoBet.winLostAmount;
      //   report.upLineProfitLost += casinoBet.winLostAmount;
      // }
    }
    return report;
  }
  

async function handler({ body, user }) {
    const { id, to, from, filter } = body;
    const { userId } = user;
  
    const query = {
      _id: userId,
    };
  
    if (id) query._id = mongo.ObjectId(id);
  
    const adminInfo = await mongo.bettingApp.model(mongo.models.admins).findOne({
      query,
      select: {
        user_name: 1,
        agent_level: 1,
        whoAdd: 1,
      },
    });
  
    if (!adminInfo) {
      // Check for above admin data
      throw new ApiError(httpStatus.BAD_REQUEST, 'CUSTOM_MESSAGE.USER_NOT_FOUND');
    }
  
    console.log(" downline report adminInfo ::  ", adminInfo);
    const adminQuery = {
      admin: userId,
    };
  
    // change admin to whoAdd
    let userQuery = {
      whoAdd: userId, // for all users
      // admin: userId,
    };
    if (id) {
      userQuery.whoAdd = mongo.ObjectId(id); // for all users
      adminQuery.admin = mongo.ObjectId(id);
    }
    // if (id) userQuery.admin = mongo.ObjectId(id);
  
    const userList = [];
  
    console.log(" downline report userQuery ::  ", userQuery);
    console.log(" downline report adminQuery ::  ", adminQuery);
    if (adminInfo.agent_level === USER_LEVEL_NEW.M) {
      // if (id) {
      //   userQuery = {
      //     _id: mongo.ObjectId(id),
      //   };
      // }
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
          const call = await getUserReportForAdmin(
            user._id,
            user.commission,
            to,
            from,
            filter
          );
          report.stack += call.stack;
          report.playerProfitLost += call.playerProfitLost;
          report.comm += call.comm;
          report.upLineProfitLost += call.upLineProfitLost;
          report.casinoStack += call.casinoStack;
          report.casinoProfitLost += call.casinoProfitLost;
        }
  
        if (
          Number(report.playerProfitLost) > 0 ||
          Number(report.playerProfitLost) < 0 ||
          Number(report.casinoProfitLost) > 0 ||
          Number(report.casinoProfitLost) < 0
        ) {
          userList.push({
            ...agent,
            ...report,
          });
        }
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
      userList[index].total =
        Number(userList[index].playerProfitLost) +
        Number(userList[index].casinoProfitLost) +
        Number(userList[index].comm);
      userList[index].total =
        userList[index].total !== 0
          ? Number(userList[index].total.toFixed(2))
          : userList[index].total;
    });
    const total = {
      stack: 0,
      playerProfitLost: 0,
      comm: 0,
      upLineProfitLost: 0,
      casinoStack: 0,
      casinoProfitLost: 0,
      total: 0,
    };
  
    for await (const user of userList) {
      total.stack += Number(user.stack);
      total.playerProfitLost += Number(user.playerProfitLost);
      total.comm += Number(user.comm);
      total.upLineProfitLost += Number(user.upLineProfitLost);
      total.casinoStack += Number(user.casinoStack);
      total.casinoProfitLost += Number(user.casinoProfitLost);
      // total.casinoProfitLost += Number(user.casinoProfitLost);
      total.total += Number(user.total);
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
    total.total =
      total.total !== 0 ? Number(total.total.toFixed(2)) : total.total;
  
    // const uperLineInfo = await getAdminUserInfo(
    //   adminInfo.whoAdd,
    //   id ? id : userId,
    //   userId
    // );
    const sendObject = {
      userList,
      total,
    //   uperLineInfo,
      msg: "downline report!",
    };
    
    console.log("sendObject ::: start :: ");
    console.log(sendObject);
    
    console.log("sendObject ::: end :: ");
    
    return sendObject;
  }

  handler({
    body:{

    }, user:{
        userId: ""
    }
  })