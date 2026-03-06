const httpStatus = require("http-status");

const pick = require("../utils/pick");
const joiValidate = require("../utils/joiValidate");
const ApiError = require("../utils/ApiError");
const auth = require("../utils/auth");
const config = require("../config/config");
// const crypto = require("crypto");
const { ObjectId } = require("../config/mongodb");
const CryptoJS = require("crypto-js");
// const cryptLib = require("@skavinvarnan/cryptlib");

const handleAPICall = (controller) => async (req, res, next) => {
  try {
    console.log(new Date(), `call Routes : ${req.originalUrl} body:`,req.body, ' query: ', req.query);
    // console.log(new Date(), "call Routes : body: ", req.body);
    // console.log(new Date(), "call Routes : query: ", req.query);
    var ip;
    if (req.headers["x-forwarded-for"]) {
      // console.log('req.headers["x-forwarded-for"] :: ',req.headers["x-forwarded-for"]);
      ip = req.headers["x-forwarded-for"].split(",")[0];
    } else if (req.connection && req.connection.remoteAddress) {
      // console.log("req.connection.remoteAddress :: ",req.connection.remoteAddress);
      ip = req.connection.remoteAddress;
    } else {
      // console.log("req.ip :: ",req.ip);
      ip = req.ip;
    }

    if (controller.auth) {
      await auth.authMiddleware(req, res, next);
    }
    if (controller.payload) {
      const validSchema = pick(controller.payload, ["params", "query", "body"]);
      const object = pick(req, Object.keys(validSchema));

      const { value, error, errorMessage } = joiValidate(validSchema, object);
      let stack = "";
      if (error && error.details[0].type === "string.email") {
        stack = "email";
      }
      if (error)
        return next(new ApiError(httpStatus.BAD_REQUEST, errorMessage, stack));
    }
    if (controller.handler) {
      if (!controller.auth && typeof req.headers["authorization"] !== 'undefined' && req.headers["authorization"] !== 'undefined') {
        console.log("hello");
        
        let authToken = await auth.decodeHeader(req);
        console.log("authToken:: ", authToken);

        if (authToken) {
          req.user = { userId: authToken.userId, role: authToken.role };
        }
      }
      req.user = req?.user || {};

      const origin = req.headers["origin"];
      // console.log("origin : req.headers : ", req.headers);
      console.log("origin : origin : ", origin);
      req.user.domain = "";
      // if(origin !== "localhost"){
      if (origin && origin.includes("https")) {
        req.user.domain = origin.split("https://")[1];
      } else if (origin && origin.includes("http")) {
        req.user.domain = origin.split("http://")[1];
      }
      // }

      req.user.requestIP = ip;
      let response = await controller.handler(req, res);
      // console.log("response:: ", response);

      let sendData = {
        statusCode: 200,
        message: "success",
        data: response,
      };
      if (response?.msg) {
        sendData.message = response.msg;
        delete sendData.data.msg;
        // delete response;
      }
      res.send(sendData);
    } else {
      next();
    }
  } catch (err) {
    console.log("err.toString() : ", err);
    next(
      err instanceof ApiError
        ? err
        : new ApiError(httpStatus.BAD_REQUEST, err.toString())
    );
  }
};

module.exports = handleAPICall;
