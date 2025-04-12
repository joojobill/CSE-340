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
router.post(
  '/login',
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
router.get(
  '/',
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildAccountManagement)
);

// Logout route
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;