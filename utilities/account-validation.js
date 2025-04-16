const { body, validationResult } = require('express-validator');
const accountModel = require('../models/account-model');

/* ****************************************
 * Registration Validation Rules
 * *************************************** */
const registrationRules = () => {
  return [
    // First name validation
    body('account_firstname')
      .trim()
      .notEmpty()
      .withMessage('First name is required')
      .isLength({ min: 2 })
      .withMessage('First name must be at least 2 characters'),

    // Last name validation
    body('account_lastname')
      .trim()
      .notEmpty()
      .withMessage('Last name is required')
      .isLength({ min: 2 })
      .withMessage('Last name must be at least 2 characters'),

    // Email validation
    body('account_email')
      .trim()
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Please provide a valid email')
      .custom(async (email) => {
        const emailExists = await accountModel.checkExistingEmail(email);
        if (emailExists) {
          throw new Error('Email already exists. Please log in or use different email');
        }
      }),

    // Password validation
    body('account_password')
      .trim()
      .notEmpty()
      .withMessage('Password is required')
      .isLength({ min: 12 })
      .withMessage('Password must be at least 12 characters')
      .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{12,}$/)
      .withMessage('Password must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character')
  ];
};

/* ****************************************
 * Login Validation Rules
 * *************************************** */
const loginRules = () => {
  return [
    body('account_email')
      .trim()
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Please provide a valid email'),

    body('account_password')
      .trim()
      .notEmpty()
      .withMessage('Password is required')
  ];
};

/* ****************************************
 * Update Account Validation Rules
 * *************************************** */
const updateRules = () => {
  return [
    body('account_firstname')
      .trim()
      .notEmpty()
      .withMessage('First name is required')
      .isLength({ min: 2 })
      .withMessage('First name must be at least 2 characters'),

    body('account_lastname')
      .trim()
      .notEmpty()
      .withMessage('Last name is required')
      .isLength({ min: 2 })
      .withMessage('Last name must be at least 2 characters'),

    body('account_email')
      .trim()
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Please provide a valid email')
      .custom(async (email, { req }) => {
        const account = await accountModel.getAccountByEmail(email);
        if (account && account.account_id != req.body.account_id) {
          throw new Error('Email already in use by another account');
        }
      })
  ];
};

/* ****************************************
 * Password Update Validation Rules
 * *************************************** */
const passwordRules = () => {
  return [
    body('account_password')
      .trim()
      .notEmpty()
      .withMessage('New password is required')
      .isLength({ min: 12 })
      .withMessage('Password must be at least 12 characters')
      .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{12,}$/)
      .withMessage('Password must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character')
  ];
};

/* ****************************************
 * Check Validation Results
 * *************************************** */
const checkRegData = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash('error', errors.array().map(error => error.msg));
    req.flash('formData', req.body);
    return res.redirect('/account/register');
  }
  next();
};

const checkLoginData = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash('error', errors.array().map(error => error.msg));
    req.flash('account_email', req.body.account_email);
    return res.redirect('/account/login');
  }
  next();
};

const checkUpdateData = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash('error', errors.array().map(error => error.msg));
    req.flash('formData', req.body);
    return res.redirect('/account/update');
  }
  next();
};

const checkPasswordData = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash('error', errors.array().map(error => error.msg));
    return res.redirect('/account/update');
  }
  next();
};

module.exports = {
  registrationRules,
  loginRules,
  updateRules,
  passwordRules,
  checkRegData,
  checkLoginData,
  checkUpdateData,
  checkPasswordData
};