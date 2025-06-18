const express = require("express");
const multer = require("multer");
const XLSX = require("xlsx");
const router = express.Router();
const Lead = require("../models/lead");
const BulkActions = require("../models/bulkActions");
const createBulkUploadNotification = require("../services/bulkleadnotification"); // Adjust if needed

const upload = multer();

async function generateUniqueLeadId(existingIds, existingLeadIdsSet) {
  const now = new Date();
  const prefix = `SM${now.getFullYear()}${String(now.getMonth() + 1).padStart(
    2,
    "0"
  )}${String(now.getDate()).padStart(2, "0")}`;

  let newId;
  do {
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    newId = `${prefix}${randomDigits}`;
  } while (existingIds.has(newId) || existingLeadIdsSet.has(newId));

  existingIds.add(newId);
  return newId;
}

router.post("/bulk-upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Read file
    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);

    if (!data || data.length === 0) {
      return res.status(400).json({ message: "Empty or invalid file" });
    }

    // Validate required columns
    const actualColumns = Object.keys(data[0]);
    const requiredColumns = [
      "source",
      "leadfor",
      "territory",
      "firstname",
      "lastname",
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

    // Prepare duplicate check conditions
    const emailOrContactList = data
      .map((row) => {
        const conditions = [];
        if (row.email?.trim()) conditions.push({ email: row.email.trim() });
        if (row.contact?.toString().trim())
          conditions.push({ contact: row.contact.toString().trim() });
        return { $or: conditions };
      })
      .filter((cond) => cond.$or.length > 0);

    const existingLeads =
      emailOrContactList.length > 0
        ? await Lead.find({ $or: emailOrContactList }).lean()
        : [];

    const existingEmailSet = new Set(existingLeads.map((l) => l.email));
    const existingContactSet = new Set(existingLeads.map((l) => l.contact));

    // Get today's prefix
    const now = new Date();
    const todayPrefix = `SM${now.getFullYear()}${String(
      now.getMonth() + 1
    ).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;

    // Get already used lead_ids for today
    const existingLeadsToday = await Lead.find({
      lead_id: { $regex: `^${todayPrefix}` },
    })
      .select("lead_id")
      .lean();
    const existingLeadIdsSet = new Set(
      existingLeadsToday.map((l) => l.lead_id)
    );

    const usedIds = new Set();

    const leads = [];
    for (const row of data) {
      const lead_id = await generateUniqueLeadId(usedIds, existingLeadIdsSet);
      const isExisting =
        (row.email && existingEmailSet.has(row.email)) ||
        (row.contact && existingContactSet.has(row.contact));
      const ivrticketcodeexists =
        row.ivrticketcode && row.ivrticketcode.trim() !== "";
      leads.push({
        lead_id,
        source: row.source?.trim() || "",
        leadfor: row.leadfor?.trim() || "",
        territory: row.territory?.trim() || "",
        region: row.region?.trim() || "",
        firstname: row.firstname?.trim() || "",
        lastname: row.lastname?.trim() || "",
        contact: row.contact?.toString().trim() || "",
        email: row.email?.trim() || "",
        company: row.company?.trim() || "",
        ivrticketcode: row.ivrticketcode?.trim() || "",
        ...(isExisting ? { re_enquired: true } : {}),
        ...(ivrticketcodeexists ? { isivrticketopen: true } : {}),
      });
    }

    // Filter valid leads
    const validLeads = leads.filter(
      (lead) =>
        lead.firstname &&
        lead.lastname &&
        lead.contact &&
        lead.source &&
        lead.leadfor &&
        lead.territory
    );

    if (validLeads.length === 0) {
      return res
        .status(400)
        .json({
          message: "No valid leads to insert (missing required fields)",
        });
    }

    // Insert leads
    const insertedLeads = await Lead.insertMany(validLeads, { ordered: true });
    const count = insertedLeads.length;
    const user = req.user?.fullname || "Unknown User";

    // Log bulk upload
    await BulkActions.create({
      filename: req.file.originalname,
      uploadedby: user,
      count,
      stage: "completed",
    });

    // Send notification
    await createBulkUploadNotification({
      uploadedBy: user,
      count,
      filename: req.file.originalname,
    });

    return res.status(200).json({
      message: "Leads uploaded and saved successfully",
      count,
    });
  } catch (err) {
    console.error("Upload error:", err);
    await BulkActions.create({
      filename: req.file?.originalname || "unknown",
      uploadedby: req.user?.fullname || "Unknown User",
      count: 0,
      stage: "failed",
      error: err.message,
    });

    return res
      .status(500)
      .json({ message: "Server error during upload", error: err.message });
  }
});

router.get("/actions", async (req, res) => {
  try {
    const actions = await BulkActions.find().sort({ uploadAt: -1 });
    res.status(200).json({ actions });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch actions", error: err.message });
  }
});

module.exports = router;
