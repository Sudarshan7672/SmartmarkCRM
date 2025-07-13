// routes/dashboard.js
const express = require("express");
const router = express.Router();
const Lead = require("../models/lead"); // Adjust path if needed

// GET /api/v1/dashboard/lead-metrics
router.get("/lead-metrics", async (req, res) => {
  try {
    const total = await Lead.countDocuments();
    const newLeads = await Lead.countDocuments({ status: "New" });
    const notConnected = await Lead.countDocuments({ status: "Not-Connected" });
    const hot = await Lead.countDocuments({ status: "Hot" });
    const cold = await Lead.countDocuments({ status: "Cold" });
    const reEnquired = await Lead.countDocuments({ status: "Re-enquired" });
    const converted = await Lead.countDocuments({ status: "Converted" });
    const transferred = await Lead.countDocuments({
      status: "Transferred-to-Dealer",
    });
    const unassigned = await Lead.countDocuments({
  $or: [
    { leadowner: { $exists: false } },
    { leadowner: null },
    { leadowner: "" }
  ]
});


    res.status(200).json({
      total,
      newLeads,
      notConnected,
      hot,
      cold,
      reEnquired,
      converted,
      transferred,
      unassigned,
    });
  } catch (error) {
    console.error("Error fetching lead metrics:", error);
    res.status(500).json({ message: "Failed to fetch lead metrics" });
  }
});

// GET /api/v1/dashboard/lead-timeline
router.get("/lead-timeline", async (req, res) => {
  try {
    const leadsByDate = await Lead.aggregate([
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
router.get("/lead-category-summary", async (req, res) => {
  try {
    const data = await Lead.aggregate([
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

router.get("/leads-by-country", async (req, res) => {
  try {
    const data = await Lead.aggregate([
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
router.get("/channel-source-conversion", async (req, res) => {
  try {
    const conversionData = await Lead.aggregate([
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

router.get("/monthly-target", async (req, res) => {
  console.log("Monthly target endpoint hit");
  try {
    const now = new Date();
    const startOfMonth = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)
    );
    const endOfMonth = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999)
    );

    const convertedLeads = await Lead.countDocuments({
        status: "Converted",
        created_at: { $gte: startOfMonth, $lte: endOfMonth }
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
router.get('/recent-ten', async (req, res) => {
  try {
    const leads = await Lead.find().sort({ created_at: -1 }).limit(10);
    console.log("Recent leads:", leads);
    res.json(leads);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch recent leads" });
  }
});


// GET /api/v1/dashboard/lead-stats
router.get("/lead-stats", async (req, res) => {
    try {
      const currentYear = new Date().getFullYear();
  
      const pipeline = [
        {
          $match: {
            status: "Converted",
            created_at: {
              $gte: new Date(`${currentYear}-01-01`),
              $lte: new Date(`${currentYear}-12-31`),
            },
          },
        },
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


  router.get("/lead-bifurcation", async (req, res) => {
    try {
      const bifurcation = await Lead.aggregate([
        {
          $project: {
            primarycategory: {
              $cond: [
                { $eq: ["$primarycategory", ""] },
                "Unassigned",
                "$primarycategory"
              ]
            },
            status: 1,
            created_at: 1,
            updated_at: 1
          }
        },
        {
          $group: {
            _id: "$primarycategory",
            total: { $sum: 1 },
            new: {
              $sum: { $cond: [{ $eq: ["$status", "New"] }, 1, 0] }
            },
            cold: {
              $sum: { $cond: [{ $eq: ["$status", "Cold"] }, 1, 0] }
            },
            notconnected: {
              $sum: { $cond: [{ $eq: ["$status", "Not-Connected"] }, 1, 0] }
            },
            untouched: {
              $sum: {
                $cond: [{ $eq: ["$created_at", "$updated_at"] }, 1, 0]
              }
            }
          }
        },
        {
          $project: {
            leadOwner: "$_id",
            total: 1,
            new: 1,
            cold: 1,
            notconnected: 1,
            untouched: 1,
            _id: 0
          }
        }
      ]);
  
      res.status(200).json(bifurcation);
    } catch (err) {
      console.error("Error fetching lead bifurcation:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
  


module.exports = router;
