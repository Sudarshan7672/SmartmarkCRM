// services/transferLogsService.js

const Lead = require("../models/lead");

/**
 * Appends a new entry to the transferredtologs array of a specific lead.
 *
 * @param {String} leadId - The custom lead identifier (not MongoDB _id).
 * @param {Object} transferDetails - Details about the transfer.
 * @param {Object} transferDetails.transferredto - Recipient info.
 * @param {Object} transferDetails.transferredby - Initiator info.
 * @param {String} transferDetails.remark - Reason for transfer.
 * @returns {Object} - Updated lead document or throws error.
 */
const logLeadTransfer = async (leadId, transferDetails) => {
  try {
    const lead = await Lead.findOne({ lead_id: leadId });

    if (!lead) {
      throw new Error("Lead not found");
    }

    // Validate input (optional)
    if (!transferDetails?.transferredto || !transferDetails?.transferredby) {
      throw new Error("Incomplete transfer details");
    }

    // Append transfer log
    lead.transferredtologs.push({
      transferredto: transferDetails.transferredto,
      transferredby: transferDetails.transferredby,
      remark: transferDetails.remark || "",
      logtime: new Date(),
    });

    // Optionally update lead's categories
    if (transferDetails.transferredto.primarycategory) {
      lead.primarycategory = transferDetails.transferredto.primarycategory;
    }
    if (transferDetails.transferredto.secondarycategory) {
      lead.secondarycategory = transferDetails.transferredto.secondarycategory;
    }

    await lead.save();
    return lead;
  } catch (error) {
    console.error("Error in logLeadTransfer service:", error.message);
    throw error;
  }
};

module.exports = { logLeadTransfer };
