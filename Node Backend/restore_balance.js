const { MongoClient } = require('mongodb');
const config = require('./config/config');

async function run() {
  const client = new MongoClient(config.mongoose.url);
  try {
    await client.connect();
    const db = client.db(config.mongoose.master_db);
    const users = db.collection('users');
    
    // Check testpl10 as reference
    const user10 = await users.findOne({ user_name: 'testpl10' });
    if (user10) {
      console.log(`testpl10 balances -> balance: ${user10.balance}, casinoUserBalance: ${user10.casinoUserBalance}, casinoWinLimit: ${user10.casinoWinLimit}`);
      
      console.log("Setting testpl9 to match testpl10...");
      const result = await users.updateOne(
        { user_name: 'testpl9' },
        { $set: { 
            casinoUserBalance: user10.casinoUserBalance || 5000000, 
            casinoWinLimit: user10.casinoWinLimit || 5000000, 
            balance: user10.balance || 5000000 
          } 
        }
      );
      console.log("Restored testpl9 balance.", result);
    } else {
      console.log("testpl10 not found. Setting testpl9 to 5,000,000.");
      const result = await users.updateOne(
        { user_name: 'testpl9' },
        { $set: { casinoUserBalance: 5000000, casinoWinLimit: 5000000, balance: 5000000 } }
      );
      console.log("Restored testpl9 balance.", result);
    }
  } finally {
    await client.close();
  }
}
run().catch(console.dir);
