const joi = require("joi");
const httpStatus = require("http-status");

const mongo = require("../../../../config/mongodb");
const { TRANSACTION_METHOD } = require("../../../../constants");
const ApiError = require("../../../../utils/ApiError");
const CUSTOM_MESSAGE = require("../../../../utils/message");

const payload = {
  body: joi.object().keys({
    id: joi.string().required(),
  }),
};

async function handler({ body, user }) {
  const { id } = body;
  const { userId } = user;

  const bankDetailsData = await mongo.bettingApp
    .model(mongo.models.bankDetails)
    .deleteOne({
      query: {
        _id: mongo.ObjectId(id),
        userId,
      },
    });

  console.log("bankDetailsData :: ", bankDetailsData);

  // if (!bankDetailsData) {
  //   throw new ApiError(httpStatus.BAD_REQUEST, CUSTOM_MESSAGE.RECORD_NOT_FOUND);
  // }
  const sendData = {
    msg: "delete method successfully!",
  };

  return sendData;
}

module.exports = {
  payload,
  handler,
  auth: true,
};
