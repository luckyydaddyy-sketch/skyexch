const joi = require("joi");
const mongo = require("../../../config/mongodb");
const {
  balanceCalculation,
  playerCalculation,
  getOnePlayerMyCumulativeProfitLostWithAggrigation,
} = require("../../utils/getBalanceByDownline");
const { getDomainList } = require("./utile");
const { getAdminUserInfo } = require("../utile/getdownLineUsersList");
const {
  calculatMyAvailbleBalance,
} = require("../banking/playerBanking/calculatMyRefPl");

const payload = {
  body: joi.object().keys({
    status: joi.string().valid("all", "active", "suspend", "locked").required(),
    search: joi.string().optional(),
  }),
};

async function filterData(user, agent, player, status) {
  const agents = [];
  const players = [];
  console.time("start for agent");
  for await (const agt of agent) {
    console.time(`agentFor-${agt._id}:balanceCalculation`);
    const { agentBalance, clientBalance, exposure, myPl, ref_pl } =
      await balanceCalculation(
        agt._id,
        agt.remaining_balance,
        agt.credit_ref,
        status
      );
      console.timeEnd(`agentFor-${agt._id}:balanceCalculation`);

    console.log("agentBalance ::: ", agentBalance);
    console.log("clientBalance ::: ", clientBalance);
    console.log("exposure ::: ", exposure);
    console.log("myPl ::: ", myPl);
    console.log("ref_pl ::: ", ref_pl);
    console.log("agt.credit_ref ::: ", agt.credit_ref);
    agt.agentBalance = agentBalance;
    agt.clientBalance = clientBalance;
    agt.exposure = exposure;
    agt.cumulative_pl = myPl;
    console.time(`agentFor-${agt._id}:calculatMyAvailbleBalance`);
    const getMyAvailbeBalance = await calculatMyAvailbleBalance(agt._id);
    console.timeEnd(`agentFor-${agt._id}:calculatMyAvailbleBalance`);

    console.log("filterData: getMyAvailbeBalance :: ", getMyAvailbeBalance);
    console.log("filterData: exposure :: ", exposure);
    // const calculatRefPl = await playerCalculation(
    //   getMyAvailbeBalance,
    //   agt.credit_ref
    // );
    agt.ref_pl = await playerCalculation(
      // getMyAvailbeBalance - exposure,
      getMyAvailbeBalance,
      agt.credit_ref
    ).toFixed(2);
     console.log("filterData: credit_ref :: ", agt.credit_ref);
     console.log("filterData: ref_pl :: ", agt.ref_pl);
    // agt.ref_pl = Number(ref_pl.toFixed(2));
    agt.balance = Number(getMyAvailbeBalance.toFixed(2));
    // agt.balance = Number(agt.balance.toFixed(2));
    agt.remaining_balance = Number(agt.remaining_balance.toFixed(2));
    agt.credit_ref = Number(agt.credit_ref.toFixed(2));

    agents.push(agt);
  }
  console.timeEnd("start for agent");
  user.agent = agents;
  console.time("start for player");
  for await (const plyr of player) {
    const ref_pl = await playerCalculation(
      plyr.balance,
      plyr.credit_ref
    );
    plyr.ref_pl = Number(ref_pl.toFixed(2));

    plyr.balance = Number(plyr.balance.toFixed(2));
    plyr.remaining_balance = Number(plyr.remaining_balance.toFixed(2));
    plyr.exposure = Number(plyr.exposure.toFixed(2));
    // plyr.cumulative_pl = Number(plyr.cumulative_pl.toFixed(2));
    plyr.credit_ref = Number(plyr.credit_ref.toFixed(2));
    const cpm = await getOnePlayerMyCumulativeProfitLostWithAggrigation(
      plyr._id,
      plyr.commission
    );
    console.log("player: cpm:: ", cpm);
    
    const tempCPM = cpm;
    // const tempCPM = cpm + (plyr?.sportWiningsTotalAmountMonth || 0) + (plyr?.casinoWiningsTotalAmountMonth || 0);
    
    plyr.cumulative_pl = Number(tempCPM !== 0 ? tempCPM.toFixed(2) : tempCPM);
    players.push(plyr);
  }
  console.timeEnd("start for player");
  // const userIds = player.map((value) => value._id);
  // myPl = await getMyCumulativeProfitLostWithAggrigation(userIds, commission);
  user.player = players;

  console.log("final user :: ", JSON.stringify(user));
  
  // const { agentBalance, clientBalance, exposure, myPl } =
  //   await balanceCalculation(user._id, user.remaining_balance, 0, status);
console.time("getMainUserAvailbeBalance")
const getMainUserAvailbeBalance = await calculatMyAvailbleBalance(user._id);
console.timeEnd("getMainUserAvailbeBalance")
  // console.log("filterData ::: ", {
  //   agentBalance,
  //   clientBalance,
  //   exposure,
  //   myPl,
  // });

  user.agent.forEach((values)=>{
    if(user?.AgentBalance){
      user.AgentBalance += values?.agentBalance;
    }  else {
      user.AgentBalance = values?.agentBalance;
    }
    if(user?.ClientBalance){
      user.ClientBalance += values?.clientBalance;
    }  else {
      user.ClientBalance = values?.clientBalance;
    }
    if(user?.exposure){
      user.exposure += values?.exposure;
    }  else {
      user.exposure = values?.exposure;
    }
    if(user?.myPl){
      user.myPl += values?.cumulative_pl;
    }  else {
      user.myPl = values?.cumulative_pl;
    }
  })
  user.player.forEach((values)=>{
    if(!user?.AgentBalance){
      user.AgentBalance = 0;
    } 
    if(user?.ClientBalance){
      user.ClientBalance += values?.remaining_balance;
    }  else {
      user.ClientBalance = values?.remaining_balance;
    }
    if(user?.exposure){
      user.exposure += values?.exposure;
    }  else {
      user.exposure = values?.exposure;
    }
    if(user?.myPl){
      user.myPl += values?.cumulative_pl;
    }  else {
      user.myPl = values?.cumulative_pl;
    }
  })
  console.log("user :: ", user)
  // user.AgentBalance = Number(agentBalance.toFixed(2));
  // user.ClientBalance = Number(clientBalance.toFixed(2));
  // user.exposure = Number(exposure.toFixed(2));
  // user.myPl = Number(myPl.toFixed(2));
  user.AgentBalance = user?.AgentBalance ? Number(user.AgentBalance.toFixed(2)) : user?.AgentBalance || 0;
  user.ClientBalance = user?.ClientBalance ? Number(user.ClientBalance.toFixed(2)) : user?.ClientBalance || 0;
  user.exposure = user?.exposure ? Number(user.exposure.toFixed(2)) : user?.exposure || 0;
  user.myPl = user?.myPl ? Number(user.myPl.toFixed(2)) : user?.myPl || 0;
  user.balance = getMainUserAvailbeBalance ? Number(getMainUserAvailbeBalance.toFixed(2)) : getMainUserAvailbeBalance || 0;
  user.remaining_balance = user?.remaining_balance ? Number(user?.remaining_balance.toFixed(2)) : user?.remaining_balance || 0;
  return user;
}

