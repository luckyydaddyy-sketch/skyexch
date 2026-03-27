const { MongoClient } = require('mongodb');
const config = require('./config/config');

async function run() {
  const client = new MongoClient(config.mongoose.url);
  try {
    await client.connect();
    const db = client.db(config.mongoose.master_db);
    const users = db.collection('users');
    
    console.log("Setting testpl9 to 500000...");
    const result = await users.updateOne(
      { user_name: 'testpl9' },
      { $set: { casinoUserBalance: 500000, casinoWinLimit: 500000, balance: 500000 } }
    );
    console.log("Restored testpl9 balance.", result);
  } finally {
    await client.close();
  }
}
run().catch(console.dir);
