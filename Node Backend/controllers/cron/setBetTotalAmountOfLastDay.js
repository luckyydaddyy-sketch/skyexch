const moment = require("moment-timezone");
const mongo = require("../../config/mongodb");
const { getStartEndDateTime } = require("../../utils/comman/date");
const { GAME_STATUS } = require("../../constants");

const setBetTotalAmountOfLastDay = async () => {
  let date = new Date();
  const lastRecord = await mongo.bettingApp
    .model(mongo.models.daysWiseBetTotalAmount)
    .findOne({
      sort: { dayDate: -1 },
      select: {
        dayDate: 1,
        dayDateString: 1,
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
    date = moment(new Date(lastRecord.dayDate)).tz("Asia/Dhaka").add(1, "day");
  }
  console.log("setBetTotalAmountOfLastDay: date :: ", date);
  const getFromDb = getStartEndDateTimeOnlyForCron(
    new Date(date),
    new Date(date)
  );
  console.log("setBetTotalAmountOfLastDay: startDate :: ", getFromDb.startDate);
  console.log("setBetTotalAmountOfLastDay: endDate :: ", getFromDb.endDate);
  // return false
  const getCurrant = getStartEndDateTimeOnlyForCron(new Date(), new Date());
  if (getFromDb.startDate === getCurrant.startDate) {
    return false;
  }

  const diffInMonths = moment(getCurrant.startDate).diff(
    getFromDb.startDate,
    "day"
  );
  console.log("setBetTotalAmountOfLastDay: diffInMonths :: ", diffInMonths);
  // return false;
  let numberOfDay = 0;
  while (numberOfDay <= diffInMonths) {
    const { startDate, endDate } = getStartEndDateTimeOnlyForCron(
      new Date(date),
      new Date(date)
    );
    console.log("startDate :while: ", startDate);
    await sportTotalAmount(startDate, endDate);
    await casinoTotalAmount(startDate, endDate);
    await dayTotalStore(startDate, endDate);
    numberOfDay += 1;
    date = moment(new Date(date)).tz("Asia/Dhaka").add(1, "day");
  }
  // await Promise.all([sportTotalAmount(), casinoTotalAmount()]);
  console.log("end : setBetTotalAmountOfLastDay");
};

const sportTotalAmount = async (startDate, endDate) => {
  // const { startDate, endDate } = getStartEndDateTime(
  //   // new Date(),
  //   // new Date(new Date().setDate(new Date().getDate() - 1))
  //   new Date(new Date().setDate(new Date().getDate() - 1)),
  //   new Date(new Date().setDate(new Date().getDate() - 1))
  // );
  const userIds = await mongo.bettingApp
    .model(mongo.models.betsHistory)
    .distinct({
      query: {
        deleted: false,
        betStatus: "completed",
        winner: { $ne: "cancel" },
        createdAt: { $gte: startDate, $lte: endDate },
      },
      field: "userId",
    });

  for await (const userId of userIds) {
    let myPl = 0;
    let myCome = 0;
    const query = {
      userId: userId,
      deleted: false,
      betStatus: "completed",
      winner: { $ne: "cancel" },
      createdAt: { $gte: startDate, $lte: endDate },
    };

    const userInfo = await mongo.bettingApp.model(mongo.models.users).findOne({
      query: { _id: userId },
      select: {
        _id: 1,
        commission: 1,
      },
    });

    const commission = userInfo.commission;
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
    });

    Object.keys(oddsAmount1).forEach((key) => {
      if (oddsAmount1[key] > 0) {
        const commi = (oddsAmount1[key] * commission) / 100;
        // console.log("commi :: ", commi);
        myCome = commi;
        myPl -= commi;
      }
    });

    const dayDate = moment(endDate).tz("Asia/Dhaka").format("DD-MM-YYYY");
    await mongo.bettingApp
      .model(mongo.models.daysWiseBetTotalAmount)
      .findOneAndUpdate({
        query: {
          userId,
          dayDate: new Date(endDate),
          dayDateString: dayDate,
        },
        update: {
          $set: {
            sportWiningsTotalAmount: myPl,
            sportWiningsTotalAmountCommi: myCome,
          },
        },
        options: {
          upsert: true,
          new: true,
        },
      });
    // // update total in user account
    // await mongo.bettingApp.model(mongo.models.users).updateOne({
    //   query: { _id: userId },
    //   update: {
    //     $inc: {
    //       sportWiningsTotalAmount: myPl,
    //     },
    //   },
    // });

    // // update total in master account
    // await mongo.bettingApp.model(mongo.models.admins).updateOne({
    //   query: { player: userId },
    //   update: {
    //     $inc: {
    //       sportWiningsTotalAmount: myPl,
    //     },
    //   },
    // });
  }
};

