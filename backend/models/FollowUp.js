const mongoose = require("mongoose");

const FollowUpSchema = new mongoose.Schema({
  leadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Lead", // Assuming you have a Lead model
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  followUpDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ["Pending", "Completed", "Rescheduled"],
    default: "Pending",
  },
  notes: {
    type: String,
    default: "",
  },
});

module.exports = mongoose.models.FollowUp || mongoose.model("FollowUp", FollowUpSchema);
