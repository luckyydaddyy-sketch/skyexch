// const Redlock = require('redlock')
const { default: Redlock } = require("redlock");
// import Redlock from "redlock";
const Client = require("ioredis");
const config = require("./config");

let redlock = null;

const { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD, REDIS_DB, REDIS_IS_ON } =
  config;

let redisA;

if (REDIS_IS_ON)
  redisA = new Client({
    host: REDIS_HOST,
    port: REDIS_PORT,
    password: REDIS_PASSWORD,
    db: REDIS_DB,
    reconnectOnError(err) {
      const targetError = "READONLY";
      console.log("io redis: reconnectOnError: ", err);
      
      if (err.message.includes(targetError)) {
        // Only reconnect when the error contains "READONLY"
        return true; // or `return 1;`
      }
    },
  });

function registerRedlockError() {
  redlock.on("CATCH_ERROR : RedLock : error :: ", console.error);
}

function initializeRedlock() {
  if (!REDIS_IS_ON) return redlock;
  if (redlock) return redlock;
  try {
    console.log("redlock is setup");

    redlock = new Redlock([redisA], {
      // The expected clock drift; for more details see:
      driftFactor: 0.01, // multiplied by lock ttl to determine drift time
      // ∞ retries
      retryCount: -1,
      // the time in ms between attempts
      retryDelay: 25, // time in ms
      // the max time in ms randomly added to retries
      // to improve performance under high contention
      retryJitter: 20, // time in ms
      // The minimum remaining time on a lock before an extension is automatically
      // attempted with the using API.
      automaticExtensionThreshold: 500, // time in ms
    });
  } catch (error) {
    console.error("error in red lock: ", error);
  }
  registerRedlockError();
  return redlock;
}
const exportObject = {
  initializeRedlock,
  getRedLock: () => redlock,
};

module.exports = exportObject;
