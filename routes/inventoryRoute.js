const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const utilities = require("../utilities");
const { body, validationResult } = require('express-validator');
const rateLimit = require("express-rate-limit");
const csrf = require('csurf');

// CSRF Protection
const csrfProtection = csrf({ cookie: true });

// Rate limiting for form submissions
const formLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: "Too many form submissions from this IP, please try again later"
});

/* ***************************
 * Validation Rules
 * ************************** */
const validate = {
  classification: [
    body('classification_name')
      .trim()
      .notEmpty().withMessage('Classification name is required')
      .matches(/^[a-zA-Z0-9]+$/).withMessage('No spaces or special characters allowed')
      .isLength({ max: 30 }).withMessage('Must be less than 30 characters')
      .escape()
  ],
  
  inventory: [
    body('inv_make')
      .trim()
      .notEmpty().withMessage('Make is required')
      .isLength({ min: 2, max: 30 }).withMessage('Make must be 2-30 characters')
      .escape(),
    body('inv_model')
      .trim()
      .notEmpty().withMessage('Model is required')
      .isLength({ min: 2, max: 30 }).withMessage('Model must be 2-30 characters')
      .escape(),
    body('inv_year')
      .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
      .withMessage(`Year must be between 1900 and ${new Date().getFullYear() + 1}`),
    body('inv_description')
      .trim()
      .isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
    body('inv_price')
      .isFloat({ gt: 0 }).withMessage('Price must be greater than 0'),
    body('inv_miles')
      .isInt({ gt: 0 }).withMessage('Miles must be greater than 0'),
    body('inv_color').trim().notEmpty().withMessage('Color is required').escape(),
    body('classification_id')
      .isInt().withMessage('Valid classification is required'),
    body('inv_image').trim().isURL().withMessage('Valid image URL is required'),
    body('inv_thumbnail').trim().isURL().withMessage('Valid thumbnail URL is required')
  ]
};

/* ***************************
 * Routes
 * ************************** */
router.get("/", 
  csrfProtection, utilities.handleErrors(invController.buildManagementView)
);

router.get("/add-classification", 
  csrfProtection,
  utilities.handleErrors(invController.buildAddClassification)
);

router.post("/add-classification",
  csrfProtection,
  formLimiter,
  validate.classification,
  utilities.handleErrors(invController.addClassification)
);

router.get("/add-inventory",
  csrfProtection,
  utilities.handleErrors(invController.buildAddInventory)
);

router.post("/add-inventory",
  csrfProtection,
  formLimiter,
  validate.inventory,
  utilities.handleErrors(invController.addInventory)
);

// Existing classification and detail routes
router.get("/type/:classificationId", 
  utilities.handleErrors(invController.buildByClassificationId)
);
router.get("/detail/:inv_id", 
  utilities.handleErrors(invController.buildByInventoryId)
);

module.exports = router;