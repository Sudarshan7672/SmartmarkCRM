const Notification = require("../models/notification");

const sendLeadAssignmentNotification = async (
  lead,
  previousPrimaryCategory
) => {
  try {
    const assignedNow =
      lead.primarycategory &&
      (previousPrimaryCategory === "" || previousPrimaryCategory === undefined);

    if (!assignedNow) return;

    const msg = `Lead ${lead.fullname} (${lead.lead_id}) has been assigned to ${lead.primarycategory}.`;

    const notification = new Notification({
      lead_id: lead.lead_id,
      lead_name: `${lead.fullname}`,
      msg,
      type: "lead_assigned",
      lead_primary_category: lead.primarycategory || "",
      lead_secondary_category: lead.secondarycategory || "",
    });

    await notification.save();
  } catch (err) {
    console.error(
      "Failed to create lead assignment notification:",
      err.message
    );
  }
};

module.exports = sendLeadAssignmentNotification;
