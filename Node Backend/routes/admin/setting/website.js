const express = require("express");

const requestHandler = require("../../../middlewares/requestHandler");
const create = require("../../../controllers/admin/setting/website/create");
const addWebSite = require("../../../controllers/admin/setting/website/addWebSite");
const getSite = require("../../../controllers/admin/setting/website/getSite");
const list = require("../../../controllers/admin/setting/website/list");
const getDomain = require("../../../controllers/admin/setting/website/getDomain");
const getInactiveDomain = require("../../../controllers/admin/setting/website/getInactiveDomain");
const update = require("../../../controllers/admin/setting/website/update");
const activeDeactiveSite = require("../../../controllers/admin/setting/website/activeDeactiveSite");
const getSiteById = require("../../../controllers/admin/setting/website/getSiteById");
const getSportsLimit = require("../../../controllers/admin/setting/website/getSportsLimit");
const updateSportsLimit = require("../../../controllers/admin/setting/website/updateSportsLimit");
const updateLinks = require("../../../controllers/admin/setting/website/updateLinks");
const maintenance = require("../../../controllers/admin/setting/website/maintenance");
const getApiProvider = require("../../../controllers/admin/setting/website/getApiProvider");
const updateApiProvider = require("../../../controllers/admin/setting/website/updateApiProvider");

const router = express.Router();

router.post("/", requestHandler(create));
router.post("/addWebSite", requestHandler(addWebSite));
router.post("/getSite", requestHandler(getSite));
router.post("/getSiteById", requestHandler(getSiteById));
router.get("/list", requestHandler(list));
router.get("/getDomain", requestHandler(getDomain));
router.get("/getInactiveDomain", requestHandler(getInactiveDomain));
router.post("/update", requestHandler(update));
router.post("/activeDeactiveSite", requestHandler(activeDeactiveSite));
router.post("/getSportsLimit", requestHandler(getSportsLimit));
router.post("/updateSportsLimit", requestHandler(updateSportsLimit));
router.post("/updateLinks", requestHandler(updateLinks));
router.post("/maintenance", requestHandler(maintenance));
router.post("/getApiProvider", requestHandler(getApiProvider));
router.post("/updateApiProvider", requestHandler(updateApiProvider));



module.exports = router;
