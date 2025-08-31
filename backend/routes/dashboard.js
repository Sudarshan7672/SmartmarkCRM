// routes/dashboard.js
const express = require("express");
const router = express.Router();
const Lead = require("../models/lead"); // Adjust path if needed
const FollowUp = require("../models/FollowUp");
const { isAuthenticated } = require("../passportconfig");

// Helper function to get leadowner match condition based on user role
const getLeadOwnerMatchCondition = async (req, userId) => {
  let matchCondition = {};

  if (req.user && (req.user.role === "Sales" || req.user.role === "Support")) {
    // For Sales/Support, always filter by their fullname
    matchCondition.leadowner = req.user.fullname;
  } else if (userId && userId !== "all") {
    // For Admin roles, filter by selected user's fullname
    const User = require("../models/userschema");
    const selectedUser = await User.findById(userId);
    if (selectedUser) {
      matchCondition.leadowner = selectedUser.fullname;
    }
  }

  return matchCondition;
};

// GET /api/v1/dashboard/lead-metrics
router.get("/lead-metrics", isAuthenticated, async (req, res) => {
  try {
    console.log("=== Lead Metrics Request ===");
    console.log(
      "User:",
      req.user
        ? { id: req.user._id, fullname: req.user.fullname, role: req.user.role }
        : "No user"
    );
    console.log("Query params:", req.query);

    const { userId } = req.query;
    const filter = await getLeadOwnerMatchCondition(req, userId);

    console.log("Applied filter:", filter);

    const total = await Lead.countDocuments({ ...filter, isdeleted: false });
    const newLeads = await Lead.countDocuments({
      ...filter,
      status: "New",
      isdeleted: false,
    });
    const notConnected = await Lead.countDocuments({
      ...filter,
      status: "Not-Connected",
      isdeleted: false,
    });
    const hot = await Lead.countDocuments({
      ...filter,
      status: "Hot",
      isdeleted: false,
    });
    const cold = await Lead.countDocuments({
      ...filter,
      status: "Cold",
      isdeleted: false,
    });
    const reEnquired = await Lead.countDocuments({
      ...filter,
      status: "Re-enquired",
      isdeleted: false,
    });
    const converted = await Lead.countDocuments({
      ...filter,
      status: "Converted",
      isdeleted: false,
    });
    const followUp = await Lead.countDocuments({
      ...filter,
      status: "Follow-up",
      isdeleted: false,
    });
    const transferred = await Lead.countDocuments({
      ...filter,
      status: "Transferred-to-Dealer",
      isdeleted: false,
    });
    const unassigned = await Lead.countDocuments({
      ...filter,
      $or: [
        { leadowner: { $exists: false } },
        { leadowner: null },
        { leadowner: "" },
      ],
    });

    const response = {
      total,
      newLeads,
      notConnected,
      hot,
      cold,
      reEnquired,
      converted,
      transferred,
      followUp,
      unassigned,
    };

    console.log("Lead metrics response:", response);
    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching lead metrics:", error);
    res.status(500).json({ message: "Failed to fetch lead metrics" });
  }
});

