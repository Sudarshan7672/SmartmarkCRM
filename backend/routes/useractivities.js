const express = require('express');
const router = express.Router();
const UserActivity = require('../models/useractivity'); // Adjust path as needed
const User = require('../models/userschema'); // Adjust path accordingly

// users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, '_id fullname').lean();
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// GET all user activities, optionally filtered by userId via query param ?userId=...
router.get('/', async (req, res, next) => {
    console.log('Fetching user activities...');
  try {
    const { userId } = req.query;

    const filter = {};
    if (userId) {
      filter.userId = userId;
    }

    // Fetch activities, sorted by loginTime descending
    const activities = await UserActivity.find(filter)
      .populate('userId', 'username fullname') // populate user info if needed
      .sort({ loginTime: -1 });

    res.status(200).json({ activities });
  } catch (err) {
    console.error('Failed to fetch user activities:', err);
    next(err);
  }
});

module.exports = router;
