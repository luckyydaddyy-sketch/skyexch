const mongo = require("../config/mongodb");

async function createIndexUsers() {
  await mongo.bettingApp.db.collection(mongo.models.users).createIndex({
    user_name: 1.0,
  });

  await mongo.bettingApp.db.collection(mongo.models.users).createIndex({
    _id: 1.0,
    status: 1.0,
    firstName: 1,
    lastName: 1,
    user_name: 1,
  });
  await mongo.bettingApp.db.collection(mongo.models.users).createIndex({
    _id: 1.0,
    status: 1.0,
  });
  await mongo.bettingApp.db.collection(mongo.models.users).createIndex({
    _id: 1.0,
    firstName: 1,
    lastName: 1,
    user_name: 1,
  });
}
async function createIndexAdmins() {
  await mongo.bettingApp.db.collection(mongo.models.admins).createIndex({
    _id: 1.0,
    password: 1.0,
  });
  await mongo.bettingApp.db.collection(mongo.models.admins).createIndex({
    _id: 1.0,
    agent_level: 1.0,
  });
  await mongo.bettingApp.db.collection(mongo.models.admins).createIndex({
    _id: 1.0,
    status: 1.0,
    firstName: 1,
    lastName: 1,
    user_name: 1,
  });
  await mongo.bettingApp.db.collection(mongo.models.admins).createIndex({
    _id: 1.0,
    status: 1.0,
  });
  await mongo.bettingApp.db.collection(mongo.models.admins).createIndex({
    _id: 1.0,
    firstName: 1,
    lastName: 1,
    user_name: 1,
  });
}
async function createIndexBetsHistory() {
  await mongo.bettingApp.db.collection("betshistories").createIndex({
    winner: 1.0,
    userId: 1.0,
    type: 1.0,
  });
  await mongo.bettingApp.db.collection("betshistories").createIndex({
    userId: 1.0,
    betStatus: 1.0,
    createdAt: 1.0,
  });
  await mongo.bettingApp.db.collection("betshistories").createIndex({
    userId: 1.0,
    betType: 1.0,
    matchId: 1.0,
    selection: 1.0,
  });
  await mongo.bettingApp.db.collection("betshistories").createIndex({
    userId: 1.0,
    betType: 1.0,
    matchId: 1.0,
  });

  await mongo.bettingApp.db.collection("betshistories").createIndex({
    userId: 1.0,
    deleted: 1.0,
    winner: 1.0,
    createdAt: 1.0,
  });
  await mongo.bettingApp.db.collection("betshistories").createIndex({
    _id: 1.0,
    deleted: 1.0,
    winner: 1.0,
  });
  await mongo.bettingApp.db.collection("betshistories").createIndex({
    winner: 1.0,
    deleted: 1.0,
    userId: 1.0,
  });
  await mongo.bettingApp.db.collection("betshistories").createIndex({
    matchId: 1.0,
    betStatus: 1.0,
    betType: 1.0,
  });
  await mongo.bettingApp.db.collection("betshistories").createIndex({
    winner: 1.0,
    matchId: 1.0,
  });
  await mongo.bettingApp.db.collection("betshistories").createIndex({
    type: 1.0,
    betType: 1.0,
    betStatus: 1.0,
  });
  await mongo.bettingApp.db.collection("betshistories").createIndex({
    type: 1.0,
    betType: 1.0,
    betStatus: 1.0,
    name: 1.0,
    gameId: 1.0,
    marketId: 1.0,
  });
  await mongo.bettingApp.db.collection("betshistories").createIndex({
    type: 1.0,
    betType: 1.0,
    betStatus: 1.0,
    matchId: 1.0,
  });
  await mongo.bettingApp.db.collection("betshistories").createIndex({
    type: 1.0,
    betType: 1.0,
    betStatus: 1.0,
    matchId: 1.0,
    selection: 1.0,
  });
  await mongo.bettingApp.db.collection("betshistories").createIndex({
    matchId: 1.0,
    betType: 1.0,
    selection: 1.0,
    betStatus: 1.0,
  });
}

async function createIndexStatements() {
  await mongo.bettingApp.db.collection(mongo.models.statements).createIndex({
    userId: 1.0,
    createdAt: 1.0,
  });
  await mongo.bettingApp.db.collection(mongo.models.statements).createIndex({
    userId: 1.0,
    createdAt: 1.0,
    matchId: 1.0,
  });
  await mongo.bettingApp.db.collection(mongo.models.statements).createIndex({
    userId: 1.0,
    createdAt: 1.0,
    to: 1.0,
  });
  await mongo.bettingApp.db.collection(mongo.models.statements).createIndex({
    userId: 1.0,
    casinoMatchId: 1.0,
  });
}

async function createIndexSports() {
  await mongo.bettingApp.db.collection(mongo.models.sports).createIndex({
    gameStatus: 1.0,
    type: 1.0,
  });
  await mongo.bettingApp.db.collection(mongo.models.sports).createIndex({
    gameStatus: 1.0,
    createdAt: 1.0,
  });
  await mongo.bettingApp.db.collection(mongo.models.sports).createIndex({
    gameStatus: 1.0,
    userId: 1.0,
  });
  await mongo.bettingApp.db.collection(mongo.models.sports).createIndex({
    gameStatus: 1.0,
    userId: 1.0,
    type: 1.0,
  });
  await mongo.bettingApp.db.collection(mongo.models.sports).createIndex({
    gameStatus: 1.0,
    userId: 1.0,
    type: 1.0,
    createdAt: 1.0,
  });
  await mongo.bettingApp.db.collection(mongo.models.sports).createIndex({
    name: 1.0,
    winner: 1.0,
    status: 1.0,
    startDate: 1.0,
  });
  await mongo.bettingApp.db.collection(mongo.models.sports).createIndex({
    type: 1.0,
    marketId: 1.0,
    gameId: 1.0,
    winner: 1.0,
    status: 1.0,
    startDate: 1.0,
  });
}

async function createIndexBlockMatch() {
  await mongo.bettingApp.db.collection("blockmatches").createIndex({
    userId: 1.0,
    matchId: 1.0,
  });
}

async function createIndexSportsLeage() {
  await mongo.bettingApp.db.collection("sportsleages").createIndex({
    status: 1.0,
    type: 1.0,
  });
  await mongo.bettingApp.db.collection("sportsleages").createIndex({
    status: 1.0,
    type: 1.0,
    _id: 1.0,
  });
}
async function createIndexPins() {
  await mongo.bettingApp.db.collection(mongo.models.pins).createIndex({
    userId: 1.0,
    type: 1.0,
  });
}
async function createIndexCasinoTable() {
  await mongo.bettingApp.db.collection("casinomatchhistories").createIndex({
    userObjectId: 1.0,
    winLostAmount: 1.0,
  });
  await mongo.bettingApp.db.collection("casinomatchhistories").createIndex({
    userObjectId: 1.0,
    winLostAmount: 1.0,
    createdAt: 1.0,
  });
  await mongo.bettingApp.db.collection("casinomatchhistories").createIndex({
    userObjectId: 1.0,
    isMatchComplete: 1.0,
  });
}

const initIndex = async () => {
  await createIndexUsers();
  await createIndexAdmins();
  await createIndexBetsHistory();
  await createIndexStatements();
  await createIndexSports();
  await createIndexBlockMatch();
  await createIndexSportsLeage();
  await createIndexPins();
  await createIndexCasinoTable();

  console.log("=====Index Createtion is done======")
};
initIndex();
module.exports = initIndex;
