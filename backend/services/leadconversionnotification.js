const Notification = require("../models/notification");

const leadConversionNotification = async ({ leadId, leadName, primaryCategory, secondaryCategory }) => {
  try {
    const message = `${leadName} has been converted successfully.`;

    const notification = new Notification({
      lead_id: leadId,
      lead_name: leadName,
      msg: message,
      type: "lead_conversion",
      lead_primary_category: primaryCategory || "",
      lead_secondary_category: secondaryCategory || "",
    });

    await notification.save();
    // console.log("Lead conversion notification created successfully:", notification);
  } catch (error) {
    console.error("Failed to create lead conversion notification:", error.message);
  }
};

module.exports = leadConversionNotification;
