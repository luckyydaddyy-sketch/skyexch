var CronJob = require("cron").CronJob;
const express = require("express");
const router = express.Router();
const { setSportsData } = require("../../controllers/cron/setSportsData");
const config = require("../../config/config");
const { getChannelIds } = require("../../config/sportsAPI");
const setBetTotalAmountMonthWise = require("../../controllers/cron/setBetTotalAmountMonthWise");
const setBetTotalAmountOfLastDay = require("../../controllers/cron/setBetTotalAmountOfLastDay");

var job = new CronJob(
  "*/5 * * * *",
  function () {
    console.log("is start");
    setSportsData();
  },
  null,
  true,
  "America/Los_Angeles"
);
var jobForChennalData = new CronJob(
  "0/20 * * * *",
  function () {
    console.log("is start");
    getChannelIds();
  },
  null,
  true,
  "America/Los_Angeles"
);
// // Use this if the 4th param is default value(false)

// every day at 4 AM
const dayCronSport = new CronJob(
  "0 4 * * *",
  function () {
    console.log("is start");
    setBetTotalAmountOfLastDay();
  },
  null,
  true,
  "Asia/Dhaka"
);

// every month 1st day at 5 AM
const monthCronSport = new CronJob(
  "0 5 1 * *",
  function () {
    console.log("is start");
    setBetTotalAmountMonthWise();
  },
  null,
  true,
  "Asia/Dhaka"
);

if (config.env !== "test") {
  getChannelIds();
  jobForChennalData.start();
  // setSportsData();
  job.start();
  dayCronSport.start();
  monthCronSport.start();
  console.log("start");
  
}



router.get("/setSportsData", (req, res) => {
  console.log("test call ------->");
  setSportsData();
  res.send(req.originalUrl);
});

router.get("/runMonthCron", async (req, res) => {
  console.log("test call ------->");
  await setBetTotalAmountMonthWise(req?.query?.date);
  res.send("cron is finish");
});
router.get("/runDayCron", async (req, res) => {
  console.log("test call ------->");
  await setBetTotalAmountOfLastDay();
  res.send("cron is finish");
});

module.exports = router;