// GET /api/v1/dashboard/lead-timeline
router.get("/lead-timeline", isAuthenticated, async (req, res) => {
  try {
    const { userId } = req.query;
    const matchFilter = await getLeadOwnerMatchCondition(req, userId);

    const leadsByDate = await Lead.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$created_at" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const formatted = leadsByDate.map((item) => ({
      date: item._id,
      count: item.count,
    }));
    //   console.log("Formatted lead timeline data:", formatted);

    res.status(200).json({ data: formatted });
  } catch (error) {
    console.error("Error fetching lead timeline data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// GET /api/v1/dashboard/lead-category-summary
router.get("/lead-category-summary", isAuthenticated, async (req, res) => {
  try {
    const { userId } = req.query;
    const matchFilter = await getLeadOwnerMatchCondition(req, userId);

    const data = await Lead.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: "$primarycategory",
          totalLeads: { $sum: 1 },
          convertedLeads: {
            $sum: {
              $cond: [{ $eq: ["$status", "Converted"] }, 1, 0],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          category: "$_id",
          totalLeads: 1,
          convertedLeads: 1,
          conversionRate: {
            $cond: [
              { $eq: ["$totalLeads", 0] },
              0,
              {
                $multiply: [
                  { $divide: ["$convertedLeads", "$totalLeads"] },
                  100,
                ],
              },
            ],
          },
        },
      },
    ]);

    //   console.log("Lead category summary data:", data);

    res.status(200).json({ data });
  } catch (err) {
    console.error("Lead category summary error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/leads-by-country", isAuthenticated, async (req, res) => {
  try {
    const { userId } = req.query;
    const matchFilter = await getLeadOwnerMatchCondition(req, userId);

    const data = await Lead.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: "$country",
          total: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    // Compute total leads to calculate percentage
    const totalLeads = data.reduce((sum, curr) => sum + curr.total, 0);

    const result = data.map((item) => ({
      country: item._id || "Unknown",
      total: item.total,
      percentage:
        totalLeads === 0 ? 0 : Math.round((item.total / totalLeads) * 100),
    }));

    res.status(200).json({ data: result });
  } catch (err) {
    console.error("Error in leads-by-country:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// GET /api/v1/dashboard/channel-source-conversion
router.get("/channel-source-conversion", isAuthenticated, async (req, res) => {
  try {
    const { userId } = req.query;
    const matchFilter = await getLeadOwnerMatchCondition(req, userId);

    const conversionData = await Lead.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: "$source", // Group by source
          totalLeads: { $sum: 1 },
          convertedLeads: {
            $sum: { $cond: [{ $eq: ["$status", "Converted"] }, 1, 0] },
          },
        },
      },
      { $sort: { totalLeads: -1 } }, // Sort by total leads, descending
    ]);

    const formatted = conversionData.map((item) => ({
      source: item._id,
      totalLeads: item.totalLeads,
      convertedLeads: item.convertedLeads,
      conversionRate:
        item.totalLeads > 0
          ? ((item.convertedLeads / item.totalLeads) * 100).toFixed(2)
          : 0,
    }));
    //   console.log("Channel-Source Conversion Data:", formatted);

    res.status(200).json({ data: formatted });
  } catch (error) {
    console.error("Error fetching conversion data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/monthly-target", isAuthenticated, async (req, res) => {
  console.log("Monthly target endpoint hit");
  try {
    const { userId } = req.query;
    const filter = await getLeadOwnerMatchCondition(req, userId);

    const now = new Date();
    const startOfMonth = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)
    );
    const endOfMonth = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999)
    );

    const convertedLeads = await Lead.countDocuments({
      ...filter,
      status: "Converted",
      created_at: { $gte: startOfMonth, $lte: endOfMonth },
    });

    // console.log("Converted leads this month:", convertedLeads);

    const target = 100;
    const percentage = Math.round((convertedLeads / target) * 100);

    res.status(200).json({
      converted: convertedLeads,
      target,
      percentage,
    });
  } catch (err) {
    console.error("Monthly target error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// GET /api/v1/leads/recent
router.get("/recent-ten", isAuthenticated, async (req, res) => {
  try {
    const { userId } = req.query;
    const filter = await getLeadOwnerMatchCondition(req, userId);

    const leads = await Lead.find(filter).sort({ created_at: -1 }).limit(10);
    console.log("Recent leads:", leads);
    res.json(leads);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch recent leads" });
  }
});

// GET /api/v1/dashboard/lead-stats
router.get("/lead-stats", isAuthenticated, async (req, res) => {
  try {
    const { userId } = req.query;
    const baseFilter = await getLeadOwnerMatchCondition(req, userId);
    let matchFilter = { ...baseFilter, status: "Converted" };

    const currentYear = new Date().getFullYear();
    matchFilter.created_at = {
      $gte: new Date(`${currentYear}-01-01`),
      $lte: new Date(`${currentYear}-12-31`),
    };

    const pipeline = [
      { $match: matchFilter },
      {
        $group: {
          _id: { $month: "$created_at" },
          completed: { $sum: 1 },
        },
      },
      {
        $project: {
          month: "$_id",
          completed: 1,
          _id: 0,
        },
      },
    ];

    const results = await Lead.aggregate(pipeline);

    // Prepare array of 12 months with default completed = 0
    const monthlyStats = Array.from({ length: 12 }, (_, index) => ({
      target: 100,
      completed: 0,
    }));

    results.forEach((result) => {
      const monthIndex = result.month - 1; // Convert to 0-indexed
      monthlyStats[monthIndex].completed = result.completed;
    });

    res.status(200).json(monthlyStats);
  } catch (err) {
    console.error("Error fetching lead stats:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/lead-bifurcation", isAuthenticated, async (req, res) => {
  try {
    const { userId } = req.query;
    const matchFilter = await getLeadOwnerMatchCondition(req, userId);

    const bifurcation = await Lead.aggregate([
      { $match: matchFilter },
      {
        $project: {
          primarycategory: {
            $cond: [
              { $eq: ["$primarycategory", ""] },
              "Unassigned primary categories",
              "$primarycategory",
            ],
          },
          status: 1,
          created_at: 1,
          updated_at: 1,
        },
      },
      {
        $group: {
          _id: "$primarycategory",
          total: { $sum: 1 },
          new: {
            $sum: { $cond: [{ $eq: ["$status", "New"] }, 1, 0] },
          },
          cold: {
            $sum: { $cond: [{ $eq: ["$status", "Cold"] }, 1, 0] },
          },
          notconnected: {
            $sum: { $cond: [{ $eq: ["$status", "Not-Connected"] }, 1, 0] },
          },
          untouched: {
            $sum: {
              $cond: [{ $eq: ["$created_at", "$updated_at"] }, 1, 0],
            },
          },
        },
      },
      {
        $project: {
          leadOwner: "$_id",
          total: 1,
          new: 1,
          cold: 1,
          notconnected: 1,
          untouched: 1,
          _id: 0,
        },
      },
    ]);

    res.status(200).json(bifurcation);
  } catch (err) {
    console.error("Error fetching lead bifurcation:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ===============================
// Role-based middleware
// ===============================
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ success: false, message: "Insufficient permissions" });
    }
    next();
  };
};

// ===============================
// AUTHENTICATION STATUS
// ===============================
router.get("/auth/isauthenticated", async (req, res) => {
  try {
    if (req.user && req.session) {
      res.json({
        success: true,
        isauthenticated: true,
        user: {
          id: req.user._id,
          name: req.user.fullname,
          email: req.user.username,
          role: req.user.role,
          can_generate_report: req.user.can_generate_report || true,
          department: req.user.assignedPrimaryCategories,
          created_at: req.user.createdAt,
        },
      });
    } else {
      res.json({ success: false, isauthenticated: false });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Authentication check failed",
      error: error.message,
    });
  }
});

// ===============================
// USER MANAGEMENT
// ===============================
const User = require("../models/userschema");
router.get(
  "/users/all",
  requireRole(["SuperAdmin", "Admin", "CRM Manager"]),
  async (req, res) => {
    try {
      const users = await User.find(
        {},
        {
          _id: 1,
          fullname: 1,
          username: 1,
          role: 1,
          can_generate_report: 1,
          assignedPrimaryCategories: 1,
          createdAt: 1,
        }
      ).sort({ fullname: 1 });

      // Map the data to match frontend interface
      const mappedUsers = users.map((user) => ({
        id: user._id,
        name: user.fullname,
        email: user.username,
        role: user.role,
        can_generate_report: user.can_generate_report || true,
        department: user.assignedPrimaryCategories,
        created_at: user.createdAt,
      }));

      res.json({ success: true, users: mappedUsers });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch users",
        error: error.message,
      });
    }
  }
);

// ===============================
// ANALYTICS
// ===============================
router.get(
  "/dashboard/analytics/all",
  requireRole(["SuperAdmin", "Admin", "CRM Manager"]),
  async (req, res) => {
    try {
      const analytics = await generateCompanyAnalytics();
      res.json({ success: true, analytics });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch company analytics",
        error: error.message,
      });
    }
  }
);

// Only allow users to see their own analytics unless they are CRM Manager/Admin/SuperAdmin
router.get("/dashboard/analytics/me", async (req, res) => {
  try {
    const userId = req.user._id;
    // If not manager/admin/superadmin, only allow own analytics
    const allowedRoles = ["SuperAdmin", "Admin", "CRM Manager"];
    if (!allowedRoles.includes(req.user.role)) {
      // Only own analytics
      const analytics = await generateUserAnalytics(userId);
      return res.json({ success: true, analytics });
    }
    // If manager/admin/superadmin, allow all analytics
    const analytics = await generateCompanyAnalytics();
    res.json({ success: true, analytics });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch personal analytics",
      error: error.message,
    });
  }
});

// Only CRM Manager/Admin/SuperAdmin can see analytics for any user
router.get("/dashboard/analytics/:userId", async (req, res) => {
  try {
    const allowedRoles = ["SuperAdmin", "Admin", "CRM Manager"];
    const { userId } = req.params;
    // If not manager/admin/superadmin, only allow own analytics
    if (!allowedRoles.includes(req.user.role)) {
      if (String(req.user._id) !== String(userId)) {
        return res
          .status(403)
          .json({ success: false, message: "Insufficient permissions" });
      }
    }
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    const analytics = await generateUserAnalytics(userId);
    res.json({ success: true, analytics });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch user analytics",
      error: error.message,
    });
  }
});

