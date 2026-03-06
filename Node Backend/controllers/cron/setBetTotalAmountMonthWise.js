const moment = require("moment-timezone");
const mongo = require("../../config/mongodb");
const { GAME_STATUS } = require("../../constants");
const { getMonthStartAndEndDate } = require("../../utils/comman/date");

const setBetTotalAmountMonthWise = async (date = null) => {
  console.log("start : setBetTotalAmountMonthWise");

  if (date) {
  } else {
    const lastRecord = await mongo.bettingApp
      .model(mongo.models.betTotalAmount)
      .findOne({
        sort: { monthDate: -1 },
        select: {
          monthDate: 1,
          monthDateString: 1,
        },
      });
    if (!lastRecord) {
      const firstRecord = await mongo.bettingApp
        .model(mongo.models.users)
        .findOne({
          sort: { createdAt: 1 },
          select: { createdAt: 1 },
        });
      if (!firstRecord) {
        return false;
      } else {
        date = firstRecord.createdAt;
      }
    } else {
      date = moment(new Date(lastRecord.monthDate))
        .tz("Asia/Dhaka")
        .add(1, "month");
    }
  }
  console.log("date :: ", date);
  console.log("date :Date: ", new Date(date));

  const getFromDb = getMonthStartAndEndDate(new Date(date));
  const getCurrant = getMonthStartAndEndDate(new Date());
  console.log("getFromDb :: ", getFromDb);

  if (getFromDb.startDate === getCurrant.startDate) {
    return false;
  }

  // getCurrant.startDate.diff;
  const diffInMonths = moment(getCurrant.startDate).diff(
    getFromDb.startDate,
    "month"
  );

  let numberOfMonth = 1;
  while (numberOfMonth <= diffInMonths) {
    console.log("diffInMonths :: ", diffInMonths);
    console.log("date :: ", date);
    await sportTotalAmount(date);
    await casinoTotalAmount(date);
    numberOfMonth += 1;
    date = moment(new Date(date)).tz("Asia/Dhaka").add(1, "month");
  }

  await monthTotalStore();

  console.log("end : setBetTotalAmountMonthWise");
};

const sportTotalAmount = async (date) => {
  const { endDate, startDate } = getMonthStartAndEndDate(new Date(date));

  const userIds = await mongo.bettingApp
    .model(mongo.models.betsHistory)
    .distinct({
      query: {
        deleted: false,
        betStatus: "completed",
        winner: { $ne: "cancel" },
        updatedAt: { $gte: startDate, $lte: endDate },
      },
      field: "userId",
    });

  // const userIds = [mongo.ObjectId('679ae0cf9f40691f2987e7d7')]
  for await (const userId of userIds) {
    let myPl = 0;
    const query = {
      userId: userId,
      deleted: false,
      betStatus: "completed",
      winner: { $ne: "cancel" },
      updatedAt: { $gte: startDate, $lte: endDate },
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

    // console.log(userId, " sportWiningsTotalAmount: betsInfo :: ", betsInfo);

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

    const monthDate = moment(endDate).tz("Asia/Dhaka").format("DD-MM-YYYY");
    console.log("monthDate :endDate: ", endDate);
    console.log("monthDate : ", monthDate);
    console.log("monthDate : new Date", new Date(monthDate));
    console.log("monthDate :new:startDate: ", startDate);
    console.log("monthDate :new: ", new Date(startDate));
    // update total in user account
    await mongo.bettingApp.model(mongo.models.betTotalAmount).findOneAndUpdate({
      query: {
        userId,
        monthDate: new Date(endDate),
        monthDateString: monthDate,
      },
      update: {
        $set: {
          sportWiningsTotalAmount: myPl,
        },
      },
      options: {
        upsert: true,
        new: true,
      },
    });
  }
  console.log("end : sportTotalAmount");
  return true;
};

const casinoTotalAmount = async (date) => {
  console.log("start : casinoTotalAmount");
  const { endDate, startDate } = getMonthStartAndEndDate(new Date(date));

  const userIds = await mongo.bettingApp
    .model(mongo.models.casinoMatchHistory)
    .distinct({
      query: {
        winLostAmount: { $ne: 0 },
        updatedAt: { $gte: startDate, $lte: endDate },
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
          updatedAt: { $gte: startDate, $lte: endDate },
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

    const monthDate = moment(endDate).tz("Asia/Dhaka").format("DD-MM-YYYY");

    // update total in user account
    await mongo.bettingApp.model(mongo.models.betTotalAmount).findOneAndUpdate({
      query: {
        userId,
        monthDate: new Date(endDate),
        monthDateString: monthDate,
      },
      update: {
        $set: {
          casinoWiningsTotalAmount: myPl,
        },
      },
      options: {
        upsert: true,
        new: true,
      },
    });
  }
  console.log("end : casinoTotalAmount");
  return true;
};

const monthTotalStore = async () => {
  console.log("monthTotalStore is start");
  const userIDs = await mongo.bettingApp
    .model(mongo.models.betTotalAmount)
    .distinct({ field: "userId" });

  for await (const userId of userIDs) {
    const monthHistory = await mongo.bettingApp
      .model(mongo.models.betTotalAmount)
      .find({ query: { userId } });

    const sportWiningsTotalAmount = monthHistory.reduce((sum, info) => {
      return sum + Number(info?.sportWiningsTotalAmount || 0);
    }, 0);
    const casinoWiningsTotalAmount = monthHistory.reduce((sum, info) => {
      return sum + Number(info?.casinoWiningsTotalAmount || 0);
    }, 0);

    await mongo.bettingApp.model(mongo.models.users).updateOne({
      query: { _id: userId },
      update: {
        $set: {
          casinoWiningsTotalAmountMonth: casinoWiningsTotalAmount,
          sportWiningsTotalAmountMonth: sportWiningsTotalAmount,
        },
      },
    });
  }
  console.log("monthTotalStore is Done");

  return true;
};

module.exports = setBetTotalAmountMonthWise;

// setBetTotalAmountMonthWise();
