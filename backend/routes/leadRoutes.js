const express = require("express");
const Lead = require("../models/lead"); // Adjust path based on your project structure
const Notification = require("../models/notification");
const sendLeadAssignmentNotification = require("../services/leadassignmentnotification");
const FollowUp = require("../models/FollowUp"); // Adjust path based on your project structure
const router = express.Router();
const leadConversionNotification = require("../services/leadconversionnotification");
const leadDeletedNotification = require("../services/leaddeletenotification");
const { isAuthenticated } = require("../passportconfig");
const LeadDeleteLog = require("../models/leaddeletelog"); // Adjust path based on your project structure
const { logLeadTransfer } = require("../services/transferLogsService");

router.post("/add", async (req, res) => {
  try {
    const {
      leadowner,
      source,
      firstname,
      lastname,
      email,
      contact,
      whatsapp,
      designation,
      company,
      address,
      territory,
      state,
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
      !leadowner ||
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
      leadowner,
      source,
      firstname,
      lastname,
      email,
      contact: contactString,
      whatsapp: whatsappString,
      designation,
      company,
      address,
      territory,
      state,
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
    const { _id, ...updated_data } = req.body;
    console.log("Updated data:", updated_data);
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

    for (const key in updated_data) {
      if (updated_data.hasOwnProperty(key)) {
        // For arrays or objects, you might want to do a JSON string compare (simplest deep compare)
        const oldVal = existingLead[key];
        const newVal = updated_data[key];
        let changed = false;

        if (Array.isArray(oldVal) && Array.isArray(newVal)) {
          changed = JSON.stringify(oldVal) !== JSON.stringify(newVal);
        } else if (
          typeof oldVal === "object" &&
          oldVal !== null &&
          typeof newVal === "object" &&
          newVal !== null
        ) {
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
      existingLead[field] = updated_data[field];
    }

    // 🔁 Transfer log logic (unchanged, just minor fix)
    const oldPrimary = existingLead.primarycategory || "";
    const oldPrimaryNormalized = oldPrimary.toLowerCase();
    const roleNormalized = (role || "").toLowerCase();
    const oldSecondary = existingLead.secondarycategory || "";

    const isSameRole = oldPrimaryNormalized === roleNormalized;
    const isTransferred =
      oldPrimary &&
      updated_data.hasOwnProperty("primarycategory") &&
      updated_data.primarycategory !== oldPrimary;

    if (isTransferred && isSameRole) {
      await logLeadTransfer(existingLead.lead_id, {
        transferredby: {
          author: user.fullname || "unknown",
          primarycategory: oldPrimary,
          secondarycategory: oldSecondary,
        },
        transferredto: {
          author: updated_data.primarycategory || "unknown",
          primarycategory: updated_data.primarycategory,
          secondarycategory: updated_data.secondarycategory || "",
        },
        remark: updated_data.remark || "",
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
    const { status, filters, page = 1, limit = 20 } = req.query;

    // Parse filters safely
    let parsedFilters = {};
    if (filters) {
      try {
        parsedFilters = JSON.parse(filters);
        console.log("Parsed filters:", parsedFilters);
      } catch (err) {
        console.warn("Invalid filters JSON, ignoring filters");
      }
    }

    const user = req.user;
    let roleFilter = {};
    if (user?.role === "Support") {
      roleFilter.primarycategory = "support";
      if (user?.fullname === "Aakansha Rathod") {
        roleFilter.secondarycategory = { $in: ["group 5", "group 6"] };
        roleFilter.leadowner = { $in: ["Aakansha Rathod"] };
      }
    } else if (user?.role === "Sales") {
      roleFilter.primarycategory = "sales";
      if (user?.fullname === "Prathamesh Mane") {
        roleFilter.secondarycategory = { $in: ["group 2"] };
        roleFilter.leadowner = { $in: ["Prathamesh Mane"] };
      }
      if (user?.fullname === "Bharat Kokatnur") {
        roleFilter.secondarycategory = { $in: ["group 4"] };
        roleFilter.leadowner = { $in: ["Bharat Kokatnur"] };
      }
    } else if (["CRM Manager", "Admin", "SuperAdmin"].includes(user?.role)) {
      roleFilter.primarycategory = { $in: ["", "sales", "support"] };
    }

    // Status filter
    let statusFilter = {};
    if (status && status !== "All") {
      if (status === "Re-enquired") {
        statusFilter.re_enquired = true;
      } else {
        statusFilter.status = status;
      }
    }

    // Build main query
    const query = { ...roleFilter, ...statusFilter };

    // Additional filters
    if (parsedFilters.primarycategory?.trim()) {
      query.primarycategory = parsedFilters.primarycategory.trim();
    }
    if (parsedFilters.secondarycategory?.trim()) {
      query.secondarycategory = parsedFilters.secondarycategory.trim();
    }
    if (parsedFilters.leadowner?.trim()) {
      query.leadowner = parsedFilters.leadowner.trim();
    }
    if (parsedFilters.source?.trim()) {
      query.source = parsedFilters.source.trim();
    }

    if (parsedFilters.untouchedLeads === true) {
      query.$expr = {
        $lte: [{ $abs: { $subtract: ["$created_at", "$updated_at"] } }, 10000],
      };
    }

    // Date filters
    if (parsedFilters.createdDateFrom?.trim()) {
      query.created_at = query.created_at || {};
      query.created_at.$gte = new Date(parsedFilters.createdDateFrom);
    }
    if (parsedFilters.createdDateTo?.trim()) {
      query.created_at = query.created_at || {};
      const toDate = new Date(parsedFilters.createdDateTo);
      toDate.setHours(23, 59, 59, 999);
      query.created_at.$lte = toDate;
    }
    if (parsedFilters.updatedDateFrom?.trim()) {
      query.updated_at = query.updated_at || {};
      query.updated_at.$gte = new Date(parsedFilters.updatedDateFrom);
    }
    if (parsedFilters.updatedDateTo?.trim()) {
      query.updated_at = query.updated_at || {};
      const toDate = new Date(parsedFilters.updatedDateTo);
      toDate.setHours(23, 59, 59, 999);
      query.updated_at.$lte = toDate;
    }
    if (parsedFilters.reenquiredDateFrom || parsedFilters.reenquiredDateTo) {
      query.created_at = query.created_at || {};
      if (parsedFilters.reenquiredDateFrom?.trim()) {
        query.created_at.$gte = new Date(parsedFilters.reenquiredDateFrom);
      }
      if (parsedFilters.reenquiredDateTo?.trim()) {
        const toDate = new Date(parsedFilters.reenquiredDateTo);
        toDate.setHours(23, 59, 59, 999);
        query.created_at.$lte = toDate;
      }
      query.re_enquired = true;
    }

    // Lead age filters (created_at days ago)
    if (parsedFilters.leadAgeFrom !== "" && !isNaN(parsedFilters.leadAgeFrom)) {
      const dateLimit = new Date();
      dateLimit.setDate(
        dateLimit.getDate() - Number(parsedFilters.leadAgeFrom)
      );
      query.created_at = query.created_at || {};
      query.created_at.$lte = dateLimit;
    }
    if (parsedFilters.leadAgeTo !== "" && !isNaN(parsedFilters.leadAgeTo)) {
      const dateLimit = new Date();
      dateLimit.setDate(dateLimit.getDate() - Number(parsedFilters.leadAgeTo));
      query.created_at = query.created_at || {};
      query.created_at.$gte = dateLimit;
    }

    // recentCount filters — these are used later for slicing, but also applied to query here for initial fetch
    // if (
    //   parsedFilters.recentCountFrom !== "" &&
    //   !isNaN(parsedFilters.recentCountFrom)
    // ) {
    //   const fromDate = new Date();
    //   fromDate.setDate(fromDate.getDate() - Number(parsedFilters.recentCountFrom));
    // }
    // if (
    //   parsedFilters.recentCountTo !== "" &&
    //   !isNaN(parsedFilters.recentCountTo)
    // ) {
    //   const toDate = new Date();
    //   toDate.setDate(toDate.getDate() - Number(parsedFilters.recentCountTo));
    // }

    console.log("Final query:", query);

    // Pagination params
    const pageNum = Math.max(parseInt(page) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit) || 20, 1), 100);
    const skip = (pageNum - 1) * limitNum;

    // Fetch all filtered leads from DB (no pagination)
    let allLeads = await Lead.find(query).sort({ created_at: -1 }).exec();

    // Parse recentCount slicing params
    const from = Number(parsedFilters.recentCountFrom) || 0;
    const to = Number(parsedFilters.recentCountTo);
    // If recentCountTo not provided or invalid, set to length of allLeads to slice till end
    const sliceTo = !isNaN(to) ? to : allLeads.length;

    // Slice leads based on recentCount range if any filter exists
    let slicedLeads =
      parsedFilters.recentCountFrom !== "" || parsedFilters.recentCountTo !== ""
        ? allLeads.slice(from, sliceTo)
        : allLeads;

    // Compute status counts on slicedLeads if slicing applied, else on allLeads
    const leadsForStatusCount = slicedLeads;

    const statusCounts = {
      New: 0,
      "Not-Connected": 0,
      Hot: 0,
      Cold: 0,
      "Re-enquired": 0,
      "Follow-up": 0,
      Converted: 0,
      "Transferred-to-Dealer": 0,
    };

    for (const lead of leadsForStatusCount) {
      const statusKey = lead.re_enquired
        ? "Re-enquired"
        : lead.status || "Unknown";
      if (statusCounts.hasOwnProperty(statusKey)) {
        statusCounts[statusKey]++;
      }
    }

    // Paginate sliced leads
    const paginatedLeads = slicedLeads.slice(skip, skip + limitNum);

    // Final total count and total pages based on sliced leads
    const totalCount = slicedLeads.length;
    const totalPages = Math.ceil(totalCount / limitNum);

    console.log("Leads after slicing + pagination:", paginatedLeads.length);

    res.json({
      leads: paginatedLeads,
      statusCounts,
      totalCount,
      totalPages,
    });
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
        { firstname: regex },
        { lastname: regex },
        { source: regex },
        { company: regex },
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

// GET /api/v1/leads/followups/:id
router.get("/followups/:id", async (req, res) => {
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