// ===============================
// REPORT GENERATION
// ===============================
router.post(
  "/dashboard/generate-report/all",
  requireRole(["SuperAdmin", "Admin", "CRM Manager"]),
  async (req, res) => {
    try {
      const options = req.body;
      const analytics = await generateCompanyAnalytics();
      const reportBuffer = await generateReport(analytics, options, "company");
      const filename = `company-report-${
        new Date().toISOString().split("T")[0]
      }.${options.format || "pdf"}`;
      res.setHeader("Content-Type", getContentType(options.format));
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`
      );
      res.send(reportBuffer);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to generate company report",
        error: error.message,
      });
    }
  }
);

router.post("/dashboard/generate-report/me", async (req, res) => {
  try {
    const options = req.body;
    const userId = req.user._id;
    const analytics = await generateUserAnalytics(userId);
    const reportBuffer = await generateReport(analytics, options, "personal");
    const filename = `personal-report-${
      new Date().toISOString().split("T")[0]
    }.${options.format || "pdf"}`;
    res.setHeader("Content-Type", getContentType(options.format));
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(reportBuffer);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to generate personal report",
      error: error.message,
    });
  }
});

router.post(
  "/dashboard/generate-report/:userId",
  requireRole(["SuperAdmin", "Admin", "CRM Manager"]),
  async (req, res) => {
    try {
      const { userId } = req.params;
      const options = req.body;
      const targetUser = await User.findById(userId);
      if (!targetUser) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }
      const analytics = await generateUserAnalytics(userId);
      const reportBuffer = await generateReport(
        analytics,
        options,
        "user",
        targetUser
      );
      const filename = `user-${userId}-report-${
        new Date().toISOString().split("T")[0]
      }.${options.format || "pdf"}`;
      res.setHeader("Content-Type", getContentType(options.format));
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`
      );
      res.send(reportBuffer);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to generate user report",
        error: error.message,
      });
    }
  }
);

