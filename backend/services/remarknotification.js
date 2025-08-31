const Notification = require("../models/notification");
const Lead = require("../models/lead");

const createRemarkNotification = async ({ lead_id, remarkby }) => {
  try {
    const lead = await Lead.findOne({
      lead_id: `${lead_id}`,
      isdeleted: false,
    });
    if (!lead) {
      console.error("Lead not found for notification.");
      return;
    }

    const leadName = `${lead.fullname}`;

    const notification = new Notification({
      lead_id: lead.lead_id,
      lead_name: leadName,
      msg: `New remark is added for the lead ${leadName} by the user ${remarkby}`,
      type: "new_remark",
      lead_primary_category: lead.primarycategory || "",
      lead_secondary_category: lead.secondarycategory || "",
      timestamp: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week
    });

    await notification.save();
    console.log("Remark notification created successfully:", notification);
  } catch (error) {
    console.error("Failed to create remark notification:", error.message);
  }
};

module.exports = createRemarkNotification;
