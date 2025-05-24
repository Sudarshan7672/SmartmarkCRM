const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const FollowUp = require("../models/FollowUp");
const Lead = require("../models/lead");

// ✅ Add New Follow-Up with update log
router.post("/add", async (req, res) => {
  try {
    const { lead_id, title, followUpDate, status, notes, updatedby } = req.body;

    if (!lead_id || !title || !followUpDate) {
      return res.status(400).json({ message: "Required fields are missing: lead_id, title, followUpDate." });
    }

    const lead = await Lead.findOne({ lead_id });
    if (!lead) {
      return res.status(404).json({ message: "Lead not found with the provided lead_id." });
    }

    // Create and save the new follow-up
    const newFollowUp = new FollowUp({
      leadId: lead._id,
      title,
      followUpDate,
      status: status || "Pending",
      notes: notes || "",
    });

    await newFollowUp.save();

    // Add an update log entry for this action
    lead.updatelogs = lead.updatelogs || []; // make sure array exists

    lead.updatelogs.push({
      updatedby: req.user?.fullname || "Unknown User",  // Ideally pass username from frontend or auth token
      updatedfields: ["followUps"],            // field(s) updated
      changes: [
        {
          field: "followUps",
          oldValue: null,
          newValue: {
            title,
            followUpDate,
            status: status || "Pending",
            notes: notes || "",
          },
        },
      ],
      logtime: new Date(),
    });

    await lead.save();

    res.status(201).json({ message: "Follow-up added successfully!", followUp: newFollowUp });
  } catch (error) {
    console.error("Error adding follow-up:", error);
    res.status(500).json({ message: "Server error. Could not add follow-up." });
  }
});


// ✅ Fetch All Follow-Ups
router.get("/", async (req, res) => {
  try {
    const followUps = await FollowUp.find().populate("leadId", "lead_id name email");
    res.status(200).json(followUps);
  } catch (error) {
    console.error("Error fetching follow-ups:", error);
    res.status(500).json({ message: "Failed to retrieve follow-ups." });
  }
});

// ✅ Fetch Follow-Ups by Lead ID
router.get("/lead/:lead_id", async (req, res) => {
  try {
    const lead = await Lead.findOne({ lead_id: req.params.lead_id });
    if (!lead) {
      return res.status(404).json({ message: "Lead not found." });
    }

    const followUps = await FollowUp.find({ leadId: lead._id });
    res.status(200).json(followUps);
  } catch (error) {
    console.error("Error fetching follow-ups by lead ID:", error);
    res.status(500).json({ message: "Failed to retrieve follow-ups for the lead." });
  }
});

// ✅ Update Follow-Up
router.put("/:id", async (req, res) => {
  try {
    const { title, followUpDate, status, notes } = req.body;

    if (!title || !followUpDate || !status) {
      return res.status(400).json({ message: "Required fields are missing: title, followUpDate, status." });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid follow-up ID." });
    }

    const updatedFollowUp = await FollowUp.findByIdAndUpdate(
      req.params.id,
      { title, followUpDate, status, notes },
      { new: true }
    );

    if (!updatedFollowUp) {
      return res.status(404).json({ message: "Follow-up not found." });
    }

    res.status(200).json(updatedFollowUp);
  } catch (error) {
    console.error("Error updating follow-up:", error);
    res.status(500).json({ message: "Failed to update follow-up." });
  }
});

// ✅ Delete Follow-Up
router.delete("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid follow-up ID." });
    }

    const deletedFollowUp = await FollowUp.findByIdAndDelete(req.params.id);

    if (!deletedFollowUp) {
      return res.status(404).json({ message: "Follow-up not found." });
    }

    res.status(200).json({ message: "Follow-up deleted successfully." });
  } catch (error) {
    console.error("Error deleting follow-up:", error);
    res.status(500).json({ message: "Failed to delete follow-up." });
  }
});

module.exports = router;
