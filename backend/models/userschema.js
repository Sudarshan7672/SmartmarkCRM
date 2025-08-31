// models/User.js

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    fullname: { type: String, required: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["SuperAdmin", "Admin", "CRM Manager", "Sales", "Support"],
      required: true,
    },
    assignedPrimaryCategories: [{ type: String }],
    assignedSecondaryCategories: [{ type: String }],
    cangeneratereportfor: [{ type: String }],
    can_add_individual_lead: { type: Boolean, default: false },
    can_add_bulk_lead: { type: Boolean, default: false },
    can_edit_lead: { type: Boolean, default: false },
    can_transfer_lead_department: { type: Boolean, default: false },
    can_transfer_lead_group: { type: Boolean, default: false },
    can_delete_lead: { type: Boolean, default: false },
    can_add_followup: { type: Boolean, default: false },
    can_edit_followup: { type: Boolean, default: false },
    can_delete_followup: { type: Boolean, default: false },
    can_add_remark: { type: Boolean, default: false },
    can_edit_remark: { type: Boolean, default: false },
    can_delete_remark: { type: Boolean, default: false },
    can_raise_ticket: { type: Boolean, default: false },
    can_generate_report: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// userSchema.pre('save', async function (next) {
//   if (!this.isModified('password')) return next();
//   try {
//     this.password = await bcrypt.hash(this.password, 10);
//     next();
//   } catch (err) {
//     next(err);
//   }
// });

// userSchema.methods.comparePassword = function (candidatePassword) {
//   return bcrypt.compare(candidatePassword, this.password);
// };

module.exports = mongoose.models.User || mongoose.model("User", userSchema);
