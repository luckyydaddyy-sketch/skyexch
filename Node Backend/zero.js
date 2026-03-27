const { MongoClient } = require('mongodb');
const config = require('./config/config');

async function run() {
  const client = new MongoClient(config.mongoose.url);
  try {
    await client.connect();
    const db = client.db(config.mongoose.master_db);
    const users = db.collection('users');
    
    const user = await users.findOne({ user_name: 'testpl9' });
    if (user) {
      console.log(`Current testpl9 balance: ${user.casinoUserBalance}`);
      const result = await users.updateOne(
        { user_name: 'testpl9' },
        { $set: { casinoUserBalance: 0, casinoWinLimit: 0, balance: 0 } }
      );
      console.log("Updated testpl9 balance to 0.", result);
    } else {
      console.log("User testpl9 not found.");
    }
  } finally {
    await client.close();
  }
}
run().catch(console.dir);
