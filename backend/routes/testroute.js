const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const passport = require('passport');
const { isAuthenticated } = require('../passportconfig');

router.get('/get', (req, res) => {
    res.send('Test route is working!');
});
// Add more routes as needed

module.exports = router;