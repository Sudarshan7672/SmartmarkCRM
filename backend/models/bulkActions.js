// model for the bulk actions
const mongoose = require("mongoose");

const bulkActionSchema = new mongoose.Schema({
    filename: {
        type: String,
        required: true
    },
    uploadedat: {
        type: Date,
        required: false,
        default: Date.now
    },
    uploadedby: {
        type: String,
        required: true
    },
    count: {
        type: Number,
        required: true
    },
    stage: {
        type: String,
        enum: ["pending", "in-progress", "completed", "failed"],
        default: "pending"
    },
    error: {
        type: String,
        required: false,
        default: null
    },
});

module.exports = mongoose.model("BulkActions", bulkActionSchema);
