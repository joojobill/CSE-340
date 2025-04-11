/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/

/* ***********************
 * Require Statements
 *************************/
const session = require("express-session");
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const env = require("dotenv").config();
const app = express();
const static = require("./routes/static");
const baseController = require("./controllers/baseController");
const inventoryRoute = require("./routes/inventoryRoute");
const utilities = require("./utilities/");
const accountRouter = require('./routes/accountRoute');
const bodyParser = require("body-parser");
const pool = require('./database/');

// Verify essential environment variables
if (!process.env.SESSION_SECRET) {
  console.error("FATAL: SESSION_SECRET is not defined");
  process.exit(1);
}

/* ***********************
 * Middleware
 * ************************/
// Session configuration with PostgreSQL store
app.use(session({
  store: new (require('connect-pg-simple')(session))({
    pool: pool.pool, // Use the exported pool from database/index.js
    createTableIfMissing: true,
    tableName: 'user_sessions'
  }),
  secret: process.env.SESSION_SECRET,
  resave: false, // Changed to false for better performance
  saveUninitialized: false, // Changed for GDPR compliance
  name: 'sessionId',
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Enable secure cookies in production
    httpOnly: true, // Prevent client-side JS access
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Flash messages middleware
app.use(require('connect-flash')());

// Message handling and body parsing middleware
app.use((req, res, next) => {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/layout");

/* ***********************
 * Routes
 *************************/
// Static routes
app.use(static);

// Account routes
app.use("/account", accountRouter);

// Inventory routes
app.use("/inv", inventoryRoute);

// Base route (removed duplicate route)
app.get("/", utilities.handleErrors(baseController.buildHome));

// File Not Found Route - must be last route in list
app.use(async (req, res, next) => {
  next({status: 404, message: 'Sorry, we appear to have lost that page.'});
});

/* ***********************
* Express Error Handler
* Place after all other middleware
*************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav();
  console.error(`Error at: "${req.originalUrl}": ${err.message}`);
  res.status(err.status || 500).render("errors/error", {
    title: err.status || 'Server Error',
    message: err.message,
    nav
  });
});

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT || 5500; 
const host = process.env.HOST || '0.0.0.0';

/* ***********************
 * Log statement to confirm server operation
 *************************/
const server = app.listen(port, host, () => {
  console.log(`Server running on http://${host}:${port}`);
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully');
  server.close(() => {
    pool.end().then(() => {
      console.log('Server closed. Database pool drained');
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully');
  server.close(() => {
    pool.end().then(() => {
      console.log('Server closed. Database pool drained');
      process.exit(0);
    });
  });
});