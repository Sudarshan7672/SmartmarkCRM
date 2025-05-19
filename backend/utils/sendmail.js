const nodemailer = require("nodemailer");

const sendTicketEmail = async ({ name, issue, description }) => {
  try {
    // Create a transporter using your Gmail credentials
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,  // Your Gmail address
        pass: process.env.EMAIL_PASS,  // Gmail App password (not your actual Gmail password)
      },
    });

    // Define the email options
    const mailOptions = {
      from: `"Smartmark CRM Ticket System" <${process.env.MAIL_USER}>`,  // Sender's address
      to: process.env.ADMIN_EMAIL,  // The email address where you want to receive the ticket (could be your Gmail)
      subject: `🛠️ New Ticket Raised - ${issue}`,  // Subject of the email
      html: `
        <h2>New Ticket Raised</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Issue:</strong> ${issue}</p>
        <p><strong>Description:</strong></p>
        <p>${description.replace(/\n/g, "<br />")}</p>
        <hr />
        <p>This email was generated automatically by your CRM system.</p>
      `,  // Email body in HTML format
    };

    // Send the email
    await transporter.sendMail(mailOptions);
    console.log("Ticket email sent successfully.");
  } catch (error) {
    console.error("Error sending ticket email:", error);
    throw new Error("Failed to send ticket email.");
  }
};

module.exports = sendTicketEmail;
