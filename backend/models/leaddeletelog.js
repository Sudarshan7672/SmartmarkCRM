const mongoose = require("mongoose");
const { Schema } = mongoose;

const LeadDeleteLogSchema = new Schema({
  doc_id: { type: Schema.Types.ObjectId, ref: "Lead", required: true },
  lead_id: { type: String, required: true }, // Assuming this is a string representation of the lead ID
  leadName: { type: String },
  primaryCategory: { type: String },
  secondaryCategory: { type: String },
  deletedBy: { type: String, required: true },
  reason: { type: String, required: true },
  deletedAt: { type: Date, default: Date.now },
});

const LeadDeleteLog = mongoose.model("LeadDeleteLog", LeadDeleteLogSchema);
module.exports = LeadDeleteLog; // <-- ✅ This line was missing
