// validators/invValidate.js
const { body, validationResult } = require('express-validator');

// Validation rules for inventory items
const inventoryValidationRules = () => {
  return [
    // Add your validation rules here
    // Example:
    body('inv_make').notEmpty().withMessage('Make is required'),
    body('inv_model').notEmpty().withMessage('Model is required'),
    // Add other fields as needed
  ]
}

const validateInventory = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  
  // Format errors and pass to next middleware
  req.flash('errors', errors.array());
  res.redirect('back');
}

module.exports = {
  inventoryValidationRules,
  validateInventory
}