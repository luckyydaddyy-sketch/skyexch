const joi = require("joi");

const mongo = require("../../../../config/mongodb");
const { ONLINE_PAYMENT, USER_LEVEL_NEW } = require("../../../../constants");
const { getStartEndDateTime } = require("../../../../utils/comman/date");
const config = require("../../../../config/config");

const payload = {
  body: joi.object().keys({
    limit: joi.number().required(),
    page: joi.number().required(),
    to: joi.string().optional(),
    from: joi.string().optional(),
    status: joi
      .string()
      .required()
      .valid("approve", "pending", "rejected", "all"),
  }),
};

async function handler({ body, user }) {
  const isApproveAdminPay = config.isOnlyPlayerDepositWithdrawa;
  const { userId } = user;
  const { limit, page, status, to, from } = body;

  const adminDetail = await mongo.bettingApp
    .model(mongo.models.admins)
    .findOne({
      query: { _id: userId },
      select: {
        player: 1,
        agent: 1,
        agent_level: 1,
      },
    });
  console.log("adminDetail :: ", adminDetail);
  let query = {
    // isApprove: true,
    transactionType: ONLINE_PAYMENT.DEPOSIT,
  };

  if (to && from) {
    const { endDate, startDate } = getStartEndDateTime(from, to);

    query.createdAt = {
      $gte: startDate,
      $lte: endDate,
    };
  }
  if (status === "approve") {
    query = {
      isApprove: true,
      approvalBy: { $ne: null },
      transactionType: ONLINE_PAYMENT.DEPOSIT,
    };
  } else if (status === "pending") {
    query = {
      isApprove: false,
      approvalBy: null,
      transactionType: ONLINE_PAYMENT.DEPOSIT,
    };
  } else if (status === "rejected") {
    query = {
      isApprove: false,
      approvalBy: {
        $ne: null,
      },
      transactionType: ONLINE_PAYMENT.DEPOSIT,
    };
  }

  if (adminDetail?.agent_level === USER_LEVEL_NEW.M) {
    query.userId = { $in: adminDetail?.player };
  } else {
    if (isApproveAdminPay) {
      const userIds = await mongo.bettingApp
        .model(mongo.models.users)
        .distinct({
          query: {
            whoAdd: adminDetail?._id,
          },
          field: "_id",
        });
      query.userId = { $in: userIds };
    } else {
      query.adminId = { $in: adminDetail?.agent };
    }
  }

  // if (!isApprove) {
  //   query.approvalBy = {
  //     $ne: null,
  //   };
  // }

  const bankDetailsData = await mongo.bettingApp
    .model(mongo.models.withdrawals)
    .paginate({
      query,
      limit,
      page,
      populate: {
        path: "bankId",
        model: await mongo.bettingApp.model(mongo.models.bankDetails),
      },
    });

  bankDetailsData.msg = "get deposit request successfully!";

  return bankDetailsData;
}

module.exports = {
  payload,
  handler,
  auth: true,
};
