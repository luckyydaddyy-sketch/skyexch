const joi = require("joi");
const httpStatus = require("http-status");
var randomstring = require("randomstring");

const mongo = require("../../../config/mongodb");
const ApiError = require("../../../utils/ApiError");
const auth = require("../../../utils/auth");
const CUSTOM_MESSAGE = require("../../../utils/message");

const payload = {
  body: joi.object().keys({
    search: joi.string().optional().allow(""),
    isBlock: joi.boolean().optional(),
    isDelete: joi.boolean().optional(),
  }),
};

async function handler({ body, user }) {
  const { search, isBlock, isDelete } = body;
  const { userId } = user;

  const query = { whoAdd: userId };
  if (search || search === "") {
    // query.user_name = { $regex: search, $options: "i" };
    query.user_name = search;
  }
  if (isBlock) {
    query.status = "locked";
  }
  if (isDelete) {
    query.status = "suspend";
  }

  const userList = await mongo.bettingApp.model(mongo.models.users).find({
    query: query,
    populate: {
      path: "whoAdd",
      model: await mongo.bettingApp.model(mongo.models.admins),
      select: ["agent_level", "user_name", "firstName"],
    },
  });

  if (typeof isBlock === "undefined" && (!userList || !userList.length)) {
    //Check for above developer record
    throw new ApiError(httpStatus.BAD_REQUEST, CUSTOM_MESSAGE.USER_NOT_FOUND);
  }
  let resData = {
    userList,
    msg: userList.length ? "User List By Downline." : "No User Found",
  };
  return resData; // Return response
}

module.exports = {
  payload,
  handler,
  auth: true,
};
