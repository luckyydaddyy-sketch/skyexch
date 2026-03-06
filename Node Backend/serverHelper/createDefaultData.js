const mongo = require("../config/mongodb");
const admin = require("./defaultData/admin");
const banner = require("./defaultData/banners");
const dashboardImages = require("./defaultData/dashboardImages");
const markets = require("./defaultData/market");
const role = require("./defaultData/roles");
const websites = require("./defaultData/websites");
const defaultSportLimit = require("./defaultData/defaultSportLimit");

const createDefaultData = async () => {
  // insert role if not have
  const adminInfo = await mongo.bettingApp
    .model(mongo.models.admins)
    .findOne({ query: { user_name: "galaxy" } });

  if (!adminInfo) {
    await mongo.bettingApp
      .model(mongo.models.admins)
      .insertMany({ documents: admin });
  }

  // insert role if not have
  const rolesInfo = await mongo.bettingApp
    .model(mongo.models.roles)
    .findOne({});

  if (!rolesInfo) {
    await mongo.bettingApp
      .model(mongo.models.roles)
      .insertMany({ documents: role });
  }

  // insert banners
  const bannerInfo = await mongo.bettingApp
    .model(mongo.models.banners)
    .findOne({});

  if (!bannerInfo) {
    await mongo.bettingApp
      .model(mongo.models.banners)
      .insertMany({ documents: banner });
  }

  // insert dashboardImages
  const dashboardImagesInfo = await mongo.bettingApp
    .model(mongo.models.dashboardImages)
    .findOne({});

  if (!dashboardImagesInfo) {
    await mongo.bettingApp
      .model(mongo.models.dashboardImages)
      .insertMany({ documents: dashboardImages });
  }

  // insert websites
  const websitesInfo = await mongo.bettingApp
    .model(mongo.models.websites)
    .findOne({});

  if (!websitesInfo) {
    await mongo.bettingApp
      .model(mongo.models.websites)
      .insertMany({ documents: websites });
  }

  // insert market
  const marketInfo = await mongo.bettingApp
    .model(mongo.models.marketLists)
    .findOne({});

  if (!marketInfo) {
    await mongo.bettingApp
      .model(mongo.models.marketLists)
      .insertMany({ documents: markets });
  }

  // insert Default Sports limit
  const sportLimitInfo = await mongo.bettingApp
    .model(mongo.models.deafultSetting)
    .findOne({});

  if (!sportLimitInfo) {
    await mongo.bettingApp
      .model(mongo.models.deafultSetting)
      .insertMany({ documents: defaultSportLimit });
  }
};

module.exports = createDefaultData;
