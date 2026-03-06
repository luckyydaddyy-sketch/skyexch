const mongo = require("./config/mongodb");
const { setSportsData } = require("./controllers/cron/setSportsData");

async function manualRun() {
    await setSportsData();
    console.log("Sports data fetch finished");
    process.exit(0);
}

manualRun().catch(console.error);
