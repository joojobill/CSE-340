// Needed Resources
const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const utilities = require("../utilities");
const { body, validationResult } = require('express-validator');

// Custom validation middleware
const invValidate = {
  /**
   * Classification validation rules
   */
  classificationRules: () => {
    return [
      body('classification_name')
        .trim()
        .isLength({ min: 1 })
        .withMessage('Please provide a classification name')
        .matches(/^[a-zA-Z0-9]+$/)
        .withMessage('Classification name cannot contain spaces or special characters')
    ];
  },

  /**
   * Inventory validation rules
   */
  inventoryRules: () => {
    return [
      body('inv_make')
        .trim()
        .isLength({ min: 1 })
        .withMessage('Make is required'),
      body('inv_model')
        .trim()
        .isLength({ min: 1 })
        .withMessage('Model is required'),
      body('inv_year')
        .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
        .withMessage('Please enter a valid year'),
      body('inv_description')
        .trim()
        .isLength({ min: 10 })
        .withMessage('Description must be at least 10 characters'),
      body('inv_price')
        .isFloat({ gt: 0 })
        .withMessage('Price must be greater than 0'),
      body('inv_miles')
        .isInt({ gt: 0 })
        .withMessage('Miles must be greater than 0'),
      body('inv_color')
        .trim()
        .isLength({ min: 1 })
        .withMessage('Color is required')
    ];
  },

  /**
   * Check validation results for classification
   */
  checkClassificationData: async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      let nav = await utilities.getNav();
      return res.render('inventory/add-classification', {
        title: 'Add New Classification',
        nav,
        errors: errors.array(),
        classification_name: req.body.classification_name
      });
    }
    next();
  },

  /**
   * Check validation results for inventory
   */
  checkInventoryData: async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      let nav = await utilities.getNav();
      let classificationList = await utilities.buildClassificationList();
      return res.render('inventory/add-inventory', {
        title: 'Add New Inventory',
        nav,
        classificationList,
        errors: errors.array(),
        ...req.body
      });
    }
    next();
  }
};

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);
router.get("/detail/:inv_id", invController.buildByInventoryId);

// Classification routes
router.get("/add-classification", invController.buildAddClassification);
router.post(
  "/add-classification",
  invValidate.classificationRules(),
  invValidate.checkClassificationData,
  invController.addClassification
);

// Inventory routes
router.get("/add-inventory", invController.buildAddInventory);
router.post(
  "/add-inventory",
  invValidate.inventoryRules(),
  invValidate.checkInventoryData,
  invController.addInventory
);

module.exports = router;