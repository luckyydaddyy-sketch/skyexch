const joi = require('joi');
const httpStatus = require('http-status');
var randomstring = require("randomstring");


const mongo = require('../../../config/mongodb');
const ApiError = require('../../../utils/ApiError');
const auth = require('../../../utils/auth');
const CUSTOM_MESSAGE = require('../../../utils/message');

const payload = {
    body: joi.object().keys({
        token: joi.string().required()
    })
};

async function handler({
    body
}) {
    let { token } = body;

    let tokenInfo = await mongo.bettingApp.model(mongo.models.tokens).findOne({ // Find token
        query: {
            rand: token
        }
    })
    if (!tokenInfo) // Check for above token data
        throw new ApiError(httpStatus.BAD_REQUEST, CUSTOM_MESSAGE.LINK_EXPIRE)

    let verifyToken = await auth.resetPasswordVerify(tokenInfo); // call reset password veryfy function 
    if (!verifyToken) { // Check for veryfy token
        throw new ApiError(httpStatus.BAD_REQUEST, CUSTOM_MESSAGE.LINK_EXPIRE)
    }
    let resData = {
        token: tokenInfo.token,
        userId: tokenInfo.userId,
        msg: "Token verifed."
    }
    return resData; // Return response
}

module.exports = {
    payload,
    handler,
    auth: false
}