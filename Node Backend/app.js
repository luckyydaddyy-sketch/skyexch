const express = require("express");
const cors = require("cors");

const { errorHandler, notFoundError } = require("./middlewares/error");
const {
  getAllFilesFromFolder,
  getFullPath,
  getFileExtension,
} = require("./utils/file");

const app = express();

// parse application/x-www-form-urlencoded
app.use(
  express.urlencoded({
    limit: "50mb",
    extended: false,
    parameterLimit: 1000000,
  })
);

// parse application/json
app.use(express.json({ limit: "50mb" }));
app.use(cors());
app.use(function (req, res, next) {
  // Website you wish to allow to connect
  res.setHeader("Access-Control-Allow-Origin", "*");

  // Request methods you wish to allow
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );

  // Request headers you wish to allow
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type,token,authorization"
  );

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader("Access-Control-Allow-Credentials", true);

  // Pass to next layer of middleware
  next();
});

// All index route will be hanlded here
const fullPath = getFullPath(__dirname, "./routes");
const files = getAllFilesFromFolder(fullPath)
  .map((e) => e.replace(fullPath, ""))
  .filter((e) => getFileExtension(e) == ".js");
files.forEach((file) => {
  let routeName = file.replace(
    file.includes("/index.js") ? "/index.js" : ".js",
    ""
  );
  app.use(routeName, require(`./routes/${routeName}`));
});

// set view for image file
app.set("views", "./uploads");
app.use(express.static("./uploads"));
app.use(express.static("./apk"));
app.use(express.static("./depositImage"));

// send back a 404 error for any unknown api request
app.use(notFoundError);

app.use(errorHandler);

// set view engine
app.set("view engine", "ejs");
module.exports = app;
