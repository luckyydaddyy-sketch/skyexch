const joi = require('joi');
const httpStatus = require('http-status');

const mongo = require('../../../config/mongodb');
const ApiError = require('../../../utils/ApiError');
const CUSTOM_MESSAGE = require('../../../utils/message');

const payload = {
    body: joi.object().keys({
    }),
};

async function handler({
    body, user
}) {
    let { userId } = user
    let adminData = await mongo.bettingApp.model(mongo.models.admins).findOne({ // Find developer data by developerId
        query: {
            _id: userId
        },
        select: {
            password: 0
        }
    })
    if (!adminData || adminData == null) { //Check for above developer record
        throw new ApiError(httpStatus.BAD_REQUEST, CUSTOM_MESSAGE.ACCOUNT_ALREADY_EXISTS)
    }
    if (adminData.url && adminData.url.main && adminData.url.thumb) {
    } else {
        adminData.url = { main: "", thumb: "" }
    }
    adminData.msg = "Profile info get."
    return adminData;// Return response 
}

module.exports = {
    payload,
    handler,
    auth: true
}