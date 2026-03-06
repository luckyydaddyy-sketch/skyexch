const mongo = require("../../../../config/mongodb");
const {
  getStartEndDateTime,
  getDate,
} = require("../../../../utils/comman/date");

const getTotalLostWinForUser = async (userId, to, from, filter) => {
  const query = {
    userId,
  };
  if (to && from) {
    const { endDate, startDate } = getStartEndDateTime(from, to);
    query.dayDate = {
      $gte: startDate,
      $lte: endDate,
    };
    console.log("getTotalLostWinForUser: endDate: ", endDate);
    console.log("getTotalLostWinForUser: startDate: ", startDate);
  } else if ((filter && filter === "today") || filter === "yesterday") {
    const { endDate, startDate } = getDate(filter, true);
    query.dayDate = {
      $gte: startDate,
      $lte: endDate,
    };
  }

  const daysWiseData = await mongo.bettingApp
    .model(mongo.models.daysWiseBetTotalAmount)
    .find({
      query,
    });

  console.log("getTotalLostWinForUser: daysWiseData:: ", daysWiseData);

  const sportWiningsTotalAmount = daysWiseData.reduce((sum, info) => {
    return sum + Number(info?.sportWiningsTotalAmount || 0);
  }, 0);
  const casinoWiningsTotalAmount = daysWiseData.reduce((sum, info) => {
    return sum + Number(info?.casinoWiningsTotalAmount || 0);
  }, 0);
  const sportWiningsTotalAmountCommi = daysWiseData.reduce((sum, info) => {
    return sum + Number(info?.sportWiningsTotalAmountCommi || 0);
  }, 0);

  const report = {
    stack: 0,
    playerProfitLost: -sportWiningsTotalAmount,
    comm: sportWiningsTotalAmountCommi,
    upLineProfitLost: -(sportWiningsTotalAmount + casinoWiningsTotalAmount),
    casinoStack: 0,
    casinoProfitLost: -casinoWiningsTotalAmount,
    total: 0,
  };

  return report;
};
const getTotalLostWinForUsersForAdmin = async (userIds, to, from, filter) => {
  const query = {
    userId: { $in: userIds },
  };
  if (to && from) {
    const { endDate, startDate } = getStartEndDateTime(from, to);
    query.dayDate = {
      $gte: startDate,
      $lte: endDate,
    };
    console.log("endDate: ", endDate);
    console.log("startDate: ", startDate);
  } else if ((filter && filter === "today") || filter === "yesterday") {
    const { endDate, startDate } = getDate(filter);
    query.dayDate = {
      $gte: startDate,
      $lte: endDate,
    };
  }

  const daysWiseData = await mongo.bettingApp
    .model(mongo.models.daysWiseBetTotalAmount)
    .find({
      query,
    });

  console.log("daysWiseData:: ", daysWiseData);

  const sportWiningsTotalAmount = daysWiseData.reduce((sum, info) => {
    return sum + Number(info?.sportWiningsTotalAmount || 0);
  }, 0);
  const casinoWiningsTotalAmount = daysWiseData.reduce((sum, info) => {
    return sum + Number(info?.casinoWiningsTotalAmount || 0);
  }, 0);
  const sportWiningsTotalAmountCommi = daysWiseData.reduce((sum, info) => {
    return sum + Number(info?.sportWiningsTotalAmountCommi || 0);
  }, 0);

  const report = {
    stack: 0,
    playerProfitLost: -sportWiningsTotalAmount,
    comm: sportWiningsTotalAmountCommi,
    upLineProfitLost: -(sportWiningsTotalAmount + casinoWiningsTotalAmount),
    casinoStack: 0,
    casinoProfitLost: -casinoWiningsTotalAmount,
    total: 0,
  };

  return report;
};

const getTotalAmountForAdmin = async (userIds) => {
  const query = {
    userId: { $in: userIds },
  };
  const daysWiseData = await mongo.bettingApp
    .model(mongo.models.daysWiseBetTotalAmount)
    .find({
      query,
    });

  const sportWiningsTotalAmount = daysWiseData.reduce((sum, info) => {
    return sum + Number(info?.sportWiningsTotalAmount || 0);
  }, 0);
  const casinoWiningsTotalAmount = daysWiseData.reduce((sum, info) => {
    return sum + Number(info?.casinoWiningsTotalAmount || 0);
  }, 0);
  const sportWiningsTotalAmountCommi = daysWiseData.reduce((sum, info) => {
    return sum + Number(info?.sportWiningsTotalAmountCommi || 0);
  }, 0);

  return (
    Number(sportWiningsTotalAmount) +
    Number(casinoWiningsTotalAmount) +
    Number(sportWiningsTotalAmountCommi)
  );
};

const getTotalCommissionForAdmin = async (userId) => {
  const query = {
    userId: userId,
  };
  const daysWiseData = await mongo.bettingApp
    .model(mongo.models.daysWiseBetTotalAmount)
    .find({
      query,
      select: {
        sportWiningsTotalAmountCommi: 1,
      },
    });

  const sportWiningsTotalAmountCommi = daysWiseData.reduce((sum, info) => {
    return sum + Number(info?.sportWiningsTotalAmountCommi || 0);
  }, 0);

  return Number(sportWiningsTotalAmountCommi);
};
module.exports = {
  getTotalLostWinForUser,
  getTotalLostWinForUsersForAdmin,
  getTotalAmountForAdmin,
  getTotalCommissionForAdmin
};
