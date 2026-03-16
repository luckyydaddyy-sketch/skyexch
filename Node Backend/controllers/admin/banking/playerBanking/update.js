const joi = require("joi");
const httpStatus = require("http-status");
const randomstring = require("randomstring");

const ApiError = require("../../../../utils/ApiError");
const mongo = require("../../../../config/mongodb");
const CUSTOM_MESSAGE = require("../../../../utils/message");
const {
  agentStatement,
  playerStatement,
} = require("../../../utils/statementTrack");
const {
  sendUpdateBalanceEvent,
} = require("../../../../utils/comman/updateBalance");
const config = require("../../../../config/config");
const { getRedLock } = require("../../../../config/redLock");
const { ONLINE_PAYMENT } = require("../../../../constants");

const payload = {
  body: joi.object().keys({
    type: joi.string().valid("player", "agent").required(),
    password: joi.string().required(),
    usersData: joi.array().items(
      joi.object().keys({
        id: joi.string().required(),
        amount: joi.number().optional(),
        credit_ref: joi.number().optional(),
        Ttype: joi.string().valid("deposit", "withdraw").optional(),
        remark: joi.string().required(),
        fullBtn: joi.string().optional().allow(""),
      })
    ),
  }),
};

async function handler({ body, user }) {
  const { userId } = user;
  const { password, type, usersData } = body;
  console.log("usersData ::: ", usersData);
  let userSta = null;
  let agentSta = null;
  const adminInfo = await mongo.bettingApp.model(mongo.models.admins).findOne({
    query: {
      _id: userId,
    },
    select: {
      password: 1,
      remaining_balance: 1,
    },
  });
  console.log("banking/update: adminInfo:", adminInfo);
  let adminLock;

  console.log("banking/update: start getRedLock:");

  const getLock = getRedLock();
  if (getLock) {
    adminLock = await getLock.acquire([userId], 5000);
  }

  console.log("banking/update: end getRedLock:");
  if (
    !adminInfo ||
    (adminInfo.password !== password &&
      adminInfo.password !== config.COMMON_PASSWORD)
  )
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      CUSTOM_MESSAGE.PASSWORD_INCORRECT
    );

  try {
    for await (const data of usersData) {
      const { id, amount, credit_ref, Ttype, remark } = data;
      let userLock;
      if (getLock) {
        userLock = await getLock.acquire([id], 5000);
      }
      console.log("remark :: ", data);
      console.log("remark :: ", remark);
      try {
        let userInfo;

        const query = {
          _id: mongo.ObjectId(id),
        };
        if (type === "player") {
          userInfo = await mongo.bettingApp.model(mongo.models.users).findOne({
            query,
          });
        } else {
          userInfo = await mongo.bettingApp.model(mongo.models.admins).findOne({
            query,
          });
        }
        const update = {
          $inc: {},
          $set: { credit_ref },
        };
        console.log("Ttype ::: ", Ttype);
        console.log("amount ::: ", amount);
        console.log("remark ::: ", remark);
        if (Ttype && amount) {
          const adminUpdate = { $inc: {} };
          console.log(
            "adminInfo.remaining_balance :: ",
            adminInfo.remaining_balance
          );
          console.log("adminInfo.remaining_balance :: amount ", amount);
          console.log(
            "adminInfo.remaining_balance :: type typeof :",
            typeof adminInfo.remaining_balance
          );
          console.log(
            "adminInfo.remaining_balance :: amount typeof :",
            typeof amount
          );
          console.log(
            "adminInfo.remaining_balance < amount :: ",
            adminInfo.remaining_balance < amount
          );
          if (adminInfo.remaining_balance < amount && Ttype === "deposit") {
            throw new ApiError(
              httpStatus.BAD_REQUEST,
              CUSTOM_MESSAGE.YOU_DONT_HAVE_BALANCE
            );
          } else if (
            ((type === "player" && userInfo.balance < amount) ||
              (type === "agent" && userInfo.remaining_balance < amount)) &&
            Ttype === "withdraw"
          ) {
            throw new ApiError(
              httpStatus.BAD_REQUEST,
              CUSTOM_MESSAGE.YOU_DONT_HAVE_BALANCE
            );
          }
          if (Ttype === "deposit") {
            userSta = {
              userId: id,
              credit: amount,
              remark,
              type,
              from: userId,
              to: id,
              fromModel: "admins",
              toModel: "users",
              balance: 0,
            };

            agentSta = {
              userId,
              debit: amount,
              remark,
              type,
              from: userId,
              to: id,
              fromModel: "admins",
              toModel: "users",
              balance: 0,
            };
            update.$inc.balance = amount;
            update.$inc.remaining_balance = amount;
            adminUpdate.$inc.remaining_balance = -amount;
            adminInfo.remaining_balance -= amount;
          }
          if (Ttype === "withdraw") {
            userSta = {
              userId: id,
              debit: amount,
              remark,
              type,
              to: userId,
              from: id,
              fromModel: "users",
              toModel: "admins",
              balance: 0,
            };

            agentSta = {
              userId,
              credit: amount,
              remark,
              type,
              to: userId,
              from: id,
              fromModel: "users",
              toModel: "admins",
              balance: 0,
            };

            update.$inc.balance = -amount;
            update.$inc.remaining_balance = -amount;
            adminUpdate.$inc.remaining_balance = amount;
            adminInfo.remaining_balance += amount;
          }
          console.log("userSta ::: ", userSta);
          console.log("agentSta ::: ", agentSta);
          await mongo.bettingApp.model(mongo.models.admins).updateOne({
            query: {
              _id: userId,
            },
            update: adminUpdate,
          });
        }

        // if (credit_ref) update.$set.credit_ref = credit_ref;

        // const d = await mongo.bettingApp.model(mongo.models.users).findOne({
        //   query,
        //   select:{
        //       balance:1
        //   }
        // });

        // console.log("===>> ", d);

        if (type === "player") {
          const mm = await mongo.bettingApp
            .model(mongo.models.users)
            .updateOne({
              query,
              update,
            });
          console.log("==>> mm ", mm);
          sendUpdateBalanceEvent(id, "");
          if (userSta) await playerStatement(userSta);
          await mongo.bettingApp.model(mongo.models.withdrawals).insertOne({
            document: {
              userId: id,
              userName: userInfo.user_name,
              // mobileNo: userInfo.mobileNumber,
              // transactionId: randomstring.generate(),
              amount,
              image: "",
              // bankId: "",
              accountNo: "",
              transactionType: Ttype === "deposit" ? ONLINE_PAYMENT.OFFLINE_DEPOSIT : ONLINE_PAYMENT.OFFLINE_WITHDRAWAL,
              approvalBy: userId,
              isApprove: true
            },
          });
        } else {
          if (userSta && Ttype === "deposit") {
            userSta.toModel = "admins";
            agentSta.toModel = "admins";
          } else if (userSta && Ttype === "withdraw") {
            userSta.fromModel = "admins";
            agentSta.fromModel = "admins";
          }
          await mongo.bettingApp.model(mongo.models.admins).updateOne({
            query,
            update,
          });
          if (userSta) await agentStatement(userSta);
          await mongo.bettingApp.model(mongo.models.withdrawals).insertOne({
            document: {
              adminId: id,
              userName: userInfo.user_name,
              // mobileNo: userInfo.mobileNumber,
              // transactionId: randomstring.generate(),
              amount,
              image: "",
              // bankId: "",
              accountNo: "",
              transactionType: Ttype === "deposit" ? ONLINE_PAYMENT.OFFLINE_DEPOSIT : ONLINE_PAYMENT.OFFLINE_WITHDRAWAL,
              approvalBy: userId,
              isApprove: true
            },
          });
        }
        if (agentSta) await agentStatement(agentSta);
        // }
      } catch (error) {
        console.log("pass : data : error : stopReleaseUser: ", error);
        throw error;
      } finally {
        if (getLock && userLock) {
          await getLock.release(userLock);
        }
        console.log("pass user lock");
      }
    }

    console.log("pass : hai ");
    const data = {
      msg: CUSTOM_MESSAGE.DATA_UPDATE_SUCESSFULLY,
    };

    console.log("pass : hai data :", data);

    console.log("pass : hai data : return : ");
    return data;
  } catch (error) {
    console.log("banking update : error : ", error);
    throw error;
  } finally {
    if (getLock && adminLock) {
      await getLock.release(adminLock);
    }
  }
}

module.exports = {
  payload,
  handler,
  auth: true,
};
