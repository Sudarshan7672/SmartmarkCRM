const express = require("express");
const router = express.Router();
const Notification = require("../models/notification");
const { isAuthenticated } = require("../passportconfig");

router.get("/", isAuthenticated, async (req, res) => {
  try {
    const userRole = req.user.role;
    const userPrimaryCategory = req.user.primaryCategory || ""; // assuming you store user primary category

    let filter = {};

    if (userRole === "Sales") {
      // Sales users see notifications with primaryCategory "sales"
      // and specific types relevant to sales
      filter = {
        lead_primary_category: "sales",
        type: { $in: ["followup_reminder", "missed_followup", "lead_assignment", "inactivity"] },
      };
    } else if (userRole === "Support") {
      // Support users see notifications with primaryCategory "support"
      filter = {
        lead_primary_category: "support",
        type: { $in: ["followup_reminder", "missed_followup", "lead_assignment", "inactivity"] },
      };
    } else if (["Admin", "CRM Manager", "SuperAdmin"].includes(userRole)) {
      // Admin and others see all notifications, no filter needed
      filter = {};
    } else {
      // For other roles or unknown, send empty array or restrict access
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const notifications = await Notification.find(filter).sort({ timestamp: -1 });
    res.status(200).json({ success: true, notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
