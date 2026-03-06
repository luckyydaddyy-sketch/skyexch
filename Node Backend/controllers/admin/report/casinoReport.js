const httpStatus = require("http-status");
const joi = require("joi");
const moment = require("moment-timezone");

const CUSTOM_MESSAGE = require("../../../utils/message");
const mongo = require("../../../config/mongodb");
const ApiError = require("../../../utils/ApiError");
const { getDate, getStartEndDateTime } = require("../../../utils/comman/date");
const { GAME_STATUS, USER_LEVEL_NEW } = require("../../../constants");
const { getAdminUserInfo } = require("../utile/getdownLineUsersList");
const {
  getTotalLostWinForUser,
  getTotalLostWinForUsersForAdmin,
} = require("./userProfitLost/getTotalLostWinForUser");

async function getUserCasinoReport(userId, to, from, filter) {
  const casinoQuery = {
    userObjectId: userId,
    winLostAmount: { $ne: 0 },
  };

  // if (filter && filter === "date" && to && from) {
  if (to && from) {
    const { endDate, startDate } = getStartEndDateTime(from, to);

    casinoQuery.createdAt = {
      $gte: startDate,
      $lte: endDate,
    };
  } else if ((filter && filter === "today") || filter === "yesterday") {
    const { endDate, startDate } = getDate(filter, true);

    casinoQuery.createdAt = {
      $gte: startDate,
      $lte: endDate,
    };
  }

  // console.log("getUserCasinoReport : betsInfo ::");
  // console.log(betsInfo);
  const report = {
    comm: 0,
    casinoStack: 0,
    casinoProfitLost: 0,
    total: 0,
  };

  console.log("send : sport :  casinoQuery : ", casinoQuery);
  console.log("send : sport :  report : ", report);

  const casinoBetsInfo = await mongo.bettingApp
    .model(mongo.models.casinoMatchHistory)
    .find({
      query: casinoQuery,
      select: {
        _id: 1,
        betAmount: 1,
        gameStatus: 1,
        winLostAmount: 1,
      },
    });

  for await (const casinoBet of casinoBetsInfo) {
    report.casinoStack += casinoBet.betAmount;

    // if (casinoBet.gameStatus === GAME_STATUS.WIN) {
    //   report.casinoProfitLost += casinoBet.winLostAmount;
    // } else if (casinoBet.gameStatus === GAME_STATUS.LOSE) {
    //   report.casinoProfitLost -= casinoBet.winLostAmount;
    // }
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
    console.log(" betStateMent :::  ", betStateMent);
    for await (const betState of betStateMent) {
      if (betState.credit !== 0) {
        report.casinoProfitLost += betState.credit;
      } else if (betState.debit !== 0) {
        report.casinoProfitLost -= betState.debit;
      }
    }

    report.total = report.casinoProfitLost;
  }

  report.comm = Number(report.comm.toFixed(2));
  report.casinoStack = Number(report.casinoStack.toFixed(2));
  report.casinoProfitLost = Number(report.casinoProfitLost.toFixed(2));
  report.total = Number(report.total.toFixed(2));
  console.log("send : sport :  report : after : ", report);

  return report;
}

