const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  lead_id: {
    // type: mongoose.Schema.Types.ObjectId,
    // ref: "Lead",
    type: String,
    required: false,
  },
  lead_name: { type: String, required: false },
  msg: { type: String, required: true },
  type: {
    type: String,
    enum: [
      "followup_reminder",
      "missed_followup",
      "lead_assigned",
      "new_remark",
      "ticket_raised",
      "status_changed",
      "inactivity",
      "bulk_upload",
      "lead_conversion",
      "lead_deleted",
      "system_alert",
    ],
    required: true,
  },
  lead_primary_category: {
    type: String,
    enum: ["", "sales", "support"],
    required: false,
  },
  lead_secondary_category: { type: String, required: false },
  timestamp: { type: Date, default: Date.now },
  expiry: { type: Date, default: () => Date.now() + 7 * 24 * 60 * 60 * 1000 }, // 1 week expiry
});

module.exports =
  mongoose.models.Notification ||
  mongoose.model("Notification", notificationSchema);

