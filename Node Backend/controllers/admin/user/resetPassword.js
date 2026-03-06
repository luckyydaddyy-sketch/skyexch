const joi = require('joi');
const httpStatus = require('http-status');

const mongo = require('../../../config/mongodb');
const ApiError = require('../../../utils/ApiError');
const auth = require('../../../utils/auth');
const CUSTOM_MESSAGE = require('../../../utils/message');

const payload = {
    body: joi.object().keys({
        newPassword: joi.string().required(),
        conformPassword: joi.string().required(),
    })
};

async function handler({
    body, user
}) {
    let { newPassword, conformPassword } = body;
    let { userId } = user;

    let UserInfo = await mongo.bettingApp.model(mongo.models.admins).findOne({ // Find admin data
        query: {
            _id: userId
        }
    })

    if (!UserInfo) // Check for above admin data
        throw new ApiError(httpStatus.BAD_REQUEST, CUSTOM_MESSAGE.USER_NOT_FOUND)
    if (newPassword != conformPassword) // Compair password
        throw new ApiError(httpStatus.BAD_REQUEST, CUSTOM_MESSAGE.NEW_PASSWOR_NOT_MATCH)

    let updateRes = await mongo.bettingApp.model(mongo.models.admins).updateOne({ // update admin data
        query: {
            _id: userId
        },
        update: {
            password: newPassword
        },
        options: {
            new: true
        }
    })

    let sendData = {
        userId: userId
    }
    sendData.msg = "Reset password successfully.";
    return sendData; // Return response
}

module.exports = {
    payload,
    handler,
    auth: true
}