async function getUserCasinoReportNewForAllUsers(userIds, to, from, filter) {
  const casinoQuery = {
    userObjectId: { $in: userIds },
    winLostAmount: { $ne: 0 },
  };

  // if (filter && filter === "date" && to && from) {
  if (to && from) {
    const { endDate, startDate } = getStartEndDateTime(from, to);

    casinoQuery.createdAt = {
      $gte: startDate,
      $lte: endDate,
    };
  } else if ((filter && filter === "today") || filter === "yesterday") {
    const { endDate, startDate } = getDate(filter, true);

    casinoQuery.createdAt = {
      $gte: startDate,
      $lte: endDate,
    };
  }

  // console.log("getUserCasinoReport : betsInfo ::");
  // console.log(betsInfo);
  const report = {
    comm: 0,
    casinoStack: 0,
    casinoProfitLost: 0,
    total: 0,
  };

  const call = await getTotalLostWinForUsersForAdmin(userIds, to, from, filter);

  // report.comm += call.comm;
  report.casinoStack += call.casinoStack;
  report.casinoProfitLost += call.casinoProfitLost;
  report.total += call.total;

  console.log("send : sport :  casinoQuery : ", casinoQuery);
  console.log("send : sport :  report : ", report);

  if (
    moment(new Date(to)).tz("Asia/Dhaka").format("DD/MM/YYYY") ===
      moment(new Date()).tz("Asia/Dhaka").format("DD/MM/YYYY") ||
    moment(new Date(from)).tz("Asia/Dhaka").format("DD/MM/YYYY") ===
      moment(new Date()).tz("Asia/Dhaka").format("DD/MM/YYYY")
  ) {
    // const { endDate, startDate } = getDate("today", true);
    const newDateObject = getDate("today", true);
    casinoQuery.createdAt = {
      $gte: newDateObject.startDate,
      $lte: newDateObject.endDate,
    };

    const casinoBetsInfo = await mongo.bettingApp
      .model(mongo.models.casinoMatchHistory)
      .find({
        query: casinoQuery,
        select: {
          _id: 1,
          betAmount: 1,
          gameStatus: 1,
          winLostAmount: 1,
          userObjectId: 1,
        },
      });

    for await (const casinoBet of casinoBetsInfo) {
      report.casinoStack += casinoBet.betAmount;

      // if (casinoBet.gameStatus === GAME_STATUS.WIN) {
      //   report.casinoProfitLost += casinoBet.winLostAmount;
      // } else if (casinoBet.gameStatus === GAME_STATUS.LOSE) {
      //   report.casinoProfitLost -= casinoBet.winLostAmount;
      // }
      const betStateMent = await mongo.bettingApp
        .model(mongo.models.statements)
        .find({
          query: {
            userId: casinoBet.userObjectId,
            casinoMatchId: casinoBet._id,
          },
          select: {
            credit: 1,
            userId: 1,
            debit: 1,
          },
        });
      console.log(" betStateMent :::  ", betStateMent);
      for await (const betState of betStateMent) {
        if (betState.credit !== 0) {
          report.casinoProfitLost += betState.credit;
        } else if (betState.debit !== 0) {
          report.casinoProfitLost -= betState.debit;
        }
      }

      report.total = report.casinoProfitLost;
    }
  }

  report.comm = Number(report.comm.toFixed(2));
  report.casinoStack = Number(report.casinoStack.toFixed(2));
  report.casinoProfitLost = Number(report.casinoProfitLost.toFixed(2));
  report.total = Number(report.total.toFixed(2));

  console.log("send : sport :  report : after : ", report);

  return report;
}

