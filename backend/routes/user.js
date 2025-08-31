const express = require("express");
const router = express.Router();
const User = require("../models/userschema"); // Adjust the path as needed

// GET /users/leadowners - Fetch users who can be lead owners
router.get("/leadowners", async (req, res) => {
  console.log("Fetching lead owners...");
  try {
    const leadOwnerRoles = ["CRM Manager", "Sales", "Support"];

    // Fetch users with those roles
    const users = await User.find({ role: { $in: leadOwnerRoles } })
      .select("fullname") // Include full name (assuming 'name' is the field)
      .sort({ fullname: 1 }); // Sort alphabetically by name

    // Format response to return full names (fallback to username if needed)
    const formattedUsers = users.map((user) => ({
      name: user.fullname,
    }));
    console.log("Lead owners fetched:", formattedUsers);

    res.status(200).json(formattedUsers);
  } catch (err) {
    console.error("Error fetching lead owners:", err);
    res.status(500).json({ error: "Server error while fetching lead owners" });
  }
});

// Get a data for specific user
router.get("/:username", async (req, res) => {
  const { username } = req.params;
  console.log(`Fetching data for user: ${username}`);
  try {
    const user = await User.findOne({ fullname: username });
    console.log("User data fetched:", user);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (err) {
    console.error("Error fetching user data:", err);
    res.status(500).json({ error: "Server error while fetching user data" });
  }
});

// GET /users/all - Fetch all users (for admin/manager use)
router.get("/all", async (req, res) => {
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
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      error: error.message,
    });
  }
});

module.exports = router;
