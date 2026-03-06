const mongo = require("../config/mongodb");
const { USER_LEVEL_NEW } = require("../constants");

const allName = [
  "DevO",
  "DevSUO",
  "DevWL",
  "DevSA",
  "DevA",
  "DevSUA",
  "DevSS",
  "DevS",
  "DevM",
  "DevCL",
];
const allRole = [
  USER_LEVEL_NEW.COM,
  USER_LEVEL_NEW.SUO,
  USER_LEVEL_NEW.WL,
  USER_LEVEL_NEW.SP,
  USER_LEVEL_NEW.AD,
  USER_LEVEL_NEW.SUA,
  USER_LEVEL_NEW.SS,
  USER_LEVEL_NEW.S,
  USER_LEVEL_NEW.M,
  USER_LEVEL_NEW.CL,
];
// const allRole = ["COM", "SP", "AD", "SMDL", "MDL", "DL", "PL"];

const getDefaultData = (
  agent_level,
  user_name,
  admin = null,
  whoAdd = [],
  domain = []
) => {
  return {
    firstName: "",
    lastName: "",
    commission: 0,
    agent_level,
    user_name,
    email: "",
    newPassword: false,
    password: "dev12345",
    email_verified_at: null,
    limit: 0,
    admin,
    whoAdd,
    domain,
    agent: [],
    player: [],
    mobileNumber: "",
    status: "active",
    balance: 0,
    remaining_balance: 0,
    exposure: 0,
    cumulative_pl: 0,
    ref_pl: 0,
    credit_ref: 0,
    exposer_limit: 0,
    rolling_delay: false,
    commissionAmount: 0.0,
  };
};

