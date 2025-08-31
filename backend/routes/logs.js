const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const Lead = require("../models/lead"); // Adjust the path as needed

// GET /api/v1/logs/:lead_id
router.get("/:lead_id", async (req, res) => {
  try {
    const { lead_id } = req.params;
    const lead = await Lead.findOne({ lead_id, isdeleted: false });
    console.log("Lead found:", lead);

    if (!lead) {
      return res.status(404).json({ error: "Lead not found" });
    }

    res.json({
      updateLogs: lead.updatelogs || [],
      transferLogs: lead.transferredtologs || [],
    });
  } catch (error) {
    console.error("Error fetching logs:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//   export default router;
module.exports = router;
