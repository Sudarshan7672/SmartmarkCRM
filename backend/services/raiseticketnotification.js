const Notification = require("../models/notification");
const Lead = require("../models/lead");

const raiseTicketNotification = async ({ name, issue }) => {
  try {
    // Attempt to find the lead using the name
    const lead = await Lead.findOne({
      $or: [
        { firstname: new RegExp(name.split(" ")[0], "i") },
        { lastname: new RegExp(name.split(" ")[1] || "", "i") },
      ],
    });

    const message = `${name} has raised a ticket for the issue "${issue}".`;

    const notification = new Notification({
    //   lead_id: lead ? lead._id : undefined,
      lead_name: name,
      msg: message,
      type: "ticket_raised",
      lead_primary_category: lead?.primary_category || "",
      lead_secondary_category: lead?.secondary_category || "",
    });

    await notification.save();
    console.log("Ticket raised notification created");
  } catch (error) {
    console.error("Failed to create ticket raised notification:", error.message);
  }
};

module.exports = raiseTicketNotification;
