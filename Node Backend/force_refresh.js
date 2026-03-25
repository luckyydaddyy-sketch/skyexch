const redis = require('./config/redis');
const dotenv = require('dotenv');
const path = require('path');

async function forceRefresh() {
  dotenv.config({ path: path.join(__dirname, '.env') });
  const config = require('./config/config');
  
  if (!redis.client.isOpen) {
      await redis.client.connect();
  }

  console.log('Force setting imOnline flag...');
  await redis.setValueInKeyWithExpiry(`${config.ONLINE_PLAYER}`, {
    date: new Date(),
  }, 3600); // 1 hour

  console.log('Checking sport_list_cricket before wait...');
  const before = await redis.getValueFromKey('sport_list_cricket');
  console.log('Before:', Array.isArray(before) ? before.length : 'null');

  console.log('Waiting 5 seconds for background loop to run...');
  await new Promise(resolve => setTimeout(resolve, 5000));

  console.log('Checking sport_list_cricket after wait...');
  const after = await redis.getValueFromKey('sport_list_cricket');
  console.log('After:', Array.isArray(after) ? after.length : 'null');

  process.exit();
}

forceRefresh();
