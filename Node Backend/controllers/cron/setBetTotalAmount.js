const mongo = require("../../config/mongodb");
const { GAME_STATUS } = require("../../constants");
const { getStartEndDateTime } = require("../../utils/comman/date");

const setBetTotalAmount = async () => {
  console.log("start : setBetTotalAmount");

  await sportTotalAmount();
  await casinoTotalAmount();
  console.log("end : setBetTotalAmount");
};

const sportTotalAmount = async () => {
  const { endDate } = getStartEndDateTime(
    new Date(),
    // new Date(new Date().setDate(new Date().getDate() - 1))
    new Date("2024-11-25 12:03:19.540Z")
  );
  const userIds = await mongo.bettingApp
    .model(mongo.models.betsHistory)
    .distinct({
      query: {
        deleted: false,
        betStatus: "completed",
        winner: { $ne: "cancel" },
        updatedAt: { $lte: endDate },
      },
      field: "userId",
    });

  for await (const userId of userIds) {
    let myPl = 0;
    const query = {
      userId: userId,
      deleted: false,
      betStatus: "completed",
      winner: { $ne: "cancel" },
      updatedAt: { $lte: endDate },
    };

    const userInfo = await mongo.bettingApp.model(mongo.models.users).findOne({
      query: { _id: userId },
      select: {
        _id: 1,
        commission: 1,
      },
    });
    const betsInfo = await mongo.bettingApp
      .model(mongo.models.betsHistory)
      .find({
        query,
        select: {
          _id: 1,
          betType: 1,
          winner: 1,
          selection: 1,
          betSide: 1,
          matchId: 1,
          userId: 1,
          profit: 1,
          betPlaced: 1,
          exposure: 1,
          fancyYes: 1,
          fancyNo: 1,
          oddsUp: 1,
          subSelection: 1,
        },
      });

    console.log(userId, " sportWiningsTotalAmount: betsInfo :: ", betsInfo);

    let oddsAmount1 = {};
    betsInfo.forEach((bet) => {
      // for (const bet of betsInfo) {
      if (bet.betType === "odds" || bet.betType === "bookMark") {
        if (bet.winner !== "" && bet.winner !== "cancel") {
          if (bet.selection === bet.winner) {
            // new
            if (bet.betSide === "back") {
              let commi = 0;
              if (bet.betType === "odds") {
                // commi = (bet.profit * commission) / 100;

                if (oddsAmount1[`${bet.matchId}-${bet.userId}`]) {
                  oddsAmount1[`${bet.matchId}-${bet.userId}`] += bet.profit;
                } else {
                  oddsAmount1[`${bet.matchId}-${bet.userId}`] = bet.profit;
                }
              }
              myPl += bet.profit - commi;
            } else {
              myPl -= bet.profit;

              if (bet.betType === "odds") {
                if (oddsAmount1[`${bet.matchId}-${bet.userId}`]) {
                  oddsAmount1[`${bet.matchId}-${bet.userId}`] -= bet.profit;
                } else {
                  oddsAmount1[`${bet.matchId}-${bet.userId}`] = -bet.profit;
                }
              }
            }
          } else if (bet.selection !== bet.winner) {
            // new
            if (bet.betSide === "lay") {
              let commi = 0;
              if (bet.betType === "odds") {
                // commi = (bet.betPlaced * commission) / 100;

                if (oddsAmount1[`${bet.matchId}-${bet.userId}`]) {
                  oddsAmount1[`${bet.matchId}-${bet.userId}`] += bet.betPlaced;
                } else {
                  oddsAmount1[`${bet.matchId}-${bet.userId}`] = bet.betPlaced;
                }
              }
              myPl += bet.betPlaced - commi;
            } else {
              myPl -= bet.exposure;

              if (bet.betType === "odds") {
                if (oddsAmount1[`${bet.matchId}-${bet.userId}`]) {
                  oddsAmount1[`${bet.matchId}-${bet.userId}`] -= bet.exposure;
                } else {
                  oddsAmount1[`${bet.matchId}-${bet.userId}`] = -bet.exposure;
                }
              }
            }
          }
        }
      } else if (bet.betType === "session") {
        if (bet.winner !== "" && bet.winner !== -2) {
          if (bet.fancyYes === bet.fancyNo) {
            if (bet.betSide === "yes") {
              if (bet.oddsUp <= Number(bet.winner)) {
                myPl += bet.profit;
              } else {
                myPl -= bet.exposure;
              }
            } else {
              if (bet.oddsUp > Number(bet.winner)) {
                myPl += bet.betPlaced;
              } else {
                myPl -= bet.profit;
              }
            }
          } else {
            if (bet.betSide === "yes") {
              if (bet.oddsUp <= Number(bet.winner)) {
                myPl += bet.profit;
              } else {
                myPl -= bet.exposure;
              }
            } else {
              if (bet.oddsUp > Number(bet.winner)) {
                myPl += bet.betPlaced;
              } else {
                myPl -= bet.profit;
              }
            }
          }
        }
      } else if (bet.betType === "premium") {
        if (bet.winner !== "" && !bet.winner.includes("cancel")) {
          if (bet.winner.includes(bet.subSelection)) {
            myPl += bet.profit;
          } else if (!bet.winner.includes(bet.subSelection)) {
            myPl -= bet.exposure;
          }
        }
      }
      console.log(bet._id, " myPl : ", myPl);
    });
    console.log(" userInfo : ", userInfo, myPl);
    console.log(" oddsAmount1 : ", oddsAmount1);

    Object.keys(oddsAmount1).forEach((key) => {
      if (oddsAmount1[key] > 0) {
        const commi = (oddsAmount1[key] * userInfo.commission) / 100;
        console.log("commi :: ", commi);
        myPl -= commi;
      }
    });

    console.log(userId, " sportWiningsTotalAmount: myPl :: ", myPl);

    // update total in user account
    await mongo.bettingApp.model(mongo.models.users).updateOne({
      query: { _id: userId },
      update: {
        $set: {
          sportWiningsTotalAmount: myPl,
        },
      },
    });

    // update total in master account
    await mongo.bettingApp.model(mongo.models.admins).updateOne({
      query: { player: userId },
      update: {
        $set: {
          sportWiningsTotalAmount: myPl,
        },
      },
    });
  }
  console.log("end : sportTotalAmount");
  return true;
};

