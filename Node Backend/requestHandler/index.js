const { EVENTS } = require("../constants");
const handler = require("./handler");
const logOut = require("../socketControllers/user/logOut");

function requestHandler(socket, body) {
  if (!socket) {
    console.log(new Error("socket instance not found"));
  }
  // console.log("====> body <==", body);
  if (typeof body !== "object") {
    body = JSON.parse(body);
  }
  // console.log("====> body <==", body);

  const event = body.en;
  let { data } = body;
  if (typeof data === "string") data = JSON.parse(data);
  switch (event) {
    case "test":
      console.log("connection Done");
      socket.emit("res", { en: "test", data: {} });
      break;
    case EVENTS.GET_SPORTS:
      handler.getSports(data, socket);
      break;
    case EVENTS.GET_SPORTS_DETAILS:
      handler.getSportsDetails(data, socket);
      break;
    case EVENTS.GET_USER_COUNT:
      handler.getUserCount(data, socket);
      break;
    case EVENTS.GET_LIVE_MATCH_COUNT:
      handler.getLiveMatchCount(data, socket);
      break;
    case EVENTS.GET_LIVE_MATCH_COUNT_FOR_VELKI:
      handler.getLiveMatchCountForVelki(data, socket);
      break;
    case EVENTS.SIGN_UP:
      handler.signupHelper(data, socket);
      break;
    case EVENTS.SIGN_UP_ADMIN:
      handler.signupAdminHelper(data, socket);
      break;
    case EVENTS.UPDATE_USER_BALANCE:
      handler.getUpdateBalanceHelper(data, socket);
      break;
    case EVENTS.VERIFY_TOKEN:
      handler.verifyTokenHelper(data, socket);
      break;
    case EVENTS.VERIFY_TOKEN_ADMIN:
      handler.verifyTokenAdminHelper(data, socket);
      break;
    case EVENTS.GET_SCORE_ID:
      handler.getScoreBoardIdHelper(data, socket);
      break;
    case EVENTS.DISCONNECT:
      logOut(data, socket);
      break;

    default:
      console.log("default connection Done", event, data);
      break;
  }
}

module.exports = requestHandler;
