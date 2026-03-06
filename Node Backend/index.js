const https = require("https");
const http = require("http");
const fs = require("graceful-fs");
const path = require("path");

require("./eventHandler");
const app = require("./app");
const config = require("./config/config");
const socket = require("./config/socket");
require("./config/redis");
const {initializeRedlock} = require("./config/redLock")

initializeRedlock();

let server;
if (
  typeof config.KEY_FILE !== "undefined" &&
  typeof config.CRT_FILE !== "undefined" &&
  config.KEY_FILE !== "" &&
  config.CRT_FILE !== "" &&
  fs.existsSync(config.KEY_FILE) &&
  fs.existsSync(config.CRT_FILE)
) {
  // creating https secure socket server
  let options = {
    key: fs.readFileSync(config.KEY_FILE),
    cert: fs.readFileSync(config.CRT_FILE),
  };
  console.log(new Date(), "creating https app");
  server = https.createServer(options, app);
} else {
  server = http.createServer(app);
}
console.log(new Date(),"config :: ", config.SPORTS_API_PORT);

socket.init(server);
server.listen(config.port, function () {
  console.log(new Date(), `Server listening to the port ${config.port}`);
});
