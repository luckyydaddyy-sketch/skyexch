const mongo = require("../../config/mongodb");
const { USER_LEVEL_NAME } = require("../../constants");
// USER_LEVEL_NAME
async function formentStatements(statements, userId) {
  const newStatement = [];
  let userData = await mongo.bettingApp.model(mongo.models.admins).findOne({
    query: { _id: mongo.ObjectId(userId) },
    select: {
      whoAdd: 1,
    },
  });

  if (!userData) {
    userData = await mongo.bettingApp.model(mongo.models.users).findOne({
      query: { _id: mongo.ObjectId(userId) },
      select: {
        whoAdd: 1,
      },
    });
  }

  const whoAdd = userData.whoAdd.map((_e) => _e.toString());
  // whoAdd.push(userId.toString())
  for await (const user of statements.results) {
    if (user.fromModel === "admins" && user.from) {
      const from = await mongo.bettingApp.model(mongo.models.admins).findOne({
        query: { _id: mongo.ObjectId(user.from) },
        select: {
          user_name: 1,
          agent_level: 1,
        },
      });
      // console.log("from._id ", from._id);
      // console.log("userData :: ", userData.whoAdd);
      // console.log("whoAdd :: ", whoAdd);
      // console.log("user.from :: ", user.from);
      // console.log("from._id !== userId :: ", from._id !== userId);
      // console.log(
      //   "userData.whoAdd.includes(from._id) :: ",
      //   whoAdd.includes(from._id.toString())
      // );

      if (whoAdd.includes(from._id.toString())) {
        from.user_name = USER_LEVEL_NAME[from.agent_level];
      }
      user.from = from;
    } else if (user.fromModel === "users" && user.from) {
      const from = await mongo.bettingApp.model(mongo.models.users).findOne({
        query: { _id: mongo.ObjectId(user.from) },
        select: {
          user_name: 1,
          agent_level: 1,
        },
      });
      if (whoAdd.includes(from._id.toString())) {
        from.user_name = USER_LEVEL_NAME[from.agent_level];
      }
      user.from = from;
    }
    if (user.toModel === "admins" && user.to) {
      const to = await mongo.bettingApp.model(mongo.models.admins).findOne({
        query: { _id: mongo.ObjectId(user.to) },
        select: {
          user_name: 1,
          agent_level: 1,
        },
      });
      if (whoAdd.includes(to._id.toString())) {
        to.user_name = USER_LEVEL_NAME[to.agent_level];
      }
      user.to = to;
    } else if (user.toModel === "users" && user.to) {
      const to = await mongo.bettingApp.model(mongo.models.users).findOne({
        query: { _id: mongo.ObjectId(user.to) },
        select: {
          user_name: 1,
          agent_level: 1,
        },
      });
      if (whoAdd.includes(to._id.toString())) {
        to.user_name = USER_LEVEL_NAME[to.agent_level];
      }
      user.to = to;
    }
    user.credit = Number(user.credit.toFixed(2));
    user.debit = Number(user.debit.toFixed(2));
    user.balance = Number(user.balance.toFixed(2));
    newStatement.push(user);
  }

  return newStatement;
}

module.exports = {
  formentStatements,
};
