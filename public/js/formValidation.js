// Client-side form validation for all forms
document.addEventListener('DOMContentLoaded', function() {
    // Validate classification form
    const classificationForm = document.getElementById('classificationForm');
    if (classificationForm) {
      initClassificationValidation();
    }
  
    // Validate inventory form
    const inventoryForm = document.getElementById('inventoryForm');
    if (inventoryForm) {
      initInventoryValidation();
    }
  
    function initClassificationValidation() {
      const nameInput = document.getElementById('classification_name');
      const errorDiv = document.getElementById('classificationError');
  
      nameInput.addEventListener('input', function() {
        const value = this.value.trim();
        if (!/^[a-zA-Z0-9]+$/.test(value)) {
          errorDiv.textContent = 'No spaces or special characters allowed';
          this.classList.add('is-invalid');
        } else {
          errorDiv.textContent = '';
          this.classList.remove('is-invalid');
        }
      });
    }
  
    function initInventoryValidation() {
      // Real-time validation for all fields
      const fields = [
        { id: 'inv_make', min: 2, max: 30 },
        { id: 'inv_model', min: 2, max: 30 },
        { id: 'inv_year', min: 1900, max: new Date().getFullYear() + 1 },
        { id: 'inv_description', min: 10 },
        { id: 'inv_price', min: 0 },
        { id: 'inv_miles', min: 0 },
        { id: 'inv_color' }
      ];
  
      fields.forEach(field => {
        const input = document.getElementById(field.id);
        if (input) {
          input.addEventListener('blur', validateField);
          input.addEventListener('input', validateField);
        }
      });
  
      function validateField(e) {
        const input = e.target;
        const errorDiv = document.getElementById(`${input.id}Error`);
        
        // Required field check
        if (input.required && !input.value.trim()) {
          errorDiv.textContent = 'This field is required';
          input.classList.add('is-invalid');
          return;
        }
  
        // Numeric fields validation
        if (input.type === 'number') {
          const value = parseFloat(input.value);
          if (isNaN(value) || 
              (field.min !== undefined && value < field.min) || 
              (field.max !== undefined && value > field.max)) {
            errorDiv.textContent = `Must be between ${field.min} and ${field.max}`;
            input.classList.add('is-invalid');
            return;
          }
        }
  
        // Length validation
        if (field.min && input.value.length < field.min) {
          errorDiv.textContent = `Must be at least ${field.min} characters`;
          input.classList.add('is-invalid');
          return;
        }
  
        // If all validations pass
        errorDiv.textContent = '';
        input.classList.remove('is-invalid');
      }
    }
  });