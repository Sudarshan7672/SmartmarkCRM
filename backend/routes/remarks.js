const express = require("express");
const router = express.Router();
const Lead = require("../models/lead");
const createRemarkNotification = require("../services/remarknotification");

// POST /remarks/add
router.post("/add", async (req, res) => {
  const { lead_id, text } = req.body;
  console.log("Received request to add remark:", req.body);

  if (!lead_id || !text) {
    return res.status(400).json({ message: "Lead ID and remark text are required." });
  }

  try {
    const lead = await Lead.findOne({ lead_id });
    console.log("Lead found:", lead);

    if (!lead) {
      return res.status(404).json({ message: "Lead not found." });
    }

    const remark = {
      remark: text,
      remarkby: req.user?.fullname, // Optional: You can replace this with the actual user
      image: "", // Optional: set to default or from req.body
      logtime: new Date(),
    };

    lead.remarks.push(remark);
    await lead.save();
    await createRemarkNotification({ lead_id: lead_id, remarkby: req.user?.fullname || "Unknown User" });
    console.log("Remark added successfully:", remark);

    res.status(201).json({ message: "Remark added successfully.", remark });
  } catch (error) {
    console.error("Error adding remark:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// PUT edit route
router.put("/:lead_id/:remark_id", async (req, res) => {
    const { lead_id, remark_id } = req.params;
    const { text } = req.body;
  
    try {
      const lead = await Lead.findOne({ lead_id });
      if (!lead) return res.status(404).json({ message: "Lead not found" });
  
      const remark = lead.remarks.id(remark_id);
      if (!remark) return res.status(404).json({ message: "Remark not found" });
  
      remark.remark = text;
      remark.logtime = new Date();
      await lead.save();
  
      res.status(200).json({ message: "Remark updated", remark });
    } catch (err) {
      res.status(500).json({ message: "Error updating remark", error: err.message });
    }
  });
  

  // DELETE route
router.delete("/:lead_id/:remark_id", async (req, res) => {
    const { lead_id, remark_id } = req.params;
  
    try {
      const lead = await Lead.findOne({ lead_id });
      if (!lead) return res.status(404).json({ message: "Lead not found" });
  
      lead.remarks = lead.remarks.filter((r) => r._id.toString() !== remark_id);
      await lead.save();
  
      res.status(200).json({ message: "Remark deleted" });
    } catch (err) {
      res.status(500).json({ message: "Error deleting remark", error: err.message });
    }
  });
  

module.exports = router;