// ===============================
// Helper Functions (Stubbed)
// ===============================
async function generateCompanyAnalytics() {
  // Example stub: replace with actual aggregation logic
  const totalLeads = await Lead.countDocuments();
  const convertedLeads = await Lead.countDocuments({ status: "Converted" });
  return { totalLeads, convertedLeads };
}

async function generateUserAnalytics(userId) {
  // Example stub: replace with actual aggregation logic
  const totalLeads = await Lead.countDocuments({ leadowner: userId });
  const convertedLeads = await Lead.countDocuments({
    leadowner: userId,
    status: "Converted",
  });
  return { totalLeads, convertedLeads };
}

function getContentType(format) {
  switch (format) {
    case "pdf":
      return "application/pdf";
    case "excel":
      return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    case "csv":
      return "text/csv";
    default:
      return "application/pdf";
  }
}

async function generateReport(analytics, options, type, user = null) {
  // Stub: return a Buffer or string for now
  return Buffer.from(JSON.stringify({ analytics, type, user, options }));
}

// Get users for whom the current user can generate reports
router.get("/users-for-reports", isAuthenticated, async (req, res) => {
  try {
    console.log("=== Users for Reports Request ===");
    console.log(
      "User:",
      req.user
        ? { id: req.user._id, fullname: req.user.fullname, role: req.user.role }
        : "No user"
    );

    const User = require("../models/userschema");
    let allowedUsers = [];

    if (req.user.role === "SuperAdmin" || req.user.role === "Admin") {
      // SuperAdmin and Admin can generate reports for all users
      allowedUsers = await User.find(
        {},
        { fullname: 1, username: 1, role: 1 }
      ).sort({ fullname: 1 });
    } else if (req.user.can_generate_report) {
      // Other users can only generate reports for users specified in their cangeneratereportfor array
      if (
        req.user.cangeneratereportfor &&
        req.user.cangeneratereportfor.length > 0
      ) {
        allowedUsers = await User.find(
          {
            fullname: { $in: req.user.cangeneratereportfor },
          },
          { fullname: 1, username: 1, role: 1 }
        ).sort({ fullname: 1 });
      }

      // Always include themselves
      const selfUser = await User.findById(req.user._id, {
        fullname: 1,
        username: 1,
        role: 1,
      });
      if (
        selfUser &&
        !allowedUsers.find((u) => u._id.toString() === selfUser._id.toString())
      ) {
        allowedUsers.push(selfUser);
      }
    } else {
      // If user doesn't have can_generate_report permission, they can only see themselves
      allowedUsers = [
        await User.findById(req.user._id, {
          fullname: 1,
          username: 1,
          role: 1,
        }),
      ];
    }

    console.log("Allowed users for reports:", allowedUsers);

    res.json({
      success: true,
      users: allowedUsers,
    });
  } catch (error) {
    console.error("Error fetching users for reports:", error);
    res.status(500).json({ error: error.message });
  }
});

