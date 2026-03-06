const moment = require("moment-timezone");

function getDateOld(type) {
  // const timeInIST = moment().tz('Asia/Dhaka')
  const today = new Date();
  let startDate = new Date();
  let endDate = new Date();
  if (type === "7") {
    startDate.setDate(today.getDate() - 7);
    endDate.setDate(today.getDate());
  } else if (type === "yesterday") {
    startDate.setDate(today.getDate() - 1);
    endDate.setDate(today.getDate() - 1);
  } else if (type === "tomorrow") {
    startDate.setDate(today.getDate() + 1);
    endDate.setDate(today.getDate() + 1);
  }
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);

  return { startDate, endDate };
}
function getDate(type, isTimeZone = false) {
  // const timeInIST = moment().tz('Asia/Kolkata')
  const today = moment().tz("Asia/Dhaka");
  let startDate = today.clone();
  let endDate = today.clone();
  if (type === "2") {
    startDate = today.clone().subtract(2, "days");
    endDate = today.clone();
  } else if (type === "7") {
    startDate = today.clone().subtract(7, "days");
    endDate = today.clone();
  } else if (type === "yesterday") {
    startDate = today.clone().subtract(1, "days");
    endDate = today.clone().subtract(1, "days");
  } else if (type === "tomorrow") {
    startDate = today.clone().add(1, "days");
    endDate = today.clone().add(1, "days");
  }
  startDate = startDate.startOf("day"); // 00:00:00
  endDate = endDate.endOf("day"); // 23:59:59

  if (isTimeZone) {
    startDate = startDate.hour(4).minute(0).second(0).millisecond(0);

    endDate = today.add(1, "days");
    endDate = endDate.hour(3).minute(59).second(59).millisecond(999);
  }
  return { startDate, endDate };
}

function getStartEndDateTime(startDate, endDate) {
  let startDateTemp = moment(new Date(startDate)).tz("Asia/Dhaka");
  let endDateTemp = moment(new Date(endDate)).tz("Asia/Dhaka");

  // startDateTemp = startDateTemp.startOf("day"); // 00:00:00
  // endDateTemp = endDateTemp.endOf("day"); // 23:59:59

  // startDateTemp = startDateTemp.setHours(4, 0, 0, 0);
  startDateTemp = startDateTemp
    .startOf("day")
    .hour(4)
    .minute(0)
    .second(0)
    .millisecond(0);
  endDateTemp = endDateTemp
    .endOf("day")
    .hour(3)
    .minute(59)
    .second(59)
    .millisecond(999);
  // endDateTemp = endDateTemp.setHours(3, 59, 59, 999);
  // if (
  //   moment(startDate).tz("Asia/Dhaka").format("DD/MM/YYYY") ===
  //   // moment(new Date()).tz("Asia/Dhaka").format("DD/MM/YYYY") ||
  //   moment(endDate).tz("Asia/Dhaka").format("DD/MM/YYYY")
  //   // === moment(new Date()).tz("Asia/Dhaka").format("DD/MM/YYYY")
  // ) {
  endDateTemp.add(1, "days");
  // }
  return { startDate: startDateTemp, endDate: endDateTemp };
}

function getMonthStartAndEndDate(date) {
  let startDate = moment(date).tz("Asia/Dhaka");
  startDate = startDate.startOf("month").toDate(); // Start of the month at 00:00:00.000
  startDate = startDate.setHours(4, 0, 0, 0);
  console.log("getMonthStartAndEndDate: startDate : ", startDate);
  let endDate = moment(date).tz("Asia/Dhaka"); // End of the month at 23:59:59.999
  endDate = endDate.endOf("month").toDate(); // End of the month at 23:59:59.999
  endDate = endDate.setHours(3, 59, 59, 999);
  console.log("getMonthStartAndEndDate: endDate : ", endDate);

  return { startDate, endDate };
}
function getMonthStartAndEndDateForTodayDate(date) {
  let startDate = moment(date).tz("Asia/Dhaka");
  startDate = startDate.startOf("month").toDate(); // Start of the month at 00:00:00.000
  startDate = startDate.setHours(4, 0, 0, 0);
  // startDate =
  console.log("getMonthStartAndEndDateForTodayDate: startDate : ", startDate);
  let endDate = moment(new Date()).tz("Asia/Dhaka"); // End of the month at 23:59:59.999
  endDate = endDate.endOf("month").toDate(); // End of the month at 23:59:59.999
  endDate = endDate.setHours(3, 59, 59, 999);
  console.log("getMonthStartAndEndDateForTodayDate: endDate : ", endDate);

  return { startDate, endDate };
}

function getDateFromStartDate(date) {
  let startDate = moment(date).tz("Asia/Dhaka");
  let endDate = moment().tz("Asia/Dhaka");

  startDate = startDate
    .startOf("day")
    .hour(4)
    .minute(0)
    .second(0)
    .millisecond(0);
  endDate = endDate.endOf("day").hour(3).minute(59).second(59).millisecond(999);
  endDate.add(1, "days");

  return { endDate, startDate };
}
module.exports = {
  getDate,
  getStartEndDateTime,
  getMonthStartAndEndDate,
  getMonthStartAndEndDateForTodayDate,
  getDateFromStartDate,
};
