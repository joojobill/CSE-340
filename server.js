/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
process.removeAllListeners('warning');

/* ***********************
 * Require Statements
 *************************/
const path = require('path');
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
    pool: pool.pool,
    createTableIfMissing: true,
    tableName: 'user_sessions'
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  name: 'sessionId',
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// Flash messages middleware
app.use(require('connect-flash')());

// Enhanced message handling middleware
app.use((req, res, next) => {
  res.locals.messages = {
    success: req.flash('success'),
    error: req.flash('error'),
    info: req.flash('info'),
    warning: req.flash('warning'),
    errors: req.flash('errors') || [],
    formData: req.flash('formData')[0] || {}
  };
  next();
});

// Body parsing middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
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

// Base route
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
  
  // Set flash messages for the error page if needed
  req.flash('error', err.message);
  
  res.status(err.status || 500).render("errors/error", {
    title: err.status || 'Server Error',
    message: err.message,
    nav,
    messages: {
      error: [err.message],
      errors: []
    }
  });
});

/* ***********************
 * Server Configuration
 *************************/
const port = process.env.PORT || 5500;
const host = process.env.HOST || '0.0.0.0';

// Start server
const server = app.listen(port, host, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`Access at: http://${host}:${port}`);
});

// Graceful shutdown handling
const gracefulShutdown = () => {
  console.log('Shutting down gracefully...');
  server.close(() => {
    pool.end()
      .then(() => {
        console.log('Server closed. Database pool drained');
        process.exit(0);
      })
      .catch(err => {
        console.error('Error during shutdown:', err);
        process.exit(1);
      });
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Debug logging
console.log("Views directory:", path.join(__dirname, "views"));
console.log("Layout file:", path.join(__dirname, "views", "layouts", "layout.ejs"));