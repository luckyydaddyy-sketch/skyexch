const joi   = require('joi');
const config = require('../../config/config');

const payload = {
    body: joi.object().keys({
    })
};

async function handler({
    body
}) {

    var sendData  = {
        S3_BASE_URL : config.s3.basedUrl
    }

    return sendData; // Return response
}

module.exports = {
    payload,
    handler,
    auth:true
}