const init = async () => {
  let whoAdd = [];
  const websites = await mongo.bettingApp
    .model(mongo.models.websites)
    .findOne({});
  let adminInfo = await mongo.bettingApp
    .model(mongo.models.admins)
    .findOne({ query: { user_name: allName[0] } });

  if (!adminInfo) {
    const DevAdmin = getDefaultData(allRole[0], allName[0]);

    const adminDetail = await mongo.bettingApp
      .model(mongo.models.admins)
      .insertOne({ document: DevAdmin });
    console.log("adminDetail :: ", adminDetail);
    whoAdd.push(adminDetail._id);

    // SP insert
    const Dev_SP = getDefaultData(
      allRole[1],
      allName[1],
      adminDetail._id,
      whoAdd,
      [websites._id]
    );
    const SPDetail = await mongo.bettingApp
      .model(mongo.models.admins)
      .insertOne({ document: Dev_SP });
    console.log("SPDetail :: ", SPDetail);
    whoAdd.push(SPDetail._id);
    await mongo.bettingApp.model(mongo.models.admins).updateOne({
      query: {
        _id: adminDetail._id,
      },
      update: {
        $push: {
          agent: SPDetail._id,
        },
      },
    });

    // AD insert
    const Dev_AD = getDefaultData(
      allRole[2],
      allName[2],
      SPDetail._id,
      whoAdd,
      [websites._id]
    );
    const ADDetail = await mongo.bettingApp
      .model(mongo.models.admins)
      .insertOne({ document: Dev_AD });
    console.log("ADDetail :: ", ADDetail);
    whoAdd.push(ADDetail._id);
    await mongo.bettingApp.model(mongo.models.admins).updateOne({
      query: {
        _id: SPDetail._id,
      },
      update: {
        $push: {
          agent: ADDetail._id,
        },
      },
    });

    // SMDL insert
    const Dev_SMDL = getDefaultData(
      allRole[3],
      allName[3],
      ADDetail._id,
      whoAdd,
      [websites._id]
    );
    const SMDLDetail = await mongo.bettingApp
      .model(mongo.models.admins)
      .insertOne({ document: Dev_SMDL });
    console.log("SMDLDetail :: ", SMDLDetail);
    whoAdd.push(SMDLDetail._id);
    await mongo.bettingApp.model(mongo.models.admins).updateOne({
      query: {
        _id: ADDetail._id,
      },
      update: {
        $push: {
          agent: SMDLDetail._id,
        },
      },
    });

    // MDL insert
    const Dev_MDL = getDefaultData(
      allRole[4],
      allName[4],
      SMDLDetail._id,
      whoAdd,
      [websites._id]
    );
    const MDLDetail = await mongo.bettingApp
      .model(mongo.models.admins)
      .insertOne({ document: Dev_MDL });
    console.log("MDLDetail :: ", MDLDetail);
    whoAdd.push(MDLDetail._id);
    await mongo.bettingApp.model(mongo.models.admins).updateOne({
      query: {
        _id: SMDLDetail._id,
      },
      update: {
        $push: {
          agent: MDLDetail._id,
        },
      },
    });

    // DL insert
    const Dev_DL = getDefaultData(
      allRole[5],
      allName[5],
      MDLDetail._id,
      whoAdd,
      [websites._id]
    );
    const DLDetail = await mongo.bettingApp
      .model(mongo.models.admins)
      .insertOne({ document: Dev_DL });
    console.log("DLDetail :: ", DLDetail);
    whoAdd.push(DLDetail._id);
    await mongo.bettingApp.model(mongo.models.admins).updateOne({
      query: {
        _id: MDLDetail._id,
      },
      update: {
        $push: {
          agent: DLDetail._id,
        },
      },
    });

    // SS insert
    const Dev_SS = getDefaultData(
      allRole[6],
      allName[6],
      DLDetail._id,
      whoAdd,
      [websites._id]
    );
    const SSDetail = await mongo.bettingApp
      .model(mongo.models.admins)
      .insertOne({ document: Dev_SS });
    console.log("SSDetail :: ", SSDetail);
    whoAdd.push(SSDetail._id);
    await mongo.bettingApp.model(mongo.models.admins).updateOne({
      query: {
        _id: DLDetail._id,
      },
      update: {
        $push: {
          agent: SSDetail._id,
        },
      },
    });

    // S insert
    const Dev_S = getDefaultData(allRole[7], allName[7], Dev_SS._id, whoAdd, [
      websites._id,
    ]);
    const SDetail = await mongo.bettingApp
      .model(mongo.models.admins)
      .insertOne({ document: Dev_S });
    console.log("SDetail :: ", SDetail);
    whoAdd.push(SDetail._id);
    await mongo.bettingApp.model(mongo.models.admins).updateOne({
      query: {
        _id: Dev_SS._id,
      },
      update: {
        $push: {
          agent: SDetail._id,
        },
      },
    });
    // M insert
    const Dev_M = getDefaultData(allRole[8], allName[8], Dev_S._id, whoAdd, [
      websites._id,
    ]);
    const MDetail = await mongo.bettingApp
      .model(mongo.models.admins)
      .insertOne({ document: Dev_M });
    console.log("MDetail :: ", MDetail);
    whoAdd.push(MDetail._id);
    await mongo.bettingApp.model(mongo.models.admins).updateOne({
      query: {
        _id: Dev_S._id,
      },
      update: {
        $push: {
          agent: MDetail._id,
        },
      },
    });

    // PL insert
    const Dev_PL = getDefaultData(allRole[9], allName[9], MDetail._id, whoAdd, [
      websites._id,
    ]);
    const PLDetail = await mongo.bettingApp
      .model(mongo.models.users)
      .insertOne({ document: Dev_PL });
    console.log("PLDetail :: ", PLDetail);
    whoAdd.push(PLDetail._id);
    await mongo.bettingApp.model(mongo.models.admins).updateOne({
      query: {
        _id: MDetail._id,
      },
      update: {
        $push: {
          player: PLDetail._id,
        },
      },
    });

    console.log("dev data created");
  }
  console.log("dev data already.");
};

init();
