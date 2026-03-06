const config = require("../../config/config");
const mongo = require("../../config/mongodb");
const { EVENTS, ONLINE_PAYMENT } = require("../../constants");
const eventEmitter = require("../../eventEmitter");

async function sendUpdateBalanceEvent(userId, socket) {
  const query = {
    _id: mongo.ObjectId(userId),
  };
  const userInfo = await mongo.bettingApp.model(mongo.models.users).findOne({
    query,
    select: {
      balance: 1,
      remaining_balance: 1,
      exposure: 1,
      socketId: 1,
    },
  });

  console.log(
    new Date(),
    "sendUpdateBalanceEvent :: userInfo.socketId ::: ",
    userInfo
  );
  if ((userInfo && userInfo.socketId !== "") || socket !== "") {
    const sendObject = {
      en: EVENTS.UPDATE_USER_BALANCE,
      socket: socket ? socket : userInfo.socketId,
      data: {
        balance: userInfo.balance.toFixed(2),
        remaining_balance: userInfo.remaining_balance.toFixed(2),
        exposure: userInfo.exposure.toFixed(2),
      },
    };
    eventEmitter.emit(EVENTS.SOCKET, sendObject);
  }
  return true;
}
async function sendUpdateBalanceEventToAdmin(userId, socket) {
  const query = {
    _id: mongo.ObjectId(userId),
  };
  const userInfo = await mongo.bettingApp.model(mongo.models.admins).findOne({
    query,
    select: {
      balance: 1,
      remaining_balance: 1,
      exposure: 1,
      socketId: 1,
    },
  });

  console.log(
    new Date(),
    "sendUpdateBalanceEvent :: userInfo.socketId ::: ",
    userInfo
  );
  if ((userInfo && userInfo.socketId !== "") || socket !== "") {
    const sendObject = {
      en: EVENTS.UPDATE_USER_BALANCE,
      socket: socket ? socket : userInfo.socketId,
      data: {
        balance: userInfo.balance.toFixed(2),
        remaining_balance: userInfo.remaining_balance.toFixed(2),
        exposure: userInfo.exposure.toFixed(2),
      },
    };
    eventEmitter.emit(EVENTS.SOCKET, sendObject);
  }

  return true;
}
async function sendDepositWithdrawaCounter(userId) {
  const isOnlyPlayer = config.isOnlyPlayerDepositWithdrawa;
  const userInfo = await mongo.bettingApp.model(mongo.models.admins).findOne({
    query: {
      _id: userId,
    },
    select: {
      player: 1,
      socketId: 1,
    },
  });

  const userIds = await mongo.bettingApp.model(mongo.models.users).distinct({
    query: {
      whoAdd: userId,
    },
    field: "_id",
  });

  const depositeCount = await mongo.bettingApp
    .model(mongo.models.withdrawals)
    .countDocuments({
      query: {
        isApprove: false,
        approvalBy: null,
        userId: { $in: isOnlyPlayer ? userIds : userInfo?.player },
        transactionType: ONLINE_PAYMENT.DEPOSIT,
      },
    });
  const withdrawaCount = await mongo.bettingApp
    .model(mongo.models.withdrawals)
    .countDocuments({
      query: {
        isApprove: false,
        approvalBy: null,
        userId: { $in: isOnlyPlayer ? userIds : userInfo?.player },
        transactionType: ONLINE_PAYMENT.WITHDRAWAL,
      },
    });

  console.log("userInfo::sendDepositWithdrawaCounter: ", userInfo);

  if (userInfo && userInfo.socketId !== "") {
    const sendObject = {
      en: EVENTS.GET_DP_WL_COUNT,
      socket: userInfo.socketId,
      data: {
        depositeCount: depositeCount,
        withdrawaCount: withdrawaCount,
      },
    };
    eventEmitter.emit(EVENTS.SOCKET, sendObject);
  }
  return true;
}
module.exports = {
  sendUpdateBalanceEvent,
  sendUpdateBalanceEventToAdmin,
  sendDepositWithdrawaCounter,
};
