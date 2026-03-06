const joi = require("joi");
const httpStatus = require("http-status");

const mongo = require("../../../config/mongodb");
const ApiError = require("../../../utils/ApiError");
const CUSTOM_MESSAGE = require("../../../utils/message");
const { USER_LEVEL_NEW } = require("../../../constants");

const payload = {
  body: joi.object().keys({
    user_name: joi.string().required(),
    password: joi.string().min(8).required(),
    email: joi.string().optional().email(),
    mobileNumber: joi.string().optional(),
    commission: joi.number().optional(),
    agent_level: joi
      .string()
      // .valid("COM", "AD", "SP", "SMDL", "MDL", "DL")
      .valid(
        USER_LEVEL_NEW.COM,
        USER_LEVEL_NEW.SUO,
        USER_LEVEL_NEW.WL,
        USER_LEVEL_NEW.SP,
        USER_LEVEL_NEW.AD,
        USER_LEVEL_NEW.SUA,
        USER_LEVEL_NEW.SS,
        USER_LEVEL_NEW.S,
        USER_LEVEL_NEW.M
      )
      .required(),
  }),
};

async function handler({ body }) {
  let { email, password, mobileNumber, user_name, commission, agent_level } =
    body;

  // Find admin data
  let oldUser = await mongo.bettingApp.model(mongo.models.admins).findOne({
    query: {
      user_name,
    },
    select: { _id: 1 },
  });
  if (oldUser) {
    // Check for above admin data
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      CUSTOM_MESSAGE.ACCOUNT_ALREADY_EXISTS
    );
  }

  // Insert new record
  let newUser = await mongo.bettingApp.model(mongo.models.admins).insertOne({
    document: {
      email,
      mobileNumber,
      password,
      commission,
      agent_level,
      user_name,
      newPassword: false,
    },
  });
  // return newUser;
  newUser.msg = "User register successfully.";
  return newUser; // Return response
}

module.exports = {
  payload,
  handler,
};
