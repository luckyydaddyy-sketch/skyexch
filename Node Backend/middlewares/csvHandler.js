const httpStatus = require('http-status');
const _ = require('underscore');

const pick = require('../utils/pick');
const joiValidate = require('../utils/joiValidate');
const ApiError = require('../utils/ApiError');
const auth = require('../utils/auth');

const handleCSVCall = (controller) => async (req, res, next) => {
	try {


		if ((controller.auth) && req.headers['authorization']) {
			let authToken = await auth.decodeHeader(req)
			if (authToken)
				req.user.userId = req.user.userId
		}
		if (controller.csvPayload) {
			const validSchema = pick(controller.csvPayload, ['params', 'query', 'body']);
			const object = pick(req, Object.keys(validSchema));

			const { value, error, errorMessage } = joiValidate(validSchema, object);

			if (_.isEmpty(req.query) == true) {
				if (error) return next(new ApiError(httpStatus.BAD_REQUEST, errorMessage));
			}
			// Object.assign(req, value);
		}

		if (controller.csvHandler) {
			await controller.csvHandler(req, res);
		}


	} catch (err) {
		next(err instanceof ApiError ? err : new ApiError(httpStatus.BAD_REQUEST, err.toString()));
	}
}

module.exports = handleCSVCall;