async function handler({ body, user }) {
  const { userId } = user;
  const { status, search } = body;
  let userInfo = await mongo.bettingApp.model(mongo.models.admins).findOne({
    // Find admin data
    query: {
      _id: userId,
    },
    // populate: { path: "domain", select: ["domain"] },
    select: {
      balance: 1,
      remaining_balance: 1,
      exposure: 1,
      // ref_pl: 1,
      cumulative_pl: 1,
      status: 1,
      agent_level: 1,
      agent: 1,
      player: 1,
      firstName: 1,
      lastName: 1,
      user_name: 1,
      whoAdd: 1,
      commission: 1,
      // domain: 1,
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

  console.time("getAgentInfo");
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
      agent: 1,
      player: 1,
      domain: 1,
    },
  });
  console.timeEnd("getAgentInfo");
  agentInfo = await getDomainList(agentInfo);
  console.time("getPlayerInfo");
  let playerInfo = await mongo.bettingApp.model(mongo.models.users).find({
    // Find player data
    query: {
      _id: { $in: userInfo.player },
      ...filter,
    },
    // populate: { path: "domain", model: 'websites', select: ["domain"] },
    select: {
      _id: 1,
      commission: 1,
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
      sportWinLimit: 1,
      sportWiningsTotalAmountMonth: 1,
      casinoWiningsTotalAmountMonth: 1,
    },
  });
  console.timeEnd("getPlayerInfo");
  console.log("downline :: playerInfo ::: ", playerInfo);
  playerInfo = await getDomainList(playerInfo);
  // console.log('downline :: userInfo ::: ', userInfo)
  // console.log('downline :: agentInfo ::: ', agentInfo)
  console.log("downline :: playerInfo ::: ", playerInfo);
  console.time("getupdateData");
  let updateData = await filterData(userInfo, agentInfo, playerInfo, status);
  console.log("final result: updateData :: ", updateData);
  
  console.timeEnd("getupdateData");
  const uperLineInfo = await getAdminUserInfo(userInfo.whoAdd, userId, userId);
  updateData.uperLineInfo = uperLineInfo;
  updateData.msg = "Downline List Get.";
  return updateData;
}

module.exports = {
  payload,
  handler,
  auth: true,
};
