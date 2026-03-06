const httpStatus = require('http-status');
const config = require('../config/config');
const ApiError = require('../utils/ApiError');

const notFoundError = (req, res, next) => {
    next(new ApiError(httpStatus.NOT_FOUND));
}

const errorHandler = (error, req, res, next) => {
    if (!(error instanceof ApiError)) {
        const statusCode =
            error.statusCode || error instanceof mongoose.Error ? httpStatus.BAD_REQUEST : httpStatus.INTERNAL_SERVER_ERROR;
        const message = error.message || httpStatus[statusCode];
        error = new ApiError(statusCode, message, error.stack);
    }
    let {
        statusCode,
        message,
        stack
    } = error;
    
    statusCode = !httpStatus[statusCode] ? httpStatus.BAD_REQUEST : statusCode;
    message = message || httpStatus[statusCode];

    res.status(statusCode).json({
        statusCode,
        message,
        ...(config.env === 'test' && {
            stack: stack
        }),
    });
}

module.exports = {
    errorHandler,
    notFoundError
}