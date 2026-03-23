require('dotenv').config({path: './Node Backend/.env'});
const { MongoClient } = require('mongodb');

async function run() {
  const uri = process.env.DB_URL;
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('sky');
    const websites = db.collection('websites');
    const allSites = await websites.find({}, {projection: {title: 1, domain: 1}}).toArray();
    console.log("Registered Websites in DB:", allSites);
  } finally {
    await client.close();
  }
}
run().catch(console.dir);
