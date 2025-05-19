const express = require("express");
const router = express.Router();
const sendTicketEmail = require("../utils/sendmail"); // Import the sendmail.js file
const raiseTicketNotification = require("../services/raiseticketnotification");

// Route to handle ticket submission
router.post("/new", async (req, res) => {
  const { name, issue, description } = req.body;
  console.log("Received ticket data:", req.body);

  // Validate that all required fields are provided
  if (!name || !issue || !description) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    // Send the ticket email using Nodemailer
    await sendTicketEmail({ name, issue, description });

    // 🔔 Create a ticket notification
    await raiseTicketNotification({ name, issue });
    res.status(200).json({ message: "Ticket submitted successfully and email sent." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send ticket email." });
  }
});

module.exports = router;
