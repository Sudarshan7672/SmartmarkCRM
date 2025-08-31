const Lead = require("../models/lead");
const Notification = require("../models/notification");

const generateInactivityNotifications = async () => {
  try {
    const now = new Date();

    // Condition 1: Inactive & unassigned for 4+ days
    const fourDaysAgo = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000);
    const leadsEvery4Days = await Lead.find({
      status: "New",
      primarycategory: "",
      secondarycategory: "",
      updated_at: { $lte: fourDaysAgo },
      isdeleted: false,
    });

    // Condition 2: Not updated for 2+ days but has a primary category
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
    const leadsEvery2Days = await Lead.find({
      status: "New",
      primarycategory: { $ne: "" },
      updated_at: { $lte: twoDaysAgo },
      isdeleted: false,
    });

    const allLeads = [...leadsEvery4Days, ...leadsEvery2Days];

    for (const lead of allLeads) {
      const existing = await Notification.findOne({
        lead_id: lead.lead_id,
        type: "inactivity",
        msg: { $regex: lead.fullname, $options: "i" }, // basic duplicate check
      });

      if (existing) continue;

      let msg = "";
      if (
        lead.status === "New" &&
        lead.primarycategory === "" &&
        lead.secondarycategory === ""
      ) {
        msg = `Lead ${lead.fullname} is inactive and unassigned from past 4 days.`;
      } else {
        msg = `Lead ${lead.fullname} is not updated from past 2 days.`;
      }

      const notification = new Notification({
        lead_id: lead.lead_id,
        lead_name: `${lead.fullname}`,
        msg,
        type: "inactivity",
        lead_primary_category: lead.primarycategory || "",
        lead_secondary_category: lead.secondarycategory || "",
      });

      await notification.save();
      console.log(`Inactivity notification saved for lead: ${lead.lead_id}`);
    }

    console.log(
      `Inactivity notifications created for ${allLeads.length} lead(s).`
    );
  } catch (error) {
    console.error("Error generating inactivity notifications:", error);
  }
};

module.exports = generateInactivityNotifications;
