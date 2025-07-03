// Import dependencies
const express = require("express");
const path = require("path");
const cors = require("cors");
const dotenv = require("dotenv");
const morgan = require("morgan");
const passport = require("passport");
const session = require("express-session");
const mongoStore = require("connect-mongo");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerDocument = YAML.load("./swagger.yaml");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
// Initialize Express app
const app = express();

// Enable Helmet middleware
app.use(helmet());
// Apply rate limiting globally (e.g., max 100 requests per 15 minutes per IP)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 2000, // Limit each IP to 2000 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: "Too many requests from this IP, please try again later.",
});

app.use(limiter);

// Initialize MongoDB connection
const ConnectDb = require("./db");
ConnectDb();

// notification system for untouched leads
// const checkUntouchedLeads = require("./controllers/notification");
// setInterval(checkUntouchedLeads, 1000 * 60 * 12); // Check every 4 hours

const cron = require("node-cron");
const generateInactivityNotifications = require("./services/inactivitynotification");
const generateFollowupNotifications = require("./services/followupnotification");

// Run at 1 AM every day inactivity notification
cron.schedule("0 1 * * *", async () => {
  console.log("Running inactivity notification check...");
  await generateInactivityNotifications();
});

// Run now for testing
// (async () => {
//   console.log("Running inactivity notification test...");
//   await generateInactivityNotifications();
//   console.log("Test completed.");
// })();

// Notification system for followup leads
// Runs every hour between 9 AM and 6 PM
cron.schedule("0 9-18 * * *", async () => {
  console.log("Running follow-up notification check...");
  await generateFollowupNotifications();
});

// Run now for testing
// (async () => {
//   console.log("Running follow-up notification test...");
//   await generateFollowupNotifications();
//   console.log("Test completed.");
// })();

// Load environment variables
dotenv.config();

// Set port from environment variables or default to 8080
const PORT = process.env.PORT || 8080;

//EJS Setup
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "/views")));

// Middleware setup
app.use(morgan("dev")); // Log requests to the console

// Enable CORS
// const cors = require("cors");
const corsOptions = {
  // origin: ["http://localhost:5173", "http://localhost:5174"],
  origin: [
    "https://www.smartmark.gurubrandingservices.com",
    "https://smartmark.gurubrandingservices.com",
  ],
  // Allow specific domains
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization", "Origin", "Accept"],
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};
app.use(cors(corsOptions));

// Parse incoming JSON requests
app.use(express.json());

// Enable URL-encoded form data parsing
app.use(express.urlencoded({ extended: true }));

// Setup session store (for example using MongoDB)
// const passport = require("passport");
const { initializingPassport, isAuthenticated } = require("./passportconfig");
initializingPassport(passport);
app.set("trust proxy", 1); // trust first proxy
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: mongoStore.create({
      mongoUrl: process.env.DB_URI,
      collectionName: "sessions",
    }),
    cookie: {
      httpOnly: true,
      sameSite: "None", // 'none' will work with secure: true
      secure: true, // set to true if your using https
      maxAge: 1000 * 60 * 60 * 24,
    }, // 1 day
  })
);

// Initialize Passport for authentication
app.use(passport.initialize());
app.use(passport.session());

//Swagger Documentation Route
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Basic route to test server
app.get("/", (req, res) => {
  res.send("Server is running!");
});

// Example API route
app.get("/api", (req, res) => {
  res.json({ message: "API is working!" });
});

// Add API routes for different services (Admin, Backend, etc.)
app.use("/api/test", require("./routes/testroute.js")); // Example backend route

// Lead Routes
app.use("/api/v1/leads", require("./routes/leadRoutes.js"));
// follow-up routes
app.use("/api/v1/followups", require("./routes/followup.js"));
// bulk upload routes
app.use("/api/v1/bulkupload", require("./routes/bulkupload.js"));

// dashboard routes
app.use("/api/v1/dashboard", require("./routes/dashboard.js"));

// generate report routes
app.use("/api/v1/reports", require("./routes/generatereport.js"));

// raise ticket routes
app.use("/api/v1/raiseticket", require("./routes/raiseticket.js"));

// remarks routes
app.use("/api/v1/remarks", require("./routes/remarks.js"));

const User = require("./models/userschema.js");
// auth routes
app.use("/api/v1/auth", require("./routes/auth.js"));

// notification routes
app.use("/api/v1/notifications", require("./routes/notification.js"));

// log routes
app.use("/api/v1/logs", require("./routes/logs.js"));

// user activity routes
app.use("/api/v1/user-activity", require("./routes/useractivities.js"));

// super admin routes
app.use("/api/v1/superadmin", require("./routes/superadmin.js"));

// user routes
app.use("/api/v1/users", require("./routes/user.js"));

// Handle 404 errors
app.use((req, res, next) => {
  res.status(404).json({ error: "Not Found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
