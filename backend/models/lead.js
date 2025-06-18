const { default: mongoose } = require("mongoose");
const { registerFont } = require("pdfkit");
const { Schema } = mongoose; // <-- add this line

const leadSchema = new mongoose.Schema({
  lead_id: {
    type: String,
    required: true,
  },
  leadowner: {
    type: String,
    required: false,
  },
  source: {
    type: String,
    required: true,
  },
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: false,
  },
  contact: {
    type: String, // Ensure it's stored as a string
    required: false,
  },
  whatsapp: {
    type: String,
    required: false,
    default: "",
  },
  designation: {
    type: String,
    required: false,
    default: "",
  },
  company: {
    type: String,
    required: false,
    default: "",
  },
  address: {
    type: String,
    required: false,
    default: "",
  },
  territory: {
    type: String,
    required: false,
    default: "",
  },
  region: {
    type: String,
    required: false,
    default: "",
  },
  state: {
    type: String,
    required: false,
    default: "",
  },
  country: {
    type: String,
    required: false,
    default: "",
  },
  requirements: {
    type: String,
    required: false,
    default: "",
  },
  status: {
    type: String,
    required: true,
    default: "New",
    enum: [
      "New",
      "Not-Connected",
      "Hot",
      "Cold",
      "Re-enquired",
      "Follow-up",
      "Converted",
      "Transferred-to-Dealer",
    ],
  },
  primarycategory: {
    type: String,
    required: false,
    default: "",
    enum: ["", "sales", "support"],
  },
  secondarycategory: {
    type: String,
    required: false,
    default: "",
    enum: [
      "",
      "group 1",
      "group 2",
      "group 3",
      "group 4",
      "group 5",
      "group 6",
    ],
  },
  isfca: {
    type: Boolean,
    required: false,
    default: false,
  },
  re_enquired: {
    type: Boolean,
    required: false,
    default: false,
  },
  leadfor: {
    type: String,
    required: false,
    default: "",
  },
  ivrticketcode: {
    type: String,
    required: false,
    default: "",
  },
  isivrticketopen:{
    type: Boolean,
    required: false,
    default: false,
  },
  warrantystatus: {
    type: String,
    required: false,
    default: "",
    enum: ["", "underwarranty", "notunderwarranty", "underamc"],
  },
  domesticorexport: {
    type: String,
    required: false,
    default: "",
    enum: ["", "domestic", "export"],
  },
  followups: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FollowUp",
    },
  ],
  remarks: {
    type: [
      {
        remark: String,
        remarkby: String,
        image: String,
        logtime: { type: Date, default: Date.now },
      },
    ],
    required: false,
    default: [],
  },
  updatelogs: {
    type: [
      {
        updatedby: { type: String, required: true },
        updatedfields: { type: [String], required: true },
        changes: [
          {
            field: { type: String },
            oldValue: { type: Schema.Types.Mixed },
            newValue: { type: Schema.Types.Mixed },
          },
        ],
        logtime: { type: Date, default: Date.now },
      },
    ],
    default: [],
  },

  transferredtologs: [
    {
      transferredto: {
        author: String,
        primarycategory: String,
        secondarycategory: String,
      },
      transferredby: {
        author: String,
        primarycategory: String,
        secondarycategory: String,
      },
      remark: String,
      logtime: Date,
    },
  ],
  notification_logs: {
    type: [
      {
        message: String,
        sent_at: { type: Date, default: Date.now },
      },
    ],
    default: [],
  },
  referredby: {
    type: String,
    required: false,
    default: "",
  },
  referredto: {
    type: String,
    required: false,
    default: "",
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});

// index for lead_id to ensure uniqueness
leadSchema.index({ lead_id: 1 }, { unique: true });
leadSchema.index({ leadowner: 1 });
leadSchema.index({ email: 1 });
leadSchema.index({ contact: 1 });
leadSchema.index({ territory: 1 });
leadSchema.index({ country: 1 });

leadSchema.index({ status: 1 });
leadSchema.index({ primarycategory: 1, secondarycategory: 1 });
leadSchema.index({ source: 1 });
leadSchema.index({ created_at: -1 });
leadSchema.index({ updated_at: -1 });

// Auto-update `updated_at` field before saving
leadSchema.pre("save", function (next) {
  this.updated_at = new Date();
  next();
});

leadSchema.pre("findOneAndUpdate", function (next) {
  this.set({ updated_at: new Date() });
  next();
});

// Delete follow-ups when a lead is deleted
leadSchema.pre("findOneAndDelete", async function (next) {
  const FollowUp = require("./FollowUp");
  const Notification = require("./Notification"); // Import your Notification model
  const lead = await this.model.findOne(this.getQuery());
  console.log("Lead to be deleted:", lead);
  console.log("Lead ID:", lead._id);

  if (lead) {
    // Delete follow-ups
    await FollowUp.deleteMany({ leadId: lead._id });

    // Delete notifications linked to this lead
    await Notification.deleteMany({ lead_id: lead.lead_id });
  }

  next();
});

module.exports =
  mongoose.models.Lead || mongoose.model("Lead", leadSchema, "leads");
