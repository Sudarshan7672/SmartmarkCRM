const Notification = require("../models/notification");

const createBulkUploadNotification = async ({ uploadedBy, count, filename }) => {
  const message = `${count} leads uploaded by ${uploadedBy} from file ${filename}`;
  
  const notification = new Notification({
    lead_id: null,
    lead_name: null,
    msg: message,
    type: "bulk_upload",
    lead_primary_category: "",
    lead_secondary_category: null,
    timestamp: new Date(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
  });

  await notification.save();
};

module.exports = createBulkUploadNotification;
