const express = require("express");
const Lead = require("../models/lead"); // Adjust path based on your project structure
const Notification = require("../models/notification");
const sendLeadAssignmentNotification = require("../services/leadassignmentnotification");
const FollowUp = require("../models/FollowUp"); // Adjust path based on your project structure
const router = express.Router();
const leadConversionNotification = require("../services/leadconversionnotification");
const leadDeletedNotification = require("../services/leaddeletenotification");

router.post("/add", async (req, res) => {
  try {
    const {
      leadowneremail,
      source,
      firstname,
      lastname,
      email,
      contact,
      whatsapp,
      designation,
      company,
      address,
      Zone,
      country,
      requirements,
      status,
      primarycategory,
      secondarycategory,
      isfca,
      followupdate, // ✅ Extract followupdate
      remarks,
      updatelogs,
      transferredtologs,
      notification_logs,
      referredby,
      referredto,
    } = req.body;

    console.log("req.body", req.body);

    // Validate required fields
    if (
      !leadowneremail ||
      !firstname ||
      !lastname ||
      !email ||
      !contact ||
      !source
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Convert contact & WhatsApp to String
    const contactString = contact ? String(contact) : "";
    const whatsappString = whatsapp ? String(whatsapp) : "";

    // Validate followupdate (ensure it's a valid date or null)
    const followUpDate = followupdate ? new Date(followupdate) : null;
    if (followUpDate && isNaN(followUpDate.getTime())) {
      return res.status(400).json({ error: "Invalid followupdate format" });
    }

    // Check if a lead with the same email, contact, or company exists
    const existingLead = await Lead.findOne({
      $or: [
        email ? { email } : null,
        contactString ? { contact: contactString } : null,
        whatsappString ? { whatsapp: whatsappString } : null,
      ].filter(Boolean),
    });

    let re_enquired = !!existingLead;

    // Generate Unique Lead ID
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const day = String(currentDate.getDate()).padStart(2, "0");
    const randomDigits = Math.floor(100 + Math.random() * 900);
    const lead_id = `SM${year}${month}${day}${randomDigits}`;

    const existingLeadId = await Lead.findOne({ lead_id });
    if (existingLeadId) {
      return res.status(500).json({ error: "Lead ID conflict, please retry" });
    }

    // Create new lead
    const newLead = new Lead({
      lead_id,
      leadowneremail,
      source,
      firstname,
      lastname,
      email,
      contact: contactString,
      whatsapp: whatsappString,
      designation,
      company,
      address,
      Zone,
      country,
      requirements,
      status: status || "New",
      primarycategory,
      secondarycategory,
      isfca,
      re_enquired,
      followups: followUpDate ? [{ followupdate: followUpDate }] : [], // ✅ Store follow-up date
      remarks: remarks || [],
      updatelogs: updatelogs || [],
      transferredtologs: transferredtologs || [],
      notification_logs: notification_logs || [],
      referredby,
      referredto,
      updated_at: new Date(),
    });

    // Save to database
    await newLead.save();
    if (newLead.primarycategory) {
      console.log("Primary Category:", newLead.primarycategory);
      await sendLeadAssignmentNotification(newLead, "");
    }    

    console.log("New Lead Added:", newLead);

    res.status(201).json({ message: "Lead added successfully", lead: newLead });
  } catch (error) {
    console.error("Error adding lead:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/update", async (req, res) => {
  try {
    const { _id, ...updateData } = req.body;
    console.log("req.body", req.body);

    if (!_id) {
      return res.status(400).json({ message: "Lead ID is required" });
    }
    const existingLead = await Lead.findById(_id);

    const updatedLead = await Lead.findByIdAndUpdate(_id, updateData, {
      new: true,
    });

    if (!updatedLead) {
      return res.status(404).json({ message: "Lead not found" });
    }
    if (updatedLead) {
      await sendLeadAssignmentNotification(updatedLead, existingLead.primarycategory);
    }

    // console.log("Updated Lead:", updatedLead);

    // ✅ Trigger notification if status is converted
    if (updatedLead.status === "Converted") {
      await leadConversionNotification({
        leadId: updatedLead.lead_id,
        leadName: `${updatedLead.firstname} ${updatedLead.lastname}`,
        primaryCategory: updatedLead.primarycategory,
        secondaryCategory: updatedLead.secondarycategory,
      });
    }

    // Clear inactivity notifications if the lead is updated
    await Notification.deleteMany({
      lead_id: updatedLead.lead_id,
      type: "inactivity",
    });

    res.status(200).json({ message: "Lead updated successfully", updatedLead });
  } catch (error) {
    console.error("Error updating lead:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/get-leads", async (req, res) => {
  try {
    const { status } = req.query;
    if (status === "Re-enquired") {
      const leads = await Lead.find({ re_enquired: true });
      // console.log("Leads:", leads);
      res.json(leads);
    } else {
      const query = status ? { status } : {}; // Filter by status if provided

      const leads = await Lead.find(query);
      // console.log("Leads:", leads);
      res.json(leads);
    }
  } catch (error) {
    console.error("Error fetching leads:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET /api/v1/leads/:id
router.get("/:id", async (req, res) => {
  console.log("Fetching lead with ID:", req.params.id);
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: "Lead not found" });

    res.status(200).json(lead);
  } catch (error) {
    console.error("Error fetching lead:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.delete("/delete/:leadId", async (req, res) => {
  try {
    const { leadId } = req.params;

    // Find and delete the lead, which will trigger the middleware
    const deletedLead = await Lead.findOneAndDelete({ lead_id: leadId });

    if (!deletedLead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    // Manually delete follow-ups in case middleware isn't working
    await FollowUp.deleteMany({ lead_id: deletedLead._id });

    // ✅ Trigger deletion notification
    await leadDeletedNotification({
      leadId: deletedLead._id,
      leadName: `${deletedLead.firstname} ${deletedLead.lastname}`,
      primaryCategory: deletedLead.primarycategory,
      secondaryCategory: deletedLead.secondarycategory,
    });

    res.json({ message: "Lead and related follow-ups deleted successfully" });
  } catch (error) {
    console.error("Error deleting lead:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
