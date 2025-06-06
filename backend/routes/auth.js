// routes/auth.js

const express = require("express");
const passport = require("passport");
const bcrypt = require("bcrypt");
const User = require("../models/userschema"); // adjust path as needed
const UserActivity = require("../models/useractivity"); // adjust path as needed

const router = express.Router();

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const {
      username,
      fullname,
      password,
      role,
      can_add_individual_lead,
      can_add_bulk_lead,
      can_edit_lead,
      can_transfer_lead_department,
      can_transfer_lead_group,
      can_delete_lead,
      can_add_followup,
      can_edit_followup,
      can_delete_followup,
      can_add_remark,
      can_edit_remark,
      can_delete_remark,
      can_raise_ticket,
      can_generate_report,
    } = req.body;
    console.log("Received registration data:", req.body);

    const existingUser = await User.findOne({ username: username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      fullname,
      password: hashedPassword,
      role,
      can_add_individual_lead,
      can_add_bulk_lead,
      can_edit_lead,
      can_transfer_lead_department,
      can_transfer_lead_group,
      can_delete_lead,
      can_add_followup,
      can_edit_followup,
      can_delete_followup,
      can_add_remark,
      can_edit_remark,
      can_delete_remark,
      can_raise_ticket,
      can_generate_report,
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// LOGIN
router.post("/login", passport.authenticate("local"), async (req, res) => {
  try {
    // Create a new UserActivity record with loginTime = now
    console.log("User logged in:", req.user);
    const activity = new UserActivity({
      userId: req.user._id,
      loginTime: new Date(),
    });

    await activity.save();

    // Save activity _id in session for logout tracking
    //   req.session.activityId = activity._id;

    res.status(200).json({ message: "Logged in successfully", user: req.user });
  } catch (error) {
    console.error("Login activity save failed:", error);
    res
      .status(500)
      .json({ message: "Login succeeded but failed to save activity." });
  }
});

// CHECK AUTHENTICATION
router.get("/isAuthenticated", (req, res) => {
  if (req.isAuthenticated()) {
    res.status(200).json({ isauthenticated: true, user: req.user });
  } else {
    res.status(401).json({ isauthenticated: false });
  }
});

// logout route
router.get("/logout", async (req, res, next) => {
    try {
      // Check if user is logged in and get userId before logout
      const userId = req.user?._id;
  
      // Call logout (promisify it)
      await new Promise((resolve, reject) => {
        req.logout((err) => (err ? reject(err) : resolve()));
      });
  
      // Destroy session
      await new Promise((resolve, reject) => {
        req.session.destroy((err) => (err ? reject(err) : resolve()));
      });
  
      // Update UserActivity logoutTime if userId exists
      if (userId) {
        // Update the latest activity where logoutTime is not set
        await UserActivity.findOneAndUpdate(
          { userId: userId, logoutTime: { $exists: false } },
          { logoutTime: new Date() },
          { sort: { loginTime: -1 } }
        );
      }
  
      // Clear cookie
      res.clearCookie("connect.sid");
  
      console.log("User logged out successfully");
      return res.status(200).json({ message: "Logged out successfully" });
    } catch (err) {
      console.error("Logout error:", err);
      return next(err);
    }
  });
  
// UNREGISTER (delete account)
router.delete("/unregister", async (req, res) => {
  if (!req.isAuthenticated())
    return res.status(401).json({ message: "Not authenticated" });

  try {
    await User.findByIdAndDelete(req.user._id);
    req.logout((err) => {
      if (err)
        return res
          .status(500)
          .json({ message: "Logout error", error: err.message });
      res.status(200).json({ message: "Account deleted successfully" });
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error deleting account", error: err.message });
  }
});

module.exports = router;
