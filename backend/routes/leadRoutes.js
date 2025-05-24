const express = require("express");
const Lead = require("../models/lead"); // Adjust path based on your project structure
const Notification = require("../models/notification");
const sendLeadAssignmentNotification = require("../services/leadassignmentnotification");
const FollowUp = require("../models/FollowUp"); // Adjust path based on your project structure
const router = express.Router();
const leadConversionNotification = require("../services/leadconversionnotification");
const leadDeletedNotification = require("../services/leaddeletenotification");
const { isAuthenticated } = require("../passportconfig");
const LeadDeleteLog = require("../models/leadDeleteLog"); // Adjust path based on your project structure
const { logLeadTransfer } = require("../services/transferLogsService");

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

router.put("/update", isAuthenticated, async (req, res) => {
  console.log("Updating lead with ID:", req.body._id);
  try {
    const { _id, ...updateData } = req.body;
    const role = req.user?.role;
    const user = req.user;

    if (!_id) {
      return res.status(400).json({ message: "Lead ID is required" });
    }

    // Fetch existing lead
    const existingLead = await Lead.findById(_id);
    if (!existingLead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    // Track changes manually before update for logging
    const updatedFields = [];
    const changes = [];

    for (const key in updateData) {
      if (updateData.hasOwnProperty(key)) {
        // For arrays or objects, you might want to do a JSON string compare (simplest deep compare)
        const oldVal = existingLead[key];
        const newVal = updateData[key];
        let changed = false;

        if (Array.isArray(oldVal) && Array.isArray(newVal)) {
          changed = JSON.stringify(oldVal) !== JSON.stringify(newVal);
        } else if (typeof oldVal === "object" && oldVal !== null && typeof newVal === "object" && newVal !== null) {
          changed = JSON.stringify(oldVal) !== JSON.stringify(newVal);
        } else {
          changed = oldVal !== newVal;
        }

        if (changed) {
          updatedFields.push(key);
          changes.push({
            field: key,
            oldValue: oldVal,
            newValue: newVal,
          });
        }
      }
    }

    // Now update the lead document's fields manually, for better control
    for (const field of updatedFields) {
      existingLead[field] = updateData[field];
    }

    // 🔁 Transfer log logic (unchanged, just minor fix)
    const oldPrimary = existingLead.primarycategory || "";
    const oldPrimaryNormalized = oldPrimary.toLowerCase();
    const roleNormalized = (role || "").toLowerCase();
    const oldSecondary = existingLead.secondarycategory || "";

    const isSameRole = oldPrimaryNormalized === roleNormalized;
    const isTransferred =
      oldPrimary &&
      updateData.hasOwnProperty("primarycategory") &&
      updateData.primarycategory !== oldPrimary;

    if (isTransferred && isSameRole) {
      await logLeadTransfer(existingLead.lead_id, {
        transferredby: {
          author: user.fullname || "unknown",
          primarycategory: oldPrimary,
          secondarycategory: oldSecondary,
        },
        transferredto: {
          author: updateData.primarycategory || "unknown",
          primarycategory: updateData.primarycategory,
          secondarycategory: updateData.secondarycategory || "",
        },
        remark: updateData.remark || "",
      });
    }

    // Add update log if anything changed
    if (updatedFields.length > 0) {
      existingLead.updatelogs = existingLead.updatelogs || [];
      existingLead.updatelogs.push({
        updatedby: user.fullname || "unknown",
        updatedfields: updatedFields,
        changes,
        logtime: new Date(),
      });
    }

    // Save the updated lead (with changes and logs)
    const updatedLead = await existingLead.save();

    // 🔔 Notifications
    await sendLeadAssignmentNotification(updatedLead, oldPrimary);

    if (updatedLead.status === "Converted") {
      await leadConversionNotification({
        leadId: updatedLead.lead_id,
        leadName: `${updatedLead.firstname} ${updatedLead.lastname}`,
        primaryCategory: updatedLead.primarycategory,
        secondaryCategory: updatedLead.secondarycategory,
      });
    }

    // 🧹 Clear inactivity notifications if updated
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
    // console.log("Fetching leads with status:", status);
    // console.log(status);
    // console.log("User Role:", req.user?.role);

    // Use req.user for the logged-in user
    const user = req.user;

    // Define the role-based filter
    let roleFilter = {};
    // console.log("User Role:", user?.role);
    if (user?.role === "Sales") {
      roleFilter = { primarycategory: "sales" };
    } else if (user?.role === "Support") {
      roleFilter = { primarycategory: "support" };
    }

    // Status filter
    let statusFilter = {};
    if (status && status !== "All") {
      if (status === "Re-enquired") {
        statusFilter = { re_enquired: true };
      } else {
        statusFilter = { status };
      }
    }

    // Combine filters
    const query = { ...roleFilter, ...statusFilter };
    console.log("MongoDB query:", query);


    // Fetch leads
    const leads = await Lead.find(query);
    // console.log("Leads fetched:", leads);

    // Also compute counts for each status (based on role filter only)
    const statuses = [
      "New",
      "Not-Connected",
      "Hot",
      "Cold",
      "Re-enquired",
      "Follow-up",
      "Converted",
      "Transferred-to-Dealer",
    ];

    const statusCounts = {};
    for (const s of statuses) {
      let countFilter = { ...roleFilter };
      if (s === "Re-enquired") {
        countFilter.re_enquired = true;
      } else {
        countFilter.status = s;
      }

      statusCounts[s] = await Lead.countDocuments(countFilter);
    }

    res.json({ leads, statusCounts });
  } catch (error) {
    console.error("Error fetching leads:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/search-leads", async (req, res) => {
  const { query } = req.query;
  const userRole = req.user?.role; // Assuming Passport or middleware sets req.user

  console.log("Search query:", query);

  if (!query) {
    return res.status(400).json({ error: "Query parameter is required" });
  }

  try {
    const regex = new RegExp(query, "i"); // case-insensitive

    // Basic search conditions
    const baseConditions = {
      $or: [
        { lead_name: regex },
        { email: regex },
        { contact: regex },
        { lead_id: regex },
      ],
    };

    // Add role-based condition
    if (userRole === "Sales") {
      baseConditions.primarycategory = "sales";
    }
    if (userRole === "Support") {
      baseConditions.primarycategory = "support";
    }

    const leads = await Lead.find(baseConditions);
    res.json(leads);
  } catch (err) {
    console.error("Search error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/v1/leads/:id
router.get("/id/:id", async (req, res) => {
  console.log("Fetching lead with ID:", req.params.id);
  console.log("Lafda");
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
    const { reason } = req.body;
    console.log("Deleting lead with ID:", leadId);

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
    console.log(req.user);
    // Log the deletion in LeadDeleteLog
    await LeadDeleteLog.create({
      doc_id: deletedLead._id,
      lead_id: deletedLead?.lead_id,
      leadName: `${deletedLead?.firstname} ${deletedLead?.lastname}`,
      primaryCategory: deletedLead?.primarycategory,
      secondaryCategory: deletedLead?.secondarycategory,
      deletedBy: req.user?.fullname || "unknown",
      reason: reason || "No reason provided",
    });

    res.json({ message: "Lead and related follow-ups deleted successfully" });
  } catch (error) {
    console.error("Error deleting lead:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET all lead delete logs
router.get("/get-delete-logs", async (req, res) => {
  try {
    console.log("Fetching all lead delete logs");
    const logs = await LeadDeleteLog.find().sort({ deletedAt: -1 }); // Most recent first
    res.json(logs);
  } catch (error) {
    console.error("Error fetching delete logs:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;

module.exports = router;