const payload = {
  body: joi.object().keys({
    filter: joi.string().valid("all", "today", "yesterday").optional(),
    to: joi.string().optional(),
    from: joi.string().optional(),
    id: joi.string().optional(),
  }),
};

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
    throw new ApiError(httpStatus.BAD_REQUEST, CUSTOM_MESSAGE.USER_NOT_FOUND);
  }

  console.log(" downline casino report adminInfo ::  ", adminInfo);
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

  console.log(" downline casino report userQuery ::  ", userQuery);
  console.log(" downline casino report adminQuery ::  ", adminQuery);
  if (adminInfo.agent_level === USER_LEVEL_NEW.M) {
    // if (id) {
    //   userQuery = {
    //     _id: mongo.ObjectId(id),
    //   };
    // }
    console.log(" downline casino report userQuery :befor:  ", userQuery);
    // if have the user
    const userInfo = await mongo.bettingApp.model(mongo.models.users).find({
      query: userQuery,
      populate: {
        path: "domain",
        model: await mongo.bettingApp.model(mongo.models.websites),
        select: ["domain"],
      },
      select: {
        agent_level: 1,
        user_name: 1,
        createdAt: 1,
        domain: 1,
      },
    });

    console.log(" downline casino report userInfo ::  ", userInfo);
    for await (const user of userInfo) {
      const call = await getUserCasinoReport(user._id, to, from, filter);
      userList.push({
        ...user,
        ...call,
      });
    }
  } else {
    const agentInfo = await mongo.bettingApp.model(mongo.models.admins).find({
      query: adminQuery,
      populate: {
        path: "domain",
        model: await mongo.bettingApp.model(mongo.models.websites),
        select: ["domain"],
      },
      select: {
        agent_level: 1,
        user_name: 1,
        createdAt: 1,
        domain: 1,
        _id: 1,
      },
    });
    for await (const agent of agentInfo) {
      userQuery.whoAdd = mongo.ObjectId(agent._id);
      const report = {
        comm: 0,
        casinoStack: 0,
        casinoProfitLost: 0,
        total: 0,
      };

      const userIds = await mongo.bettingApp
        .model(mongo.models.users)
        .distinct({
          query: userQuery,
          field: "_id",
        });
      const call = await getUserCasinoReportNewForAllUsers(
        userIds,
        to,
        from,
        filter
      );
      report.comm += call.comm;
      report.casinoStack += call.casinoStack;
      report.casinoProfitLost += call.casinoProfitLost;
      report.total += call.total;

      // const userInfoAgent = await mongo.bettingApp
      //   .model(mongo.models.users)
      //   .find({
      //     query: userQuery,
      //     select: {
      //       agent_level: 1,
      //       user_name: 1,
      //       createdAt: 1,
      //     },
      //   });

      // for await (const user of userInfoAgent) {
      //   // const call = await getUserCasinoReport(user._id, to, from, filter);
      //   if (filter !== "today") {
      //     const call = await getTotalLostWinForUser(user._id, to, from, filter);
      //     report.comm += call.comm;
      //     report.casinoStack += call.casinoStack;
      //     report.casinoProfitLost += call.casinoProfitLost;
      //     report.total += call.total;
      //   }

      //   if (
      //     moment(new Date(to)).tz("Asia/Dhaka").format("DD/MM/YYYY") ===
      //       moment(new Date()).tz("Asia/Dhaka").format("DD/MM/YYYY") ||
      //     moment(new Date(from)).tz("Asia/Dhaka").format("DD/MM/YYYY") ===
      //       moment(new Date()).tz("Asia/Dhaka").format("DD/MM/YYYY")
      //   ) {
      //     // const { endDate, startDate } = getDate("today", true);

      //     const callTemp = await getUserCasinoReport(
      //       user._id,
      //       null,
      //       null,
      //       "today"
      //     );
      //     report.comm += callTemp.comm;
      //     report.casinoStack += callTemp.casinoStack;
      //     report.casinoProfitLost += callTemp.casinoProfitLost;
      //     report.total += callTemp.total;
      //   }
      // }

      userList.push({
        ...agent,
        ...report,
      });
    }
  }

  const mainTotal = {
    casinoStack: 0,
    casinoProfitLost: 0,
    total: 0,
    comm: 0,
  };

  userList.forEach((element, index) => {
    userList[index].casinoStack =
      element.casinoStack !== 0
        ? Number(element.casinoStack.toFixed(2))
        : element.casinoStack;
    userList[index].casinoProfitLost =
      element.casinoProfitLost !== 0
        ? Number(element.casinoProfitLost.toFixed(2))
        : element.casinoProfitLost;
    userList[index].total =
      element.total !== 0 ? Number(element.total.toFixed(2)) : element.total;

    mainTotal.casinoStack += element.casinoStack;
    mainTotal.casinoProfitLost += element.casinoProfitLost;
    mainTotal.total += element.total;
  });

  mainTotal.casinoStack = Number(mainTotal.casinoStack.toFixed(2));
  mainTotal.casinoProfitLost = Number(mainTotal.casinoProfitLost.toFixed(2));
  mainTotal.total = Number(mainTotal.total.toFixed(2));

  const uperLineInfo = await getAdminUserInfo(
    adminInfo.whoAdd,
    id ? id : userId,
    userId
  );
  const sendObject = {
    mainTotal,
    userList,
    // total,
    uperLineInfo,
    msg: "downline casino report!",
  };

  return sendObject;
}

module.exports = {
  payload,
  handler,
  auth: true,
};
