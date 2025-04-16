const jwt = require("jsonwebtoken");
require("dotenv").config();
const accountModel = require('../models/account-model');
const utilities = require('../utilities');
const bcrypt = require('bcryptjs');

const accountController = {};

/* ****************************************
*  Deliver registration view
* *************************************** */
accountController.buildRegister = async (req, res, next) => {
  try {
    let nav = await utilities.getNav();
    res.render("account/register", {
      title: "Register",
      nav,
      errors: null,
      messages: {
        error: req.flash('error'),
        success: req.flash('success')
      },
      formData: {
        account_firstname: req.flash('account_firstname')?.[0] || '',
        account_lastname: req.flash('account_lastname')?.[0] || '',
        account_email: req.flash('account_email')?.[0] || ''
      }
    });
  } catch (error) {
    console.error("buildRegister error: " + error.message);
    next(error);
  }
};

/* ****************************************
*  Deliver login view
* *************************************** */
accountController.buildLogin = async (req, res, next) => {
  try {
    let nav = await utilities.getNav();
    res.render("account/login", {
      title: "Login",
      nav,
      errors: null,
      messages: {
        error: req.flash('error'),
        success: req.flash('success')
      },
      formData: {
        account_email: req.flash('account_email')?.[0] || ''
      }
    });
  } catch (error) {
    next(error);
  }
};

/* ****************************************
*  Deliver account management view
* *************************************** */
accountController.accountManagement = async (req, res) => {
  try {
    let nav = await utilities.getNav();
    res.render('account/accountManagement', {
      title: "Account Management",
      nav,
      messages: {
        error: req.flash('error'),
        success: req.flash('success')
      }
    });
  } catch (error) {
    console.error('Error rendering account management view:', error);
    res.status(500).send('Internal Server Error');
  }
};

/* ****************************************
*  Process registration request
* *************************************** */
accountController.registerAccount = async (req, res, next) => {
  try {
    const { 
      account_firstname, 
      account_lastname, 
      account_email, 
      account_password 
    } = req.body;

    if (!account_firstname || !account_lastname || !account_email || !account_password) {
      req.flash("error", "All fields are required");
      return res.redirect("/account/register");
    }

    const emailExists = await accountModel.checkExistingEmail(account_email);
    if (emailExists) {
      req.flash("error", "Email already exists. Please log in or use different email.");
      req.flash("account_firstname", account_firstname);
      req.flash("account_lastname", account_lastname);
      req.flash("account_email", account_email);
      return res.redirect("/account/register");
    }

    const hashedPassword = await bcrypt.hash(account_password, 10);

    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword
    );

    if (regResult) {
      req.flash(
        "success",
        `Congratulations, ${account_firstname}! You're now registered. Please log in.`
      );
      return res.redirect("/account/login");
    } else {
      throw new Error("Registration failed");
    }
  } catch (error) {
    console.error("registerAccount error: " + error.message);
    req.flash("error", "Registration failed. Please try again.");
    req.flash("account_firstname", req.body.account_firstname);
    req.flash("account_lastname", req.body.account_lastname);
    req.flash("account_email", req.body.account_email);
    res.redirect("/account/register");
  }
};

/* ****************************************
*  Process login request
* *************************************** */
accountController.accountLogin = async (req, res) => {
  let nav = await utilities.getNav();
  const { account_email, account_password } = req.body;
  const accountData = await accountModel.getAccountByEmail(account_email);
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.");
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    });
    return;
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password;
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 });
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 });
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 });
      }
      return res.redirect("/account/");
    } else {
      req.flash("notice", "Please check your credentials and try again.");
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      });
    }
  } catch (error) {
    throw new Error('Access Forbidden');
  }
};

module.exports = accountController;