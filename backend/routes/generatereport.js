// routes/report.js
const express = require("express");
const router = express.Router();
const leads = require("../models/lead"); // Adjust the path as needed
const { generateReport } = require("../controllers/generateReportController");

router.post("/new", generateReport);

module.exports = router;
