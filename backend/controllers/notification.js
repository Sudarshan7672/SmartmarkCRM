const cron = require("node-cron");
const Lead = require("../models/lead"); // Adjust path based on your project structure
const nodemailer = require("nodemailer");
require("dotenv").config(); // Load environment variables

// Email transporter (Configure this with your email service)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Function to check untouched leads, send notifications, and log them
const checkUntouchedLeads = async () => {
  try {
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    // Find leads that have not been updated in 24 hours
    const untouchedLeads = await Lead.find({ updated_at: { $lt: twentyFourHoursAgo } });

    if (untouchedLeads.length > 0) {
      console.log(`Found ${untouchedLeads.length} untouched leads.`);

      // Process all leads concurrently
      await Promise.all(
        untouchedLeads.map(async (lead) => {
          if (!lead.leadowneremail) {
            console.warn(`Lead ID ${lead.lead_id} has no leadowneremail. Skipping.`);
            return;
          }

          const mailOptions = {
            from: process.env.EMAIL_USER,
            to: lead.leadowneremail, // Send notification to lead owner
            subject: "Lead Not Updated in 24 Hours",
            text: `Hello, your lead with ID ${lead.lead_id} has not been updated for 24 hours. Please review it.`,
          };

          try {
            await transporter.sendMail(mailOptions);
            console.log(`Notification sent for lead ID: ${lead.lead_id} to ${lead.leadowneremail}`);

            // Log the notification inside the lead document
            lead.notification_logs.push({
              message: `Notification sent to ${lead.leadowneremail} for lead ID: ${lead.lead_id}`,
              sent_at: new Date(),
            });

            await lead.save(); // Save the lead with the new notification log
          } catch (error) {
            console.error(`Failed to send email for lead ID: ${lead.lead_id}`, error);
          }
        })
      );
    } else {
      console.log("No untouched leads found.");
    }
  } catch (error) {
    console.error("Error checking untouched leads:", error);
  }
};

// Schedule the cron job to run every hour
cron.schedule("*/10 * * * *", () => {
  console.log("Running check for untouched leads...");
  checkUntouchedLeads();
});

module.exports = checkUntouchedLeads;
