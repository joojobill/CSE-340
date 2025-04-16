const express = require("express");
const router = express.Router();
const invCont = require("../controllers/invController");
const utilities = require("../utilities");
const validate = require("../utilities/inventory-validation");
const csrf = require('csurf');

// CSRF Protection
const csrfProtection = csrf({ cookie: true });

/* ***************************
 * Routes
 * ************************** */

// Inventory management view
router.get("/", 
  csrfProtection, 
  utilities.handleErrors(invCont.buildManagementView)
);

// Classification view
router.get("/type/:classificationId", 
  utilities.handleErrors(invCont.buildByClassificationId)
);

// Inventory detail view
router.get("/detail/:inv_id", 
  utilities.handleErrors(invCont.buildByInventoryId)
);

// Add classification view
router.get("/add-classification", 
  csrfProtection,
  utilities.checkLogin,
  utilities.checkAccountType,
  utilities.handleErrors(invCont.buildAddClassification)
);

// Process classification addition
router.post("/add-classification",
  csrfProtection,
  validate.classificationRules(),
  validate.checkClassificationData,
  utilities.checkLogin,
  utilities.checkAccountType,
  utilities.handleErrors(invCont.addClassification)
);

// Add inventory view
router.get("/add-inventory",
  csrfProtection,
  utilities.checkLogin,
  utilities.checkAccountType,
  utilities.handleErrors(invCont.buildAddInventory)
);

// Process inventory addition
router.post("/add-inventory",
  csrfProtection,
  validate.inventoryRules(),
  validate.checkInventoryData,
  utilities.checkLogin,
  utilities.checkAccountType,
  utilities.handleErrors(invCont.addInventory)
);

// Delete confirmation view
router.get("/delete/:inv_id", 
  csrfProtection,
  utilities.checkLogin,
  utilities.checkAccountType,
  utilities.handleErrors(invCont.buildDeleteConfirmationView)
);

// Process inventory deletion
router.post("/delete/:inv_id", 
  csrfProtection,
  utilities.checkLogin,
  utilities.checkAccountType,
  utilities.handleErrors(invCont.deleteInventoryItem)
);

module.exports = router;