// Test route to debug authentication and user data
router.get("/test-auth", isAuthenticated, async (req, res) => {
  try {
    console.log("=== Test Auth Route ===");
    console.log("User from req.user:", {
      id: req.user._id,
      fullname: req.user.fullname,
      role: req.user.role,
      username: req.user.username,
    });

    const { userId } = req.query;
    const filter = await getLeadOwnerMatchCondition(req, userId);
    console.log("Filter that would be applied:", filter);

    const leadCount = await Lead.countDocuments(filter);
    console.log("Lead count with filter:", leadCount);

    res.json({
      success: true,
      user: {
        id: req.user._id,
        fullname: req.user.fullname,
        role: req.user.role,
        username: req.user.username,
      },
      filter,
      leadCount,
      userId,
    });
  } catch (error) {
    console.error("Test auth error:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/v1/dashboard/dropdown-data
router.get("/dropdown-data", isAuthenticated, async (req, res) => {
  try {
    // Get the lead owner match condition based on user role
    const leadOwnerCondition = await getLeadOwnerMatchCondition(req);

    // Fetch distinct values for dropdowns from leads that the user can access
    const dropdownData = await Lead.aggregate([
      { $match: leadOwnerCondition },
      {
        $group: {
          _id: null,
          states: { $addToSet: "$state" },
          countries: { $addToSet: "$country" },
          cities: { $addToSet: "$city" },
          companies: { $addToSet: "$company" },
          sources: { $addToSet: "$source" },
          territories: { $addToSet: "$territory" },
          regions: { $addToSet: "$region" },
          primaryCategories: { $addToSet: "$primarycategory" },
          secondaryCategories: { $addToSet: "$secondarycategory" },
        },
      },
    ]);

    if (!dropdownData || dropdownData.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          states: [],
          countries: [],
          cities: [],
          companies: [],
          sources: [],
          territories: [],
          regions: [],
          primaryCategories: [],
          secondaryCategories: [],
        },
      });
    }

    const data = dropdownData[0];

    // Filter out null, undefined, and empty strings, then sort
    const cleanAndSort = (arr) => {
      return arr.filter((item) => item && item.trim() !== "").sort();
    };

    res.status(200).json({
      success: true,
      data: {
        states: cleanAndSort(data.states || []),
        countries: cleanAndSort(data.countries || []),
        cities: cleanAndSort(data.cities || []),
        companies: cleanAndSort(data.companies || []),
        sources: cleanAndSort(data.sources || []),
        territories: cleanAndSort(data.territories || []),
        regions: cleanAndSort(data.regions || []),
        primaryCategories: cleanAndSort(data.primaryCategories || []),
        secondaryCategories: cleanAndSort(data.secondaryCategories || []),
      },
    });
  } catch (error) {
    console.error("Error fetching dropdown data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dropdown data",
    });
  }
});

module.exports = router;
