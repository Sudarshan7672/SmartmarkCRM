// File: controllers/reportController.js

const Lead = require("../models/lead");
const ExcelJS = require("exceljs");

const generateReport = async (req, res) => {
  try {
    const { startDate, endDate, reportType } = req.body;
    console.log("Received report request:", req.body);

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // include entire day

    const leads = await Lead.find({
      created_at: {
        $gte: start,
        $lte: end,
      },
    }).lean();

    if (!leads || leads.length === 0) {
      return res.status(404).json({ message: "No leads found in selected range." });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Leads Report");

    if (reportType === "source") {
      worksheet.columns = [
        { header: "Source", key: "source", width: 20 },
        { header: "Lead ID", key: "lead_id", width: 20 },
        { header: "Owner Email", key: "leadowneremail", width: 25 },
        { header: "Created At", key: "created_at", width: 20 }
      ];

      leads.forEach((lead) => {
        worksheet.addRow({
          source: lead.source,
          lead_id: lead.lead_id,
          leadowneremail: lead.leadowneremail,
          created_at: new Date(lead.created_at).toLocaleString(),
        });
      });
    } else if (reportType === "status") {
      worksheet.columns = [
        { header: "Status", key: "status", width: 20 },
        { header: "Lead ID", key: "lead_id", width: 20 },
        { header: "Owner Email", key: "leadowneremail", width: 25 },
        { header: "Created At", key: "created_at", width: 20 }
      ];

      leads.forEach((lead) => {
        worksheet.addRow({
          status: lead.status,
          lead_id: lead.lead_id,
          leadowneremail: lead.leadowneremail,
          created_at: new Date(lead.created_at).toLocaleString(),
        });
      });
    } else {
      worksheet.columns = [
        { header: "Lead ID", key: "lead_id", width: 20 },
        { header: "Owner Email", key: "leadowneremail", width: 25 },
        { header: "Source", key: "source", width: 15 },
        { header: "First Name", key: "firstname", width: 15 },
        { header: "Last Name", key: "lastname", width: 15 },
        { header: "Email", key: "email", width: 25 },
        { header: "Contact", key: "contact", width: 15 },
        { header: "WhatsApp", key: "whatsapp", width: 15 },
        { header: "Designation", key: "designation", width: 20 },
        { header: "Company", key: "company", width: 20 },
        { header: "Address", key: "address", width: 25 },
        { header: "Zone", key: "Zone", width: 10 },
        { header: "Country", key: "country", width: 15 },
        { header: "Requirements", key: "requirements", width: 30 },
        { header: "Status", key: "status", width: 15 },
        { header: "Primary Category", key: "primarycategory", width: 20 },
        { header: "Secondary Category", key: "secondarycategory", width: 20 },
        { header: "Is FCA", key: "isfca", width: 10 },
        { header: "Re-enquired", key: "re_enquired", width: 15 },
        { header: "Referred By", key: "referredby", width: 20 },
        { header: "Referred To", key: "referredto", width: 20 },
        { header: "Created At", key: "created_at", width: 20 },
        { header: "Updated At", key: "updated_at", width: 20 },
      ];

      leads.forEach((lead) => {
        worksheet.addRow({
          ...lead,
          created_at: new Date(lead.created_at).toLocaleString(),
          updated_at: new Date(lead.updated_at).toLocaleString(),
        });
      });
    }

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=leads-report.xlsx");

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Error generating report:", error);
    res.status(500).json({ message: "Failed to generate report" });
  }
};

module.exports = { generateReport };