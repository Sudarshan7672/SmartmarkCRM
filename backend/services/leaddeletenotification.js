const Notification = require("../models/notification");

const leadDeletedNotification = async ({ leadId, leadName, primaryCategory, secondaryCategory }) => {
  try {
    const msg = `${leadName} has been deleted from the system`;

    await Notification.create({
      lead_id: null, // Lead is deleted, so reference is null
      lead_name: leadName,
      msg,
      type: "lead_deleted",
      lead_primary_category: primaryCategory || "",
      lead_secondary_category: secondaryCategory || "",
    });
  } catch (error) {
    console.error("Failed to create lead deletion notification:", error.message);
  }
};

module.exports = leadDeletedNotification;
