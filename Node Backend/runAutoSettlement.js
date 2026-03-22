const mongo = require("./config/mongodb");
const { initializeRedlock } = require("./config/redLock");
const { autoSettlement } = require("./controllers/cron/autoSettlementCron");

async function run() {
    console.log(new Date(), "Starting Automated Settlement Job...");
    initializeRedlock();
    await autoSettlement();
    console.log(new Date(), "Automated Settlement Job Finished.");
    process.exit(0);
}

run().catch(err => {
    console.error("Fatal error in Auto-Settlement Job:", err);
    process.exit(1);
});
