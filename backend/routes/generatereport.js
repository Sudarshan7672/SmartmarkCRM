// routes/report.js
const express = require("express");
const router = express.Router();
const { generateReport } = require("../controllers/generateReportController");

router.post("/new", generateReport);

module.exports = router;
