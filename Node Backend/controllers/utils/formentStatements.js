const mongo = require("../../config/mongodb");
const { USER_LEVEL_NAME } = require("../../constants");
// USER_LEVEL_NAME
async function formentStatements(statements, userId) {
  const newStatement = [];
  const results = statements.results || [];
  if (results.length === 0) return [];

  let userData = await mongo.bettingApp.model(mongo.models.admins).findOne({
    query: { _id: mongo.ObjectId(userId) },
    select: { whoAdd: 1 },
  });

  if (!userData) {
    userData = await mongo.bettingApp.model(mongo.models.users).findOne({
      query: { _id: mongo.ObjectId(userId) },
      select: { whoAdd: 1 },
    });
  }

  const whoAdd = (userData?.whoAdd || []).map((_e) => _e.toString());

  // Strategy: Bulk fetch all required admins and users in single queries
  const adminIdsToFetch = new Set();
  const userIdsToFetch = new Set();

  results.forEach(row => {
    if (row.from && row.fromModel === "admins") adminIdsToFetch.add(row.from.toString());
    if (row.from && row.fromModel === "users") userIdsToFetch.add(row.from.toString());
    if (row.to && row.toModel === "admins") adminIdsToFetch.add(row.to.toString());
    if (row.to && row.toModel === "users") userIdsToFetch.add(row.to.toString());
  });

  const [adminsList, usersList] = await Promise.all([
    adminIdsToFetch.size > 0 
      ? mongo.bettingApp.model(mongo.models.admins).find({
          query: { _id: { $in: Array.from(adminIdsToFetch).map(id => mongo.ObjectId(id)) } },
          select: { user_name: 1, agent_level: 1 }
        })
      : [],
    userIdsToFetch.size > 0
      ? mongo.bettingApp.model(mongo.models.users).find({
          query: { _id: { $in: Array.from(userIdsToFetch).map(id => mongo.ObjectId(id)) } },
          select: { user_name: 1, agent_level: 1 }
        })
      : []
  ]);

  const adminMap = new Map(adminsList.map(a => [a._id.toString(), a]));
  const userMap = new Map(usersList.map(u => [u._id.toString(), u]));

  for (const statement of results) {
    const row = { ...statement };

    // Format 'from'
    if (row.from && row.fromModel === "admins") {
      let from = adminMap.get(row.from.toString());
      if (from) {
        if (whoAdd.includes(from._id.toString())) {
          from = { ...from, user_name: USER_LEVEL_NAME[from.agent_level] };
        }
        row.from = from;
      }
    } else if (row.from && row.fromModel === "users") {
      let from = userMap.get(row.from.toString());
      if (from) {
        if (whoAdd.includes(from._id.toString())) {
          from = { ...from, user_name: USER_LEVEL_NAME[from.agent_level] };
        }
        row.from = from;
      }
    }

    // Format 'to'
    if (row.to && row.toModel === "admins") {
      let to = adminMap.get(row.to.toString());
      if (to) {
        if (whoAdd.includes(to._id.toString())) {
          to = { ...to, user_name: USER_LEVEL_NAME[to.agent_level] };
        }
        row.to = to;
      }
    } else if (row.to && row.toModel === "users") {
      let to = userMap.get(row.to.toString());
      if (to) {
        if (whoAdd.includes(to._id.toString())) {
          to = { ...to, user_name: USER_LEVEL_NAME[to.agent_level] };
        }
        row.to = to;
      }
    }

    row.credit = Number((row.credit || 0).toFixed(2));
    row.debit = Number((row.debit || 0).toFixed(2));
    row.balance = Number((row.balance || 0).toFixed(2));
    newStatement.push(row);
  }

  return newStatement;
}

module.exports = {
  formentStatements,
};
