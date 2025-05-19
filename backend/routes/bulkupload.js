const express = require("express");
const multer = require("multer");
const XLSX = require("xlsx");
const router = express.Router();
const Lead = require("../models/lead");
const BulkActions = require("../models/bulkActions"); // Adjust path based on your project structure
const createBulkUploadNotification = require("../services/bulkleadnotification");

// Multer setup for in-memory file handling
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/bulk-upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    console.log("File uploaded:", req.file.originalname);

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);
    console.log("Data from file:", data);

    if (!data || data.length === 0) {
      return res.status(400).json({ message: "Empty or invalid file" });
    }

    const actualColumns = Object.keys(data[0]);
    const requiredColumns = [
      "leadowneremail",
      "source",
      "firstname",
      "lastname",
      "email",
      "contact",
    ];
    const missing = requiredColumns.filter(
      (col) => !actualColumns.includes(col)
    );
    if (missing.length > 0) {
      return res
        .status(400)
        .json({ message: `Missing columns: ${missing.join(", ")}` });
    }

    const leads = [];

    for (let row of data) {
      // Generate unique lead_id
      let lead_id;
      let exists = true;
      while (exists) {
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, "0");
        const day = String(currentDate.getDate()).padStart(2, "0");
        const randomDigits = Math.floor(100 + Math.random() * 900);
        lead_id = `SM${year}${month}${day}${randomDigits}`;
        exists = await Lead.findOne({ lead_id });
      }

      const existingLead = await Lead.findOne({
        $or: [{ email: row.email }, { contact: row.contact }],
      });

      if (existingLead) {
        leads.push({
          lead_id:lead_id,
          leadowneremail: row.leadowneremail,
          source: row.source,
          firstname: row.firstname,
          lastname: row.lastname,
          email: row.email,
          contact: row.contact,
          re_enquired: true,
        });
      } else {
        leads.push({
          lead_id: lead_id,
          leadowneremail: row.leadowneremail,
          source: row.source,
          firstname: row.firstname,
          lastname: row.lastname,
          email: row.email,
          contact: row.contact,
        });
      }
    }

    const validLeads = leads.filter(
      (lead) => lead.firstname && lead.lastname && lead.leadowneremail
    );

    if (validLeads.length === 0) {
      console.error("No valid leads to insert");
      return res
        .status(400)
        .json({ message: "No valid leads to insert (missing required fields)" });
    }

    try {
      const result = await Lead.insertMany(validLeads);
    //   console.log("Leads inserted successfully:", result.length);
    count = result.length;
    console.log(req.user)
    user = req.user.fullname || "Unknown User"; // Adjust based on your authentication method
      const bulkAction = new BulkActions({
        filename: req.file.originalname,
        uploadedby: user,
        count: count,
        stage: "completed",
      });
        await bulkAction.save();
        await createBulkUploadNotification({
          uploadedBy: user,
          count: result.length,
          filename: req.file.originalname,
        });
      return res.status(200).json({
        message: "Leads uploaded and saved successfully",
        count: result.length,
      });
    } catch (err) {
      console.error("Error inserting leads:", err);
      const bulkAction = new BulkActions({
        filename: req.file.originalname,
        uploadedby: user,
        count: 0,
        stage: "failed",
        error: err.message,
      });
      await bulkAction.save();
      return res.status(500).json({
        message: "Error inserting leads",
        error: err.message,
      });
    }
  } catch (error) {
    console.error("Bulk upload error:", error);
    return res.status(500).json({ message: "Server error during upload", error: error.message });
  }
});

router.get('/actions', async (req, res) => {
    try {
      const actions = await BulkActions.find().sort({ uploadAt: -1 }); // optional: limit or filter
      res.status(200).json({ actions });
    } catch (err) {
      res.status(500).json({ message: 'Failed to fetch actions', error: err.message });
    }
  });

module.exports = router;
