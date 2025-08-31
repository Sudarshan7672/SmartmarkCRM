const Leads = require("../models/lead");
const ExcelJS = require("exceljs");
const { Parser } = require("json2csv");
const PDFDocument = require("pdfkit");

exports.generateReport = async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      reportType,
      fileType = "xlsx",
      // Lead filters
      leadowner,
      status,
      territory,
      region,
      state,
      country,
      city,
      company,
      source,
      primaryCategory,
      secondaryCategory,
      leadFor,
      domesticOrExport,
      isFca,
      warrantyStatus,
      isDeleted,
      untouched,
      hasFollowups,
      hasRemarks,
    } = req.body;

    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ error: "Start and end dates are required" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const query = {
      created_at: { $gte: start, $lte: end },
    };

    // Apply filters only if they have values
    if (leadowner) query.leadowner = leadowner;
    if (status) query.status = status;
    if (territory) query.territory = territory;
    if (region) query.region = region;
    if (state) query.state = state;
    if (country) query.country = country;
    if (city) query.city = city;
    if (company) query.company = { $regex: company, $options: "i" };
    if (source) query.source = source;
    if (primaryCategory) query.primarycategory = primaryCategory;
    if (secondaryCategory) query.secondarycategory = secondaryCategory;
    if (leadFor) query.leadfor = leadFor;
    if (domesticOrExport) query.domesticorexport = domesticOrExport;
    if (isFca) query.isfca = isFca === "true";
    if (warrantyStatus) query.warrantystatus = warrantyStatus;
    if (isDeleted) query.isdeleted = isDeleted === "true";
    if (untouched) query.untouched = untouched === "true";

    // Complex filters for followups and remarks
    if (hasFollowups === "true") {
      // Lead has followups - this would need to be checked against FollowUp collection
      // For now, we'll skip this as it requires a join
    }
    if (hasRemarks === "true") {
      // Lead has remarks - check if remarks field is not empty
      query.remarks = { $exists: true, $ne: "", $ne: null };
    } else if (hasRemarks === "false") {
      query.$or = [
        { remarks: { $exists: false } },
        { remarks: "" },
        { remarks: null },
      ];
    }

    const leads = await Leads.find(query).lean();

    if (!leads.length) {
      return res
        .status(400)
        .json({ error: "No leads found for given criteria." });
    }

    // Filter lead fields based on reportType
    let fieldsToInclude = [];
    switch (reportType) {
      case "Comprehensive Report":
      case "comprehensive":
      case "all":
        fieldsToInclude = [
          "lead_id",
          "leadowner",
          "source",
          "fullname",
          "email",
          "contact",
          "whatsapp",
          "designation",
          "company",
          "address",
          "territory",
          "region",
          "state",
          "country",
          "requirements",
          "status",
          "primarycategory",
          "secondarycategory",
          "isfca",
          "re_enquired",
          "leadfor",
          "ivrticketcode",
          "isivrticketopen",
          "warrantystatus",
          "domesticorexport",
          "referredby",
          "referredto",
          "created_at",
          "updated_at",
        ];
        break;
      case "Source-wise Analysis":
      case "source":
        fieldsToInclude = [
          "lead_id",
          "leadowner",
          "source",
          "fullname",
          "email",
          "contact",
          "company",
          "territory",
          "primarycategory",
          "secondarycategory",
          "requirements",
          "leadfor",
          "ivrticketcode",
          "domesticorexport",
          "referredby",
          "referredto",
          "isfca",
          "status",
          "created_at",
        ];
        break;
      case "Status-wise Analysis":
      case "status":
        fieldsToInclude = [
          "lead_id",
          "leadowner",
          "source",
          "fullname",
          "contact",
          "email",
          "company",
          "territory",
          "primarycategory",
          "secondarycategory",
          "state",
          "requirements",
          "isfca",
          "re_enquired",
          "leadfor",
          "ivrticketcode",
          "status",
          "created_at",
          "updated_at",
        ];
        break;
      case "Territory-wise Analysis":
      case "territory":
        fieldsToInclude = [
          "lead_id",
          "leadowner",
          "fullname",
          "contact",
          "company",
          "address",
          "source",
          "territory",
          "primarycategory",
          "secondarycategory",
          "requirements",
          "region",
          "state",
          "country",
          "leadfor",
          "ivrticketcode",
          "status",
          "isfca",
          "created_at",
        ];
        break;
      case "Category-wise Analysis":
      case "category":
        fieldsToInclude = [
          "lead_id",
          "leadowner",
          "source",
          "fullname",
          "contact",
          "email",
          "company",
          "primarycategory",
          "secondarycategory",
          "requirements",
          "status",
          "territory",
          "region",
          "leadfor",
          "isfca",
          "created_at",
          "updated_at",
        ];
        break;
      case "Conversion Analysis":
      case "conversion":
        fieldsToInclude = [
          "lead_id",
          "leadowner",
          "source",
          "fullname",
          "contact",
          "email",
          "company",
          "primarycategory",
          "secondarycategory",
          "status",
          "requirements",
          "territory",
          "leadfor",
          "created_at",
          "updated_at",
        ];
        break;
      case "Follow-up Analysis":
      case "followup":
        fieldsToInclude = [
          "lead_id",
          "leadowner",
          "source",
          "fullname",
          "contact",
          "email",
          "company",
          "status",
          "primarycategory",
          "secondarycategory",
          "followups",
          "requirements",
          "created_at",
          "updated_at",
        ];
        break;
      case "Summary Report":
      case "summary":
        fieldsToInclude = [
          "lead_id",
          "leadowner",
          "source",
          "fullname",
          "contact",
          "company",
          "status",
          "primarycategory",
          "territory",
          "created_at",
        ];
        break;
      case "Audit Trail Report":
      case "audit":
        fieldsToInclude = [
          "lead_id",
          "leadowner",
          "fullname",
          "contact",
          "company",
          "status",
          "primarycategory",
          "secondarycategory",
          "updatelogs",
          "transferredtologs",
          "created_at",
          "updated_at",
        ];
        break;
      case "country":
        fieldsToInclude = [
          "lead_id",
          "leadowner",
          "source",
          "fullname",
          "email",
          "contact",
          "company",
          "country",
          "requirements",
          "status",
          "primarycategory",
          "secondarycategory",
          "re_enquired",
          "leadfor",
          "domesticorexport",
          "territory",
          "created_at",
        ];
        break;
      default:
        fieldsToInclude = [
          "lead_id",
          "leadowner",
          "source",
          "fullname",
          "email",
          "contact",
          "whatsapp",
          "designation",
          "company",
          "address",
          "territory",
          "region",
          "state",
          "country",
          "requirements",
          "status",
          "primarycategory",
          "secondarycategory",
          "isfca",
          "re_enquired",
          "leadfor",
          "ivrticketcode",
          "isivrticketopen",
          "warrantystatus",
          "domesticorexport",
          "referredby",
          "referredto",
          "created_at",
        ];
        break;
    }

    const filteredLeads = leads.map((lead) => {
      const filtered = {};
      for (const key of fieldsToInclude) {
        filtered[key] = lead[key];
      }
      return filtered;
    });

    // XLSX
    if (fileType === "xlsx") {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Leads Report");

      sheet.columns = fieldsToInclude.map((key) => ({
        header: key.toUpperCase(),
        key,
        width: 20,
      }));

      filteredLeads.forEach((lead) => sheet.addRow(lead));

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=lead_report.xlsx`
      );

      await workbook.xlsx.write(res);
      return res.end();

      // CSV
    } else if (fileType === "csv") {
      const parser = new Parser({ fields: fieldsToInclude });
      const csv = parser.parse(filteredLeads);

      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=lead_report.csv`
      );
      return res.send(csv);

      // PDF
    } else if (fileType === "pdf") {
      const doc = new PDFDocument();
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=lead_report.pdf`
      );

      doc.pipe(res);
      doc.fontSize(16).text("Lead Report", { align: "center" });
      doc.moveDown();

      filteredLeads.forEach((lead, index) => {
        doc.fontSize(10).text(`Lead ${index + 1}`);
        Object.entries(lead).forEach(([key, value]) => {
          doc.text(`${key}: ${value}`);
        });
        doc.moveDown();
      });

      doc.end();
    } else {
      return res.status(400).json({ error: "Invalid file type requested." });
    }
  } catch (error) {
    console.error("Report generation error:", error);
    return res
      .status(500)
      .json({ error: "Internal server error while generating report." });
  }
};
