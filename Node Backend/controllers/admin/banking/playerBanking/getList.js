const joi = require("joi");
const mongo = require("../../../../config/mongodb");
const {
  calculatMyRefPl,
  calculatMyAvailbleBalance,
} = require("./calculatMyRefPl");
const { playerCalculation, balanceCalculation } = require("../../../utils/getBalanceByDownline");

const payload = {
  body: joi.object().keys({
    type: joi.string().valid("player", "agent").required(),
    search: joi.string().optional(),
    limit: joi.number().required(),
    page: joi.number().required(),
  }),
};

async function handler({ body, user }) {
  const { userId } = user;
  const { type, search, limit, page } = body;
  // let populate = {};
  const filter = {};
  const select = {
    remaining_balance: 1,
  };
  if (type === "player") select.player = 1;
  else select.agent = 1;

  if (search) {
    filter.$or = [
      { firstName: { $regex: search, $options: "i" } },
      { lastName: { $regex: search, $options: "i" } },
      { user_name: { $regex: search, $options: "i" } },
    ];
  }
  const userInfo = await mongo.bettingApp.model(mongo.models.admins).findOne({
    query: {
      _id: userId,
    },
  });
  if (type === "player") {
    const playerInfo = await mongo.bettingApp
      .model(mongo.models.users)
      .paginate({
        query: {
          _id: { $in: userInfo.player },
          status:"active",
          ...filter,
        },
        limit,
        page,
        select: {
          firstName: 1,
          lastName: 1,
          agent_level: 1,
          user_name: 1,
          balance: 1,
          remaining_balance: 1,
          exposure: 1,
          credit_ref: 1,
          ref_pl: 1,
          _id: 1,
        },
      });
    // let gg = 000.10;

    playerInfo.results = playerInfo.results.map((element) => {
      return {
        firstName: element.firstName,
        lastName: element.lastName,
        agent_level: element.agent_level,
        user_name: element.user_name,
        _id: element._id,
        balance: Number(element.balance.toFixed(2)), // user remaining balance
        remaining_balance: Number(element.remaining_balance.toFixed(2)), // user availble balance
        exposure: Number(element.exposure.toFixed(2)),
        credit_ref: Number(element.credit_ref.toFixed(2)),
        ref_pl: Number(
          playerCalculation(
            element.remaining_balance,
            element.credit_ref
          ).toFixed(2)
        ),
        //  Number(element.ref_pl.toFixed(2)),
      };
    });
    userInfo.player = playerInfo;
  } else {
    const agentInfo = await mongo.bettingApp
      .model(mongo.models.admins)
      .paginate({
        query: {
          _id: { $in: userInfo.agent },
          status:"active",
          ...filter,
        },
        limit,
        page,
        select: {
          firstName: 1,
          lastName: 1,
          agent_level: 1,
          user_name: 1,
          balance: 1,
          remaining_balance: 1,
          // "exposure": 1,
          credit_ref: 1,
          ref_pl: 1,
          _id: 1,
        },
      });

    console.log(" agentInfo :: ", agentInfo);
    const results = [];
    for await (const element of agentInfo.results) {
      const { agentBalance, clientBalance, exposure, myPl, } =
      await balanceCalculation(
        element._id,
        element.remaining_balance,
        element.credit_ref,
        "active"
      );
      const availableBalnce = await calculatMyAvailbleBalance(element._id);

      const ref_pl = await playerCalculation(availableBalnce-exposure, element.credit_ref);
      console.log("banking list :: typeof ref_pl : ", typeof ref_pl);
      console.log("banking list :: ref_pl : ", ref_pl);

      const newResult = {
        firstName: element.firstName,
        lastName: element.lastName,
        agent_level: element.agent_level,
        user_name: element.user_name,
        _id: element._id,
        // balance: Number(element.balance.toFixed(2)), // agent available balance
        balance: Number(availableBalnce.toFixed(2)), // agent available balance
        remaining_balance: Number(element.remaining_balance.toFixed(2)), // agent remaining  balance
        // exposure: Number(element.exposure.toFixed(2)),
        credit_ref: Number(element.credit_ref.toFixed(2)),
        // ref_pl: Number(element.ref_pl.toFixed(2)),
        ref_pl: Number(ref_pl.toFixed(2)),
      };

      results.push(newResult);
    }
    agentInfo.results = results;
    // agentInfo.results = agentInfo.results.map((element) => {
    //   // const ref_pl = await calculatMyRefPl(element._id);

    //   // console.log("banking list :: typeof ref_pl : ", typeof ref_pl);
    //   // console.log("banking list :: ref_pl : ", ref_pl);
    //   return {
    //     firstName: element.firstName,
    //     lastName: element.lastName,
    //     agent_level: element.agent_level,
    //     user_name: element.user_name,
    //     _id: element._id,
    //     balance: Number(element.balance.toFixed(2)),
    //     remaining_balance: Number(element.remaining_balance.toFixed(2)),
    //     // exposure: Number(element.exposure.toFixed(2)),
    //     credit_ref: Number(element.credit_ref.toFixed(2)),
    //     ref_pl: Number(element.ref_pl.toFixed(2)),
    //     // ref_pl: Number(ref_pl.toFixed(2)),
    //   };
    // });
    console.log(" agentInfo :: after :: ", agentInfo);
    userInfo.agent = agentInfo;
  }

  userInfo.msg = "player List Get.";

  return userInfo;
}

module.exports = {
  payload,
  handler,
  auth: true,
};
