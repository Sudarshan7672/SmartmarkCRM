const FollowUp = require("../models/FollowUp");
const Lead = require("../models/lead");
const Notification = require("../models/notification");

const generateFollowUpNotifications = async () => {
  try {
    const now = new Date();
    const today = new Date(now.setHours(0, 0, 0, 0));
    const tomorrow = new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000);
    console.log("tomorrow:", tomorrow);

    // Working hours check (9 AM to 6 PM)
    const currentHour = new Date().getHours();
    if (currentHour < 9 || currentHour >= 18) {
      console.log("Outside working hours. Skipping follow-up notifications.");
      return;
    }

    // Fetch follow-ups that are pending and either missed or upcoming (today/tomorrow)
    const followups = await FollowUp.find({
      status: "Pending",
      followUpDate: { $lte: tomorrow },
    });
    console.log("Follow-ups fetched:", followups.length);

    for (const followup of followups) {
      const lead = await Lead.findById(followup.leadId);
      if (!lead) continue;

      const followUpDate = new Date(followup.followUpDate);
      const isMissed = followUpDate < today;
      const isUpcoming = followUpDate >= today && followUpDate <= tomorrow;

      if (!isMissed && !isUpcoming) continue;

      // Deduplicate: remove previous notifications for the same follow-up
      await Notification.deleteMany({
        type: { $in: ["followup_reminder", "missed_followup"] },
        lead_id: lead._id,
        msg: new RegExp(followup.title, "i"),
      });

      const type = isMissed ? "missed_followup" : "followup_reminder";
      const whenText = isMissed ? "missed" : "has an upcoming";

      const msg = `Lead ${lead.fullname} (${lead.lead_id}) ${whenText} follow-up: "${followup.title}".`;

      const notification = new Notification({
        lead_id: lead._id,
        lead_name: `${lead.fullname}`,
        msg,
        type,
        lead_primary_category: lead.primarycategory || "",
        lead_secondary_category: lead.secondarycategory || "",
      });

      await notification.save();
    }

    console.log("Follow-up notifications generated.");
  } catch (error) {
    console.error("Error generating follow-up notifications:", error);
  }
};

module.exports = generateFollowUpNotifications;
