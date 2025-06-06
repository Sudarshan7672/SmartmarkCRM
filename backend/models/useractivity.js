const mongoose = require('mongoose');

const UserActivitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  loginTime: { type: Date, required: true, default: Date.now },
  logoutTime: { type: Date }, // optional, will be set on logout
}, { timestamps: true });

module.exports = mongoose.model('UserActivity', UserActivitySchema);
