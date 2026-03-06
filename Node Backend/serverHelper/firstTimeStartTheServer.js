const initIndex = require("../defult/createIndex");
const createDefaultData = require("./createDefaultData");

const createIndexForFirstTime = async () => {
  await createDefaultData();
  await initIndex();
};

createIndexForFirstTime();
