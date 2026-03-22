const mongoose = require("mongoose");

const config = require("./config");

let mainDb = config.mongoose.master_db;
const models = {
  admins: "admins",
  tokens: "tokens",
  users: "users",
  dashboardImages: "dashboardImages",
  roles: "roles",
  betsHistory: "betsHistory",
  sports: "sports",
  statements: "statements",
  activities: "activities",
  websites: "websites",
  stacks: "stacks",
  casinos: "casinos",
  banners: "banners",
  pins: "pins",
  sportsLeage: "sportsLeage",
  blockMatch: "blockMatch",
  casinoMatchHistory: "casinoMatchHistory",
  casinoBonus: "casinoBonus",
  blockMarketLists: "blockMarketLists",
  marketLists: "marketLists",
  bankDetails: "bankDetails",
  deposits: "deposits",
  withdrawals: "withdrawals",
  deafultSetting: "deafultSetting",
  contactDetails: "contactDetails",
  inboxs: "inboxs",
  betTotalAmount: "betTotalAmount",
  daysWiseBetTotalAmount: "daysWiseBetTotalAmount",
  apiProviders: "apiProviders",
};

console.log(config.mongoose);
const dbClient = mongoose.createConnection(
  config.mongoose.url,
  config.mongoose.options
);

dbClient.on("error", (err) => {
  console.error("MongoDB Connection Error>> : ", err);
});

dbClient.once("open", function () {
  console.log("MongoDB connected to ");
  mainDb = switchDb(config.mongoose.master_db);
  loadModels();
});

function loadModels() {
  Object.keys(models).forEach((schema) => {
    mongoose.model(schema, require(`../models/${schema}`));
  });
}

function masterDb() {
  return mainDb;
}

function switchDb(dbName) {
  return dbClient.useDb(dbName, {
    useCache: true,
    useFindAndModify: false,
    useCreateIndex: true,
  });
}

function getModel(db, schema) {
  let model = db.model(schema, require(`../models/${schema}`));
  // delete db.models[schema];
  // delete db.collections[schema];
  // delete db.base.modelSchemas[schema];
  return model;
}

async function find({
  db,
  model,
  query,
  options,
  project,
  limit,
  skip,
  sort,
  populate,
}) {
  return await getModel(db, model)
    .find(query, project, options)
    .populate(populate)
    .limit(limit)
    .skip(skip)
    .sort(sort)
    .lean()
    .exec();
}

async function findOne({ db, model, query, project, sort }) {
  return await getModel(db, model)
    .findOne(query, project)
    .sort(sort)
    .lean()
    .exec();
}

async function insertOne({ db, model, document, options }) {
  return await getModel(db, model).create(document, options);
}

async function insertMany({ db, model, documents, options }) {
  return await getModel(db, model).insertMany(documents, options);
}
async function createIndex({ db, model, keys, options }) {
  return await getModel(db, model).createIndex(keys, options);
}

async function updateOne({ db, model, query, update, options }) {
  return await getModel(db, model).updateOne(query, update, options);
}

async function updateMany({ db, model, query, update, options }) {
  return await getModel(db, model).updateMany(query, update, options);
}

async function deleteOne({ db, model, query, options }) {
  return await getModel(db, model).deleteOne(query, options);
}

async function deleteMany({ db, model, query, options }) {
  return await getModel(db, model).deleteMany(query, options);
}

async function distinct({ db, model, field, query }) {
  return await getModel(db, model).distinct(field, query);
}

async function aggregate({ db, model, pipeline, options }) {
  return await getModel(db, model).aggregate(pipeline).exec();
}
async function aggregate2({ db, model, pipeline, populate, options }) {
  return await getModel(db, model)
    .aggregate(pipeline)
    .populate(populate)
    .exec();
}
async function countDocuments({ db, model, query }) {
  return await getModel(db, model).countDocuments(query).lean();
}

async function findByIdAndUpdate({ db, model, query, update, options }) {
  return await getModel(db, model)
    .findByIdAndUpdate(
      {
        _id: ObjectId(query),
      },
      update,
      options
    )
    .lean();
}

async function save({ db, model, document, options }) {
  return await getModel(db, model).create(document, options);
}

async function findByIdAndDelete({ db, model, id, options }) {
  return await getModel(db, model).deleteOne(
    {
      _id: ObjectId(id),
    },
    options
  );
}

async function findOneAndUpdate({ db, model, query, update, options }) {
  return await getModel(db, model)
    .findOneAndUpdate(query, update, options)
    .lean();
}

async function findOneAndDelete({ db, model, query, options }) {
  return await getModel(db, model).findOneAndDelete(query, options);
}

async function findAndModify({ db, model, query, update, options }) {
  return await getModel(db, model).findAndModify(query, update, options).lean();
}
function createDocument({ db, model, object }) {
  return getModel(db, model)(object);
}

