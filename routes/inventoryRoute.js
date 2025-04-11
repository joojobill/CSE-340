const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const utilities = require("../utilities");
const { body, validationResult } = require('express-validator');

const validate = {
  classificationRules: () => {
    return [
      body('classification_name')
        .trim()
        .notEmpty().withMessage('Classification name is required')
        .matches(/^[a-zA-Z0-9]+$/).withMessage('No spaces or special characters allowed')
        .isLength({ max: 30 }).withMessage('Must be less than 30 characters')
    ];
  },

  inventoryRules: () => {
    return [
      body('inv_make')
        .trim()
        .notEmpty().withMessage('Make is required')
        .isLength({ min: 2, max: 30 }).withMessage('Make must be 2-30 characters'),
      body('inv_model')
        .trim()
        .notEmpty().withMessage('Model is required')
        .isLength({ min: 2, max: 30 }).withMessage('Model must be 2-30 characters'),
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
      body('inv_color').trim().notEmpty().withMessage('Color is required'),
      body('classification_id')
        .isInt().withMessage('Valid classification is required'),
      body('inv_image').trim().notEmpty().withMessage('Image path is required'),
      body('inv_thumbnail').trim().notEmpty().withMessage('Thumbnail path is required')
    ];
  },

  checkClassificationData: async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash('errors', errors.array());
      req.flash('classification_name', req.body.classification_name);
      return res.redirect('/inv/add-classification');
    }
    next();
  },

  checkInventoryData: async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash('errors', errors.array());
      req.flash('formData', req.body);
      return res.redirect('/inv/add-inventory');
    }
    next();
  }
};

router.get("/", utilities.handleErrors(invController.buildManagementView));

router.get("/add-classification", utilities.handleErrors(invController.buildAddClassification));
router.post(
  "/add-classification",
  validate.classificationRules(),
  validate.checkClassificationData,
  utilities.handleErrors(invController.addClassification)
);

router.get("/add-inventory", utilities.handleErrors(invController.buildAddInventory));
router.post(
  "/add-inventory",
  validate.inventoryRules(),
  validate.checkInventoryData,
  utilities.handleErrors(invController.addInventory)
);

router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));
router.get("/detail/:inv_id", utilities.handleErrors(invController.buildByInventoryId));

module.exports = router;