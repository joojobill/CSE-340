/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
// Increase event listeners limit
require('events').EventEmitter.defaultMaxListeners = 15;
process.removeAllListeners('warning');

/* ***********************
 * Require Statements
 *************************/
const path = require('path');
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const session = require("express-session");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");
const csrf = require('csurf');
const env = require("dotenv").config();
const app = express();
const jwt = require("jsonwebtoken");

// Import Routes and Controllers
const static = require("./routes/static");
const baseController = require("./controllers/baseController");
const inventoryRoute = require("./routes/inventoryRoute");
const accountRouter = require("./routes/accountRoute");

// Utilities and database
const utilities = require("./utilities/");
const pool = require('./database/');

// Verify essential environment variables
if (!process.env.SESSION_SECRET || !process.env.ACCESS_TOKEN_SECRET) {
  console.error("FATAL: Missing required environment variables");
  process.exit(1);
}

/* ***********************
 * Middleware Setup
 *************************/
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Session Configuration
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

app.use(flash());

// User Authentication Middleware
app.use((req, res, next) => {
  res.locals.loggedin = false;
  res.locals.user = null;
  
  if (req.cookies.jwt) {
    try {
      const user = jwt.verify(req.cookies.jwt, process.env.ACCESS_TOKEN_SECRET);
      res.locals.loggedin = true;
      res.locals.user = user;
      res.locals.accountData = user; // For compatibility
    } catch (err) {
      res.clearCookie("jwt");
    }
  }
  next();
});

// Flash messages
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

// CSRF Protection
const csrfProtection = csrf({ cookie: true });
app.use(csrfProtection);
app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  next();
});

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
app.use(static);
app.use("/account", accountRouter);
app.use("/inv", inventoryRoute);
app.get("/", utilities.handleErrors(baseController.buildHome));

// 404 Handler
app.use(async (req, res, next) => {
  next({ status: 404, message: "Sorry, we appear to have lost that page." });
});

/* ***********************
 * Error Handler
 *************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav();
  console.error(`Error at: "${req.originalUrl}": ${err.message}`);

  res.status(err.status || 500).render("errors/error", {
    title: err.status || "Server Error",
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
const host = process.env.HOST || "0.0.0.0";

const server = app.listen(port, host, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`Access at: http://${host}:${port}`);
});

const gracefulShutdown = () => {
  console.log("Shutting down gracefully...");
  server.close(() => {
    pool.end()
      .then(() => {
        console.log("Server closed. Database pool drained.");
        process.exit(0);
      })
      .catch(err => {
        console.error("Error during shutdown:", err);
        process.exit(1);
      });
  });
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);