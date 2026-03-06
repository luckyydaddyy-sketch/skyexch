const joi = require("joi");
const httpStatus = require("http-status");

const mongo = require("../../../config/mongodb");
const ApiError = require("../../../utils/ApiError");
const auth = require("../../../utils/auth");
const CUSTOM_MESSAGE = require("../../../utils/message");

const payload = {
  body: joi.object().keys({
    user_name: joi.string().optional(),
    nick_name: joi.string().optional(),
    bio: joi.string().optional(),
    fullName: joi.string().optional(),
    dob: joi.date().optional(),
    height: joi.number().optional(),
    weight: joi.number().optional(),
    occupation: joi.string().optional(),
    intereset: joi.array().optional(),
    gender: joi.string().optional(),
    facebook: joi.string().optional(),
    phoneNumber: joi.object().optional(),
    profilePic: joi.string().optional(),
  }),
};

async function handler({ body, user }) {
  let {
    user_name,
    nick_name,
    bio,
    fullName,
    dob,
    height,
    weight,
    occupation,
    intereset,
    gender,
    facebook,
    phoneNumber,
    profilePic
  } = body;
  let { userId } = user;

  console.log("up profile :: ", userId);
  console.log("up profile user_name :: ", user_name);
  let UserInfo = await mongo.bettingApp.model(mongo.models.users).findOne({
    // Find UserInfo data
    query: {
      _id: userId,
    },
  });

  if (!UserInfo)
    // Check for above User data
    throw new ApiError(httpStatus.BAD_REQUEST, CUSTOM_MESSAGE.USER_NOT_FOUND);

  let updateUser = await mongo.bettingApp.model(mongo.models.users).updateOne({
    // Update password
    query: {
      _id: userId,
    },
    update: {
      $set: {
        user_name,
        nick_name,
        bio,
        fullName,
        dob,
        height,
        weight,
        occupation,
        intereset,
        gender,
        facebook,
        phoneNumber,
        profilePic
      },
    },
    options: {
      new: true,
    },
  });

  UserInfo = await mongo.bettingApp.model(mongo.models.users).findOne({
    query: {
      _id: userId,
    },
  });
  const userLikes = await mongo.bettingApp
    .model(mongo.models.likes)
    .findOne({ query: { userId } });
  const likesCount =
    !userLikes || userLikes === null ? 0 : userLikes.likes.length;
  const likedCount =
    !userLikes || userLikes === null ? 0 : userLikes.liked.length;
  UserInfo.likes = likesCount;
  UserInfo.liked = likedCount;

  let sendData = UserInfo;

  sendData.msg = "Profile updated successfully.";
  return sendData; // Return response
}

module.exports = {
  payload,
  handler,
  auth: true,
};
