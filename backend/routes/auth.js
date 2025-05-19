// routes/auth.js

const express = require("express");
const passport = require("passport");
const bcrypt = require("bcrypt");
const User = require("../models/userschema"); // adjust path as needed

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
router.post("/login", passport.authenticate("local"), (req, res) => {
  res.status(200).json({ message: "Logged in successfully", user: req.user });
});

// CHECK AUTHENTICATION
router.get("/isAuthenticated", (req, res) => {
  if (req.isAuthenticated()) {
    res.status(200).json({ isauthenticated: true, user: req.user });
  } else {
    res.status(401).json({ isauthenticated: false });
  }
});

// LOGOUT
router.get("/logout", (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }

    // Destroy the session after logout
    req.session.destroy((err) => {
      if (err) {
        console.error("Failed to destroy session during logout:", err);
        return res.status(500).json({ message: "Logout failed" });
      }
      // Clear the cookie as well (optional, but recommended)
      res.clearCookie("connect.sid");
      console.log("User logged out successfully");
      return res.status(200).json({ message: "Logged out successfully" });
    });
  });
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
