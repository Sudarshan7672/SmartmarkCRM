const express = require('express');
const router = express.Router();
const User = require('../models/userschema'); // Adjust the path as needed

// GET /users/leadowners - Fetch users who can be lead owners
router.get('/leadowners', async (req, res) => {
  console.log('Fetching lead owners...');
  try {
    const leadOwnerRoles = ['CRM Manager', 'Sales', 'Support'];

    // Fetch users with those roles
    const users = await User.find({ role: { $in: leadOwnerRoles } })
      .select('fullname') // Include full name (assuming 'name' is the field)
      .sort({ fullname: 1 }); // Sort alphabetically by name

    // Format response to return full names (fallback to username if needed)
    const formattedUsers = users.map((user) => ({
      name: user.fullname
    }));
    console.log('Lead owners fetched:', formattedUsers);

    res.status(200).json(formattedUsers);
  } catch (err) {
    console.error('Error fetching lead owners:', err);
    res.status(500).json({ error: 'Server error while fetching lead owners' });
  }
});


module.exports = router;
