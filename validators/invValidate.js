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
// Add this to your form view templates or a separate validation.js file
document.addEventListener('DOMContentLoaded', function() {
  // Real-time validation for all forms
  const forms = document.querySelectorAll('form.needs-validation');
  
  forms.forEach(form => {
    const inputs = form.querySelectorAll('input, textarea, select');
    
    // Real-time validation as user types
    inputs.forEach(input => {
      input.addEventListener('input', function() {
        validateField(this);
      });
      
      // Validate on blur (when leaving field)
      input.addEventListener('blur', function() {
        validateField(this);
      });
    });
    
    // Form submission handler
    form.addEventListener('submit', function(event) {
      if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
        
        // Force validation of all fields
        inputs.forEach(input => {
          validateField(input);
        });
      }
      
      form.classList.add('was-validated');
    });
  });
  
  function validateField(field) {
    const errorElement = field.parentElement.querySelector('.invalid-feedback');
    
    if (field.validity.valid) {
      field.classList.remove('is-invalid');
      field.classList.add('is-valid');
      if (errorElement) errorElement.style.display = 'none';
    } else {
      field.classList.remove('is-valid');
      field.classList.add('is-invalid');
      if (errorElement) errorElement.style.display = 'block';
    }
  }
});
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