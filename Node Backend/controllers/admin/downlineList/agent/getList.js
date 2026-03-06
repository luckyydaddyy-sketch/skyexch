const joi = require("joi");
const mongo = require("../../../../config/mongodb");
const {
  playerCalculation,
  balanceCalculation,
} = require("../../../utils/getBalanceByDownline");
const { getAdminUserInfo } = require("../../utile/getdownLineUsersList");
const {
  calculatMyAvailbleBalance,
} = require("../../banking/playerBanking/calculatMyRefPl");

const payload = {
  body: joi.object().keys({
    userId: joi.string().required(),
    status: joi.string().valid("all", "active", "suspend", "locked").required(),
    search: joi.string().optional(),
  }),
};

async function filterData(user, agent, player, status) {
  const agents = [];
  const players = [];
  for await (const agt of agent) {
    const { agentBalance, clientBalance, exposure, myPl, ref_pl } =
      await balanceCalculation(
        agt._id,
        agt.remaining_balance,
        agt.credit_ref,
        status
      );

    console.log(agt.user_name, " :: ref_pl :::  ", ref_pl);
    agt.agentBalance = agentBalance;
    agt.clientBalance = clientBalance;
    agt.exposure = exposure;
    agt.cumulative_pl = myPl;
    // agt.ref_pl = ref_pl;
    const getMyAvailbeBalance = await calculatMyAvailbleBalance(agt._id);
    agt.ref_pl = await playerCalculation(
      // getMyAvailbeBalance - exposure,
      getMyAvailbeBalance,
      agt.credit_ref
    ).toFixed(2);

    // const calculatRefPl = await playerCalculation(
    //   getMyAvailbeBalance,
    //   agt.credit_ref
    // );
    // agt.ref_pl = Number(calculatRefPl.toFixed(2));

    // agt.balance = Number(agt.balance.toFixed(2));
    agt.balance = Number(getMyAvailbeBalance.toFixed(2));
    agt.remaining_balance = Number(agt.remaining_balance.toFixed(2));
    agt.credit_ref = Number(agt.credit_ref.toFixed(2));

    agents.push(agt);
  }
  user.agent = agents;
  console.log("agent downline :: player ::: ");
  console.log(player);
  for await (const plyr of player) {
    const ref_pl = await playerCalculation(
      // plyr.remaining_balance, // change rf/pl calculaton
      plyr.balance,
      plyr.credit_ref
    );
    plyr.ref_pl = Number(ref_pl.toFixed(2));

    plyr.balance = Number(plyr.balance.toFixed(2));
    plyr.remaining_balance = Number(plyr.remaining_balance.toFixed(2));
    plyr.exposure = Number(plyr.exposure.toFixed(2));
    plyr.cumulative_pl = Number(plyr.cumulative_pl.toFixed(2));
    plyr.credit_ref = Number(plyr.credit_ref.toFixed(2));

    players.push(plyr);
  }

  user.player = players;
  // user.AgentBalance = 0;
  // user.ClientBalance = 0;
  return user;
}

async function handler({ body, user }) {
  const { status, search, userId } = body;
  let userInfo = await mongo.bettingApp.model(mongo.models.admins).findOne({
    // Find admin data
    query: {
      _id: userId,
    },
    select: {
      // balance: 1,
      // remaining_balance: 1,
      // exposure: 1,
      // ref_pl: 1,
      // cumulative_pl: 1,
      // status: 1,
      agent_level: 1,
      agent: 1,
      player: 1,
      firstName: 1,
      lastName: 1,
      user_name: 1,
      whoAdd: 1,
      commission: 1,
    },
  });

  const filter = {};
  if (search) {
    filter.$or = [
      { firstName: { $regex: search, $options: "i" } },
      { lastName: { $regex: search, $options: "i" } },
      { user_name: { $regex: search, $options: "i" } },
    ];
  }
  if (status !== "all") filter.status = status;

  console.log("getList :: filter ::: ", filter);
  let agentInfo = await mongo.bettingApp.model(mongo.models.admins).find({
    // Find agent admin data
    query: {
      _id: { $in: userInfo.agent },
      ...filter,
    },
    populate: {
      path: "domain",
      model: await mongo.bettingApp.model(mongo.models.websites),
      select: ["domain"],
    },
    select: {
      balance: 1,
      remaining_balance: 1,
      exposure: 1,
      ref_pl: 1,
      cumulative_pl: 1,
      credit_ref: 1,
      status: 1,
      agent_level: 1,
      firstName: 1,
      lastName: 1,
      user_name: 1,
      domain: 1,
    },
  });

  let playerInfo = await mongo.bettingApp.model(mongo.models.users).find({
    // Find player data
    query: {
      _id: { $in: userInfo.player },
      ...filter,
    },
    select: {
      balance: 1,
      remaining_balance: 1,
      exposure: 1,
      ref_pl: 1,
      cumulative_pl: 1,
      credit_ref: 1,
      status: 1,
      agent_level: 1,
      firstName: 1,
      lastName: 1,
      user_name: 1,
      sportWinLimit: 1,
    },
  });

  let updateData = await filterData(userInfo, agentInfo, playerInfo, status);
  const uperLineInfo = await getAdminUserInfo(
    userInfo.whoAdd,
    userId,
    user.userId
  );
  updateData.uperLineInfo = uperLineInfo;
  updateData.msg = "Downline List Get.";

  return updateData;
}

module.exports = {
  payload,
  handler,
  auth: true,
};