const casinoTotalAmount = async () => {
  console.log("start : casinoTotalAmount");
  const { endDate } = getStartEndDateTime(
    new Date(),
    // new Date(new Date().setDate(new Date().getDate() - 1))
    new Date("2024-11-25 12:03:19.540Z")
  );
  const userIds = await mongo.bettingApp
    .model(mongo.models.casinoMatchHistory)
    .distinct({
      query: {
        winLostAmount: { $ne: 0 },
        updatedAt: { $lte: endDate },
      },
      field: "userObjectId",
    });
  for await (const userId of userIds) {
    let myPl = 0;
    const casinoBetsInfo = await mongo.bettingApp
      .model(mongo.models.casinoMatchHistory)
      .find({
        query: {
          userObjectId: userId,
          winLostAmount: { $ne: 0 },
          updatedAt: { $lte: endDate },
        },
        select: {
          _id: 1,
          gameStatus: 1,
          winLostAmount: 1,
        },
      });

    casinoBetsInfo.forEach((casinoBet) => {
      // for (const casinoBet of casinoBetsInfo) {
      if (casinoBet.gameStatus === GAME_STATUS.WIN) {
        myPl += casinoBet.winLostAmount;
      } else if (casinoBet.gameStatus === GAME_STATUS.LOSE) {
        myPl -= casinoBet.winLostAmount;
      }
      // }
    });

    console.log(userId, "casinoTotalAmount :: myPl: ", myPl);

    // update total in user account
    await mongo.bettingApp.model(mongo.models.users).updateOne({
      query: { _id: userId },
      update: {
        $set: {
          casinoWiningsTotalAmount: myPl,
        },
      },
    });

    // update total in master account
    await mongo.bettingApp.model(mongo.models.admins).updateOne({
      query: { player: userId },
      update: {
        $set: {
          casinoWiningsTotalAmount: myPl,
        },
      },
    });
  }
  console.log("end : casinoTotalAmount");
  return true;
};

setBetTotalAmount();
