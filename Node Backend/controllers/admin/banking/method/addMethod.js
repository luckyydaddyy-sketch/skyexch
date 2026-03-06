const joi = require("joi");

const mongo = require("../../../../config/mongodb");
const { TRANSACTION_METHOD, ONLINE_PAYMENT } = require("../../../../constants");

const payload = {
  body: joi.object().keys({
    type: joi
      .string()
      .valid(
        TRANSACTION_METHOD.BANK,
        TRANSACTION_METHOD.G_PAY,
        TRANSACTION_METHOD.P_PAY,
        TRANSACTION_METHOD.PAYTM,
        TRANSACTION_METHOD.UPI,
        TRANSACTION_METHOD.bKash,
        TRANSACTION_METHOD.Rocket,
        TRANSACTION_METHOD.Nagad,
        TRANSACTION_METHOD.Ok_Wallet,
        TRANSACTION_METHOD.SureCash,
        TRANSACTION_METHOD.Upay,
        TRANSACTION_METHOD.Tap,
        TRANSACTION_METHOD.USDT_TRC20,
        TRANSACTION_METHOD.BTC,
        TRANSACTION_METHOD.Local_Bank
      )
      .required(),
    name: joi.string().required(),
    accountNo: joi.string().required(),
    ifscCode: joi.string().optional().allow(""),
    holderName: joi.string().optional().allow(""),
    paymentType: joi
      .string()
      .valid(ONLINE_PAYMENT.DEPOSIT, ONLINE_PAYMENT.WITHDRAWAL),
  }),
};

async function handler({ body, user }) {
  const { userId } = user;
  const { type, name, accountNo, ifscCode, holderName, paymentType } = body;

  await mongo.bettingApp.model(mongo.models.bankDetails).insertOne({
    document: {
      userId,
      type,
      name,
      accountNo,
      ifscCode,
      holderName,
      paymentType,
    },
  });

  const data = { msg: "add method successfully!" };

  return data;
}

module.exports = {
  payload,
  handler,
  auth: true,
};
