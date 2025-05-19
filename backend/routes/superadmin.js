const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const User = require("../models/userschema");

// Middleware to verify SuperAdmin role
const ensureSuperAdmin = (req, res, next) => {
    console.log("Checking user role:", req.user?.role);
  if (req.user?.role !== "SuperAdmin") {
    return res.status(403).json({ message: "Access denied" });
  }
  next();
};

// GET all users (except passwords)
router.get("/", ensureSuperAdmin, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// CREATE new user
router.post("/", ensureSuperAdmin, async (req, res) => {
  try {
    console.log("Received request to create user:", req.body);  
    const { password, ...rest } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ ...rest, password: hashedPassword });

    await newUser.save();
    const users = await User.find().select("-password");

    res.status(201).json({ message: "User created successfully", users });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// UPDATE user
router.put("/:id", ensureSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // If password is present in update, hash it
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    await User.findByIdAndUpdate(id, updateData, { new: true });
    const users = await User.find().select("-password");

    res.json({ message: "User updated successfully", users });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE user
router.delete("/:id", ensureSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    await User.findByIdAndDelete(id);
    const users = await User.find().select("-password");

    res.json({ message: "User deleted successfully", users });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
