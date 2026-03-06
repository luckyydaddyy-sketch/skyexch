const joi = require("joi");
const httpStatus = require("http-status");

const mongo = require("../../../../config/mongodb");
const ApiError = require("../../../../utils/ApiError");
const CUSTOM_MESSAGE = require("../../../../utils/message");

const payload = {
  body: joi.object().keys({
    id: joi.string().required(),
    password: joi.string().min(8).required(), // user pass for verifiy
    status: joi.string().valid("active", "suspend", "locked").optional(),
    newPassword: joi.string().min(8).optional(), // user new pass
    confirmPassword: joi.string().min(8).optional(), // user pass
    domain: joi.array().items(joi.string()).optional(),
  }),
};

async function handler({ body, user }) {
  const { userId } = user;
  const { id, status, password, newPassword, confirmPassword, domain } = body;

  const query = {
    _id: id,
  };
  const adminInfo = await mongo.bettingApp.model(mongo.models.admins).findOne({
    query: {
      _id: userId,
      password,
    },
  });

  if (!adminInfo)
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      CUSTOM_MESSAGE.PASSWORD_INCORRECT
    );

  if (domain && domain.length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, CUSTOM_MESSAGE.SELECT_DOMAIN);
  }

  if (
    typeof newPassword !== "undefined" &&
    typeof confirmPassword !== "undefined" &&
    newPassword !== confirmPassword
  )
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      CUSTOM_MESSAGE.NEW_PASSWOR_NOT_MATCH
    );

  const userInfo = await mongo.bettingApp.model(mongo.models.admins).findOne({
    query,
  });

  if (!userInfo)
    throw new ApiError(httpStatus.BAD_REQUEST, CUSTOM_MESSAGE.USER_NOT_FOUND);

  let updateQuery = {
    _id: id,
  };

  const update = {
    status,
  };
  console.log(
    "update :: typeof newPassword !== undefined ",
    typeof newPassword !== "undefined"
  );
  console.log("update :newPassword: ", newPassword);
  if (typeof newPassword !== "undefined") {
    update.password = newPassword.trim();
  }

  if (typeof newPassword === "undefined" && typeof status !== "undefined") {
    updateQuery = {
      $or: [
        { _id: id },
        {
          whoAdd: mongo.ObjectId(id),
        },
      ],
    };
  }
  if (domain && domain.length > 0) {
    update.domain = domain;
  }
  console.log("update :: ", update);
  await mongo.bettingApp.model(mongo.models.admins).updateMany({
    query: updateQuery,
    update,
  });
  if (typeof newPassword === "undefined" && typeof status !== "undefined")
    await mongo.bettingApp.model(mongo.models.users).updateMany({
      query: updateQuery,
      update,
    });

  userInfo.status = status;
  userInfo.msg = "Agent Status Update!";
  if (typeof newPassword !== "undefined")
    userInfo.msg = CUSTOM_MESSAGE.PASSWORD_CHANGE_SUCESSFULLY;
  return userInfo;
}

module.exports = {
  payload,
  handler,
  auth: true,
};
