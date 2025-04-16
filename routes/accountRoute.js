const express = require('express');
const router = express.Router();
const utilities = require('../utilities');
const accountController = require('../controllers/accountController');
const validate = require('../utilities/account-validation');

/* ****************************************
 * Account Routes
 * *************************************** */

// Login routes
router.get('/login', utilities.handleErrors(accountController.buildLogin));
router.post('/login',
  validate.loginRules(),
  validate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
);

// Registration routes
router.get('/register', utilities.handleErrors(accountController.buildRegister));
router.post(
  '/register',
  validate.registrationRules(),
  validate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
);

// Account management route
router.get('/', utilities.checkLogin, utilities.handleErrors(accountController.buildManagement)
);

// Logout route
router.get('/logout', (req, res) => {
  res.clearCookie('jwt');
  req.flash('success', 'You have been logged out');
  res.redirect('/');
});


// Update account routes
router.get('/update/:account_id', 
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildUpdate)
);

router.post('/update', 
  utilities.checkLogin,
  validate.updateRules(),
  validate.checkUpdateData,
  utilities.handleErrors(accountController.updateAccount)
);

router.post('/update-password', 
  utilities.checkLogin,
  validate.passwordRules(),
  validate.checkPasswordData,
  utilities.handleErrors(accountController.updatePassword)
);


module.exports = router;