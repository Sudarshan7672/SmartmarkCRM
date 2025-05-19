const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
// const { session } = require("passport");
const User = require("./models/userschema"); // Assuming your schema is named "userschema"

exports.initializingPassport = (passport) => {
  passport.use(
    'local',
    new LocalStrategy(
      async (username, password, done) => {
        try {
          const user = await User.findOne({ username });
          if (!user) {
            return done(null, false, { message: 'Invalid credentials' });
          }
  
          const isMatch = await bcrypt.compare(password, user.password);
          if (!isMatch) {
            return done(null, false, { message: 'Invalid credentials' });
          }
  
          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );

passport.serializeUser(function (user, done) {
  // console.log("Serializing user:", user);
  done(null, user.id); // Only store the user ID in the session
});

passport.deserializeUser(async function (id, done) {
  try {
    // console.log("Deserializing user with ID:", id);
    const user = await User.findById(id); // Retrieve the user from the database
    // console.log("deserializing user");
    done(null, user); // Attach the user object to the session
  } catch (err) {
    // console.log(err, " deserializer lafda");
    done(err); // Handle any error that occurs
  }
});
};

// Middleware to check if the user is authenticated
exports.isAuthenticated = (req, res, next) => {
  console.log('Checking if user is authenticated');
  // console.log(req.user);
  // console.log(req.session);
  // console.log(req.isAuthenticated());
  console.log(req.isAuthenticated());
  if (req.isAuthenticated()) {
    return next(); // If authenticated, proceed to the next middleware or route
  }
  // console.log(req.user);
  
  // If not authenticated, send a JSON response with a 401 status code
  return res.status(401).json({
    success: false,
    message: 'User is not authenticated',
  });
};
