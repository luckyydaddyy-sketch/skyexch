const mongo = require("../config/mongodb");
const { autoSettlementJob } = require("../controllers/cron/autoSettlementCron");
const { settleMatch } = require("../services/settlementService");
const { initializeRedlock } = require("../config/redLock");

async function runTest() {
  // Wait for Redis to be ready (if enabled)
  const config = require("../config/config");
  if (config.REDIS_IS_ON) {
    console.log("Waiting for Redis connection...");
    const redis = require("../config/redis");
    await new Promise(resolve => {
        if (redis.client.isReady) return resolve();
        redis.client.once('ready', resolve);
    });
  }

  // Initialize redlock
  initializeRedlock();

  // Wait for DB to be ready
  console.log("Waiting for MongoDB connection...");
  await new Promise(resolve => {
    if (mongo.bettingApp.db.readyState === 1) return resolve();
    mongo.bettingApp.db.once('open', resolve);
  });

  console.log("Starting Auto-Settlement Test...");

  try {
    // 0. Create a dummy admin (COM level)
    const adminId = new mongo.ObjectId();
    const testAdminUsername = "testadmin_" + Math.floor(Math.random() * 1000000);
    await mongo.bettingApp.model(mongo.models.admins).insertOne({
      document: {
        _id: adminId,
        user_name: testAdminUsername,
        password: "hashed_password_123",
        agent_level: "O",
        balance: 10000,
        remaining_balance: 10000
      }
    });

    // 0.1 Create a dummy user linked to the admin
    const userId = new mongo.ObjectId();
    const testUsername = "testuser_" + Math.floor(Math.random() * 1000000);
    await mongo.bettingApp.model(mongo.models.users).insertOne({
      document: {
        _id: userId,
        user_name: testUsername,
        password: "hashed_password_123",
        commission: 2,
        balance: 1000,
        remaining_balance: 1000,
        exposure: 0,
        admin: adminId,
        whoAdd: [adminId]
      }
    });

    // 1. Create a dummy match with a unique ID
    const matchId = new mongo.ObjectId();
    const marketId = "test_market_" + Date.now();
    const teamA = "Test Team A";
    const teamB = "Test Team B";
    console.log("Testing with matchId:", matchId.toString());
    
    await mongo.bettingApp.model(mongo.models.sports).insertOne({
      document: {
        _id: matchId,
        name: `${teamA} v ${teamB}`,
        openDate: new Date().toISOString(),
        startDate: new Date(),
        type: "cricket",
        gameId: Math.floor(Math.random() * 1000000),
        marketId: marketId,
        activeStatus: { status: true, bookmaker: true, fancy: true, premium: true },
        gameStatus: "pending"
      }
    });

    // 2. Create a dummy bet
    await mongo.bettingApp.model(mongo.models.betsHistory).insertOne({
      document: {
        userId: userId,
        matchId: matchId,
        type: "cricket",
        betType: "odds",
        betSide: "back",
        selection: teamA,
        winnerSelection: [teamA, teamB, "draw"],
        stake: 100,
        oddsUp: 2,
        oddsDown: 0,
        profit: 100,
        exposure: 100,
        betStatus: "pending",
        betPlaced: Date.now()
      }
    });

    console.log("Test data created.");

    // 3. Trigger settlement service
    console.log("Triggering settlement service for winner: Test Team A");
    await settleMatch(matchId, "Test Team A", "auto", "SYSTEM");

    // 4. Verify results
    const updatedMatch = await mongo.bettingApp.model(mongo.models.sports).findOne({ query: { _id: matchId } });
    const updatedBet = await mongo.bettingApp.model(mongo.models.betsHistory).findOne({ query: { matchId: matchId } });

    console.log("Verification Results:");
    if (updatedMatch) {
      console.log("- Match Status:", updatedMatch.gameStatus);
      console.log("- Match Winner:", updatedMatch.winner);
    } else {
      console.log("- Match NOT FOUND in DB!");
    }

    if (updatedBet) {
      console.log("- Bet Status:", updatedBet.betStatus);
      console.log("- Bet Result (tType):", updatedBet.tType);
      console.log("- Settlement Type:", updatedBet.settlementType);
    } else {
      console.log("- Bet NOT FOUND in DB!");
    }

    if (updatedMatch && updatedMatch.gameStatus === "completed" && updatedBet && updatedBet.tType === "win") {
      console.log("✅ TEST PASSED");
    } else {
      console.log("❌ TEST FAILED");
    }

  } catch (error) {
    console.error("Test Execution Error:", error);
  } finally {
    process.exit(0);
  }
}

runTest();