const casinoTotalAmount = async (startDate, endDate) => {
  // const { startDate, endDate } = getStartEndDateTime(
  //   new Date(new Date().setDate(new Date().getDate() - 1)),
  //   new Date(new Date().setDate(new Date().getDate() - 1))
  //   // new Date(),
  // );
  const userIds = await mongo.bettingApp
    .model(mongo.models.casinoMatchHistory)
    .distinct({
      query: {
        winLostAmount: { $ne: 0 },
        createdAt: { $gte: startDate, $lte: endDate },
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
          createdAt: { $gte: startDate, $lte: endDate },
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

    const dayDate = moment(endDate).tz("Asia/Dhaka").format("DD-MM-YYYY");
    await mongo.bettingApp
      .model(mongo.models.daysWiseBetTotalAmount)
      .findOneAndUpdate({
        query: {
          userId,
          dayDate: new Date(endDate),
          dayDateString: dayDate,
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
};

const dayTotalStore = async (startDate, endDate) => {
  // const { startDate, endDate } = getStartEndDateTime(
  //   new Date(new Date().setDate(new Date().getDate() - 1)),
  //   new Date(new Date().setDate(new Date().getDate() - 1))
  // );
  console.log("monthTotalStore is start");
  const userIDs = await mongo.bettingApp
    .model(mongo.models.daysWiseBetTotalAmount)
    .distinct({
      query: {
        dayDate: { $gte: startDate, $lte: endDate },
      },
      field: "userId",
    });

  for await (const userId of userIDs) {
    const monthHistory = await mongo.bettingApp
      .model(mongo.models.daysWiseBetTotalAmount)
      .find({ query: { userId, dayDate: { $gte: startDate, $lte: endDate } } });

    const sportWiningsTotalAmount = monthHistory.reduce((sum, info) => {
      return sum + Number(info?.sportWiningsTotalAmount || 0);
    }, 0);
    const casinoWiningsTotalAmount = monthHistory.reduce((sum, info) => {
      return sum + Number(info?.casinoWiningsTotalAmount || 0);
    }, 0);

    await mongo.bettingApp.model(mongo.models.users).updateOne({
      query: { _id: mongo.ObjectId(userId) },
      update: {
        $inc: {
          sportWiningsTotalAmount: sportWiningsTotalAmount,
          casinoWiningsTotalAmount: casinoWiningsTotalAmount,
        },
      },
    });
  }
  console.log("monthTotalStore is Done:", userIDs.length);

  return true;
};

function getStartEndDateTimeOnlyForCron(startDate, endDate) {
  let startDateTemp = moment(new Date(startDate)).tz("Asia/Dhaka");
  let endDateTemp = moment(new Date(endDate)).tz("Asia/Dhaka");

  // startDateTemp = startDateTemp.startOf("day"); // 00:00:00
  // endDateTemp = endDateTemp.endOf("day"); // 23:59:59

  // startDateTemp = startDateTemp.setHours(4, 0, 0, 0);
  startDateTemp = startDateTemp.subtract(1, "days");
  startDateTemp = startDateTemp
    .startOf("day")
    .hour(4)
    .minute(0)
    .second(0)
    .millisecond(0);
  endDateTemp = endDateTemp
    .endOf("day")
    .hour(3)
    .minute(59)
    .second(59)
    .millisecond(999);
  // endDateTemp = endDateTemp.setHours(3, 59, 59, 999);
  // if (
  //   moment(startDate).tz("Asia/Dhaka").format("DD/MM/YYYY") ===
  //   // moment(new Date()).tz("Asia/Dhaka").format("DD/MM/YYYY") ||
  //   moment(endDate).tz("Asia/Dhaka").format("DD/MM/YYYY")
  //   // === moment(new Date()).tz("Asia/Dhaka").format("DD/MM/YYYY")
  // ) {
  //   endDateTemp.add(1, "days");
  // }
  return { startDate: startDateTemp, endDate: endDateTemp };
}
module.exports = setBetTotalAmountOfLastDay;

// setBetTotalAmountOfLastDay();
