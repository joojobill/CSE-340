const accountModel = require('../models/account-model');
const utilities = require('../utilities');
const bcrypt = require('bcryptjs');

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
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
}

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
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
}

/* ****************************************
*  Process registration request
* *************************************** */
async function registerAccount(req, res, next) {
  try {
    const { 
      account_firstname, 
      account_lastname, 
      account_email, 
      account_password 
    } = req.body;

    // Validate input
    if (!account_firstname || !account_lastname || !account_email || !account_password) {
      req.flash("error", "All fields are required");
      return res.redirect("/account/register");
    }

    // Check if email exists
    const emailExists = await accountModel.checkExistingEmail(account_email);
    if (emailExists) {
      req.flash("error", "Email already exists. Please log in or use different email.");
      req.flash("account_firstname", account_firstname);
      req.flash("account_lastname", account_lastname);
      req.flash("account_email", account_email);
      return res.redirect("/account/register");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(account_password, 10);

    // Register account
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
}

/* ****************************************
*  Process login request
* *************************************** */
async function accountLogin(req, res, next) {
  try {
    const { account_email, account_password } = req.body;
    const accountData = await accountModel.getAccountByEmail(account_email);
    
    if (!accountData) {
      req.flash("error", "Invalid email or password.");
      req.flash("account_email", account_email);
      return res.redirect("/account/login");
    }

    const passwordMatch = await bcrypt.compare(account_password, accountData.account_password);
    if (!passwordMatch) {
      req.flash("error", "Invalid email or password.");
      req.flash("account_email", account_email);
      return res.redirect("/account/login");
    }

    // Successful login
    req.session.account = {
      id: accountData.account_id,
      firstname: accountData.account_firstname,
      email: accountData.account_email,
      type: accountData.account_type
    };

    req.flash("success", `Welcome back, ${accountData.account_firstname}!`);
    return res.redirect("/account");
    
  } catch (error) {
    console.error("accountLogin error: " + error.message);
    next(error);
  }
}

module.exports = { 
  buildRegister, 
  registerAccount,
  buildLogin,
  accountLogin
};