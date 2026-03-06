const express = require("express");
const mongo = require("../config/mongodb");

const router = express.Router();

/**
 * API for test Route
 */

router.get("/", (req, res) => {
  console.log("test call ------->");
  res.send(req.originalUrl);
});

module.exports = router;
