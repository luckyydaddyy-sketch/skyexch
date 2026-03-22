const httpStatus = require("http-status");
const joi = require("joi");
const mongo = require("../../../../config/mongodb");
const ApiError = require("../../../../utils/ApiError");
const { settleMatch } = require("../../../../services/settlementService");
const CUSTOM_MESSAGE = require("../../../../utils/message");

const payload = {
  body: joi.object().keys({
    id: joi.string().required(),
    winner: joi.string().required(), // name of team
  }),
};

/**
 * Handle manual winner declaration for match odds and bookmaker.
 */
async function handler({ body, user }) {
  const { id, winner } = body;
  const adminId = user ? user.id : "Admin";

  try {
    const result = await settleMatch(id, winner, "manual", adminId);
    return { msg: "Winner declared successfully!" };
  } catch (error) {
    console.error("declareWinner : error : ", error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to declare winner.");
  }
}

module.exports = {
  payload,
  handler,
  auth: true,
};
