const httpStatus = require("http-status");
const jwt = require("jsonwebtoken");
const moment = require("moment");
const config = require("../config/config");
const mongo = require("../config/mongodb");
const ApiError = require("./ApiError");
const CUSTOM_MESSAGE = require("./message");

function sign(payload, option) {
  return new Promise((resolve) => {
    let sercurData = {
      userId: payload._id,
      email: payload.email,
      type: payload.tokenType,
      role: payload.agent_level,
    };
    if (payload.rand) {
      sercurData.rand = payload.rand;
    }

    jwt.sign(sercurData, config.jwt.secret, option, (error, token) => {
      resolve({ error, token });
    });
  });
}
const generateToken = async (payload, option, type) => {
  payload.tokenType = type;
  const tokens = await sign(payload, option);
  const accessTokenExpires = moment().add(
    config.jwt.accessExpirationMinutes,
    "minutes"
  );
  const tokenInfo = await saveToken(
    tokens.token,
    payload._id,
    accessTokenExpires,
    payload
  );

  return tokenInfo._id.toString();
};
const generateTokenForUsers = async (payload, option, type) => {
  payload.tokenType = payload.type; //type;
  const tokens = await sign(payload, option);
  //   const accessTokenExpires = moment().add(100000000, "minutes");
  const accessTokenExpires = moment().add(
    config.jwt.accessExpirationMinutes,
    "minutes"
  );
  // remove all token befor new token store
  await mongo.deleteMany({
    db: mongo.masterDb(),
    model: mongo.models.tokens,
    query: { userId: payload._id },
  });
  const tokenInfo = await saveToken(
    tokens.token,
    payload._id,
    accessTokenExpires,
    payload
  );
  return tokenInfo._id.toString();
};

const saveToken = async (token, userId, expires, payload) => {
  let updateData = {
    userId: userId,
    token: token,
    expires: expires,
    type: payload.tokenType,
  };
  if (payload.rand) {
    updateData.rand = payload.rand;
  }
  let tokenDoc;
  if (payload.type == "access") {
    tokenDoc = await mongo.insertOne({
      db: mongo.masterDb(),
      model: mongo.models.tokens,
      document: updateData,
    });
  } else {
    tokenDoc = await mongo.findOneAndUpdate({
      db: mongo.masterDb(),
      model: mongo.models.tokens,
      query: {
        userId: userId,
        type: payload.type,
      },
      update: updateData,
      options: {
        upsert: true,
        new: true,
      },
    });
  }
  return tokenDoc;
};

function verify(token) {
  return new Promise((resolve) => {
    jwt.verify(token, config.jwt.secret, (error, decoded) => {
      resolve({ error, decoded });
    });
  });
}

async function authMiddleware(req, res, next) {
  let authToken = req.headers["authorization"]
    ? req.headers["authorization"].replace("Bearer ", "")
    : null;
  if (!authToken) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Unauthorized1");
  }
  // fix _id issue
  if (authToken.length < 26 && authToken.length >= 24) {
    let gettokenFormDb = await mongo.bettingApp
      .model(mongo.models.tokens)
      .findOne({
        query: { _id: mongo.ObjectId(authToken) },
        select: { token: 1 },
      });

    if (!gettokenFormDb)
      throw new ApiError(httpStatus.UNAUTHORIZED, "Unauthorized5");
    authToken = gettokenFormDb.token;
  }
  var { decoded, error } = await verify(authToken, config.jwt.secret);
  if (
    error ||
    !decoded ||
    !decoded.exp ||
    new Date(decoded.exp * 1000).getTime() < new Date().getTime()
  ) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Unauthorized2");
  }
  // console.log("::: decoded :: ");
  // console.log(decoded);
  // console.log(" :: authToken :::: ");
  // console.log(authToken);
  let tokenDoc = await mongo.findOne({
    db: mongo.masterDb(),
    model: mongo.models.tokens,
    query: {
      userId: decoded.userId,
      type: decoded.type,
      token: authToken,
    },
  });
  if (!tokenDoc) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Unauthorized3");
  }
  if (new Date(tokenDoc.expires).getTime() < new Date().getTime()) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Unauthorized4");
  }

  console.log(decoded);
  req.user = {
    userId: decoded.userId,
    email: decoded.email,
    role: decoded.role,
  };
  if (decoded.gameId) {
    req.user.gameId = decoded.gameId;
  }
}
const resetPasswordVerify = async (payload) => {
  var { decoded, error } = await verify(payload.token, config.jwt.secret);

  if (
    error ||
    !decoded ||
    !decoded.exp ||
    new Date(decoded.exp * 1000).getTime() < new Date().getTime()
  ) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Unauthorized2");
  }
  let query = {
    userId: decoded.userId,
    type: decoded.type,
    token: payload.token,
  };
  let tokenDoc = await mongo.findOne({
    db: mongo.masterDb(),
    model: mongo.models.tokens,
    query: query,
  });
  if (!tokenDoc) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Link expired.");
  }

  if (new Date(tokenDoc.expires).getTime() < new Date().getTime()) {
    await mongo.deleteOne({
      db: mongo.masterDb(),
      model: mongo.models.tokens,
      query: query,
    });
    throw new ApiError(httpStatus.BAD_REQUEST, "Link expired.");
  }
  let user = {
    userId: decoded.userId,
    email: decoded.email,
    id: decoded._id,
  };
  return user;
};

async function decodeHeader(req) {
  let authToken = req.headers["authorization"]
    ? req.headers["authorization"].replace("Bearer ", "")
    : null;

  const gettokenFormDb = await mongo.bettingApp
    .model(mongo.models.tokens)
    .findOne({
      query: { _id: mongo.ObjectId(authToken) },
      select: { token: 1 },
    });

  if (gettokenFormDb) {
    authToken = gettokenFormDb.token;
  }
  var { decoded, error } = await verify(authToken, config.jwt.secret);
  if (decoded && decoded.is_Block) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      CUSTOM_MESSAGE.SDK_USER_YOU_BLOCKED_BY_SUPERADMIN
    );
  }

  if (decoded) {
    return {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.agent_level,
    };
  }
  return {};
}

async function passwordValidation(password) {
  if (password.length >= 8) {
    if (!/[A-Z]/.test(password))
      return { flag: true, msg: "At least one upper case letter required" };
    if (!/[a-z]/.test(password))
      return { flag: true, msg: "At least one lower case letter required" };
    if (!/\d/.test(password))
      return { flag: true, msg: "At least one numeric value required" };
    if (!/[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/.test(password))
      return {
        flag: true,
        msg: "At least one special character (eg. &@*#!) required",
      };

    return { flag: false, msg: "" };
  } else {
    return {
      flag: true,
      msg: "Password length must be greater than or equal to 8",
    };
  }
}

async function originMaintenance(req, res, next) {
  let origin = req.headers["Origin"];
  let domain = "";
  if (origin.includes("https")) {
    domain = origin.split("https://")[1];
  } else if (origin.includes("http")) {
    domain = origin.split("http://")[1];
  }

  const siteQuery = {};
  if (domain && domain !== "localhost") {
    siteQuery.domain = domain;
  }

  const siteInfo = await mongo.bettingApp.model(mongo.models.websites).findOne({
    query: siteQuery,
    select: {
      isMaintenance: 1,
    },
  });

  if (siteInfo && siteInfo?.isMaintenance) {
    throw new ApiError(httpStatus.SERVICE_UNAVAILABLE, "isMaintenance");
  }
}
module.exports = {
  generateToken,
  verify,
  authMiddleware,
  resetPasswordVerify,
  generateTokenForUsers,
  decodeHeader,
  passwordValidation,
};