function DB(dbName) {
  this.db = dbClient.useDb(dbName, {
    useCache: true,
    useFindAndModify: false,
    useCreateIndex: true,
  });

  this.dbName = dbName;
}

DB.prototype.model = function (modelName) {
  return new Model(this.db, modelName);
};

function Model(db, modelName) {
  this.model = db.model(modelName, require(`../models/${modelName}`));
  this.modelName = modelName;

  // delete db.models[modelName];
  // delete db.collections[modelName];
  // delete db.base.modelSchemas[modelName];
}

Model.prototype.find = async function ({
  query,
  select,
  limit,
  skip,
  sort,
  populate,
}) {
  return await this.model
    .find(query)
    .select(select)
    .populate(populate)
    .limit(limit)
    .skip(skip)
    .sort(sort)
    .lean()
    .exec();
};

Model.prototype.findOne = async function ({ query, select, sort, populate }) {
  try {
    return await this.model
      .findOne(query)
      .select(select)
      .populate(populate)
      .sort(sort)
      .lean()
      .exec();
  } catch (err) {
    console.log("err : ", err);
  }
};

Model.prototype.insertOne = async function ({ document, options }) {
  return await this.model.create(document, options);
};

Model.prototype.insertMany = async function ({ documents, options }) {
  return await this.model.insertMany(documents, options);
};

Model.prototype.updateOne = async function ({ query, update, options }) {
  return await this.model.updateOne(query, update, options);
};

Model.prototype.updateMany = async function ({ query, update, options }) {
  return await this.model.updateMany(query, update, options);
};

Model.prototype.deleteOne = async function ({ query, options }) {
  return await this.model.deleteOne(query, options);
};

Model.prototype.deleteMany = async function ({ query, options }) {
  return await this.model.deleteMany(query, options);
};

Model.prototype.distinct = async function ({ field, query }) {
  return await this.model.distinct(field, query);
};

Model.prototype.aggregate = async function ({ pipeline, options }) {
  return await this.model.aggregate(pipeline).exec();
};

Model.prototype.aggregate2 = async function ({ pipeline, populate, options }) {
  return await this.model.aggregate(pipeline).populate(populate).exec();
};

Model.prototype.countDocuments = async function ({ query }) {
  return await this.model.countDocuments(query).lean();
};

Model.prototype.findByIdAndUpdate = async function ({
  query,
  update,
  options,
}) {
  return await this.model
    .findByIdAndUpdate(
      {
        _id: ObjectId(query),
      },
      update,
      options
    )
    .lean();
};

Model.prototype.findAndModify = async function ({ query, update, options }) {
  console.log("?--------------------", query, update, options);
  return await this.model.findAndModify(query, update, options).lean();
};
Model.prototype.save = async function ({ document, options }) {
  return await this.model.create(document, options);
};

Model.prototype.findByIdAndDelete = async function ({ id, options }) {
  return await this.model.deleteOne(
    {
      _id: ObjectId(id),
    },
    options
  );
};

Model.prototype.findOneAndUpdate = async function ({
  query,
  update,
  options,
  populate,
}) {
  return await this.model
    .findOneAndUpdate(query, update, options)
    .populate(populate)
    .lean();
};

Model.prototype.findOneAndDelete = async function ({ query, options }) {
  return await this.model.findOneAndDelete(query, options);
};

Model.prototype.createDocument = function ({ object }) {
  return this.model(object);
};

Model.prototype.paginate = async function ({
  query,
  select,
  populate,
  limit = 20,
  page = 1,
  sort,
}) {
  const skip = (page - 1) * limit;

  const [totalResults, results] = await Promise.all([
    this.countDocuments({
      ...(query && { query }),
    }),
    this.find({
      ...(query && { query }),
      ...(select && { select }),
      ...(populate && { populate }),
      ...(limit && { limit }),
      ...(skip && { skip }),
      ...(sort && { sort }),
    }),
  ]);

  const totalPages = Math.ceil(totalResults / limit);

  return { results, page, limit, totalPages, totalResults };
};

Model.prototype.createIndex = async function ({ keys, options }) {
  return await this.model.createIndex(keys, options);
};

const isValidObjectId = (str) => {
  if (!str) return false;
  let pattern = new RegExp("^[a-f0-9]{24}$");
  return pattern.test(str.toString());
};

let bettingApp = new DB(config.mongoose.master_db);
let ObjectId = mongoose.Types.ObjectId;

module.exports = {
  models,
  bettingApp,
  ObjectId,
  isValidObjectId,
  masterDb,
  switchDb,
  getModel,
  find,
  findOne,
  createIndex,
  insertOne,
  insertMany,
  updateOne,
  updateMany,
  deleteOne,
  deleteMany,
  distinct,
  aggregate,
  aggregate2,
  countDocuments,
  findByIdAndUpdate,
  findAndModify,
  save,
  findByIdAndDelete,
  findOneAndUpdate,
  findOneAndDelete,
  createDocument,
};
