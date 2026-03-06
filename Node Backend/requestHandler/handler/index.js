const getSportsDetails = require("./getSportsDetails");
const getSports = require("./getSports");
const getUserCount = require("./getUserCount");
const getLiveMatchCount = require("./getLiveMatchCount");
const getLiveMatchCountForVelki = require("./getLiveMatchCountForVelki");
const signupHelper = require("./signUp");
const signupAdminHelper = require("./signUpAdmin");
const getUpdateBalanceHelper = require("./getUpdateBalance");
const verifyTokenHelper = require("./verifyToken");
const verifyTokenAdminHelper = require("./verifyTokenAdmin");
const getScoreBoardIdHelper = require("./getScoreBoardId");

const exportObject = {
  getSportsDetails,
  getSports,
  getUserCount,
  getLiveMatchCount,
  signupHelper,
  getUpdateBalanceHelper,
  verifyTokenHelper,
  verifyTokenAdminHelper,
  getScoreBoardIdHelper,
  getLiveMatchCountForVelki,
  signupAdminHelper
};
module.exports = exportObject;
