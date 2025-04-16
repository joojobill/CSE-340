const jwt = require("jsonwebtoken");
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
      },
      csrfToken: req.csrfToken() // Add CSRF token here
    });
  } catch (error) {
    next(error);
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
      req.flash("error", "Email already exists. Please log in or use a different email.");
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
    req.flash("error", "Please check your credentials and try again.");
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      messages: {
        error: ["Incorrect email or password"]
      },
      formData: { account_email },
      csrfToken: req.csrfToken() // Include CSRF token
    });
    return;
  }

  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password;
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 });
      if (process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 });
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 });
      }
      return res.redirect("/account/");
    } else {
      req.flash("error", "Incorrect password. Please try again.");
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        messages: {
          error: ["Incorrect password"]
        },
        formData: { account_email },
        csrfToken: req.csrfToken() // Include CSRF token
      });
    }
  } catch (error) {
    throw new Error('Access Forbidden');
  }
};


// Build update view
accountController.buildUpdate = async (req, res, next) => {
  try {
    const account_id = req.params.account_id;
    const accountData = await accountModel.getAccountById(account_id);
    let nav = await utilities.getNav();
    
    res.render("account/update", {
      title: "Update Account",
      nav,
      accountData,
      messages: {
        error: req.flash('error'),
        formData: req.flash('formData')[0] || {}
      }
    });
  } catch (error) {
    next(error);
  }
};

// Process account update
accountController.updateAccount = async (req, res, next) => {
  try {
    const { account_id, account_firstname, account_lastname, account_email } = req.body;
    
    const updateResult = await accountModel.updateAccount(
      account_id,
      account_firstname,
      account_lastname,
      account_email
    );

    if (updateResult) {
      req.flash("success", "Account updated successfully");
      res.redirect("/account/");
    } else {
      throw new Error("Account update failed");
    }
  } catch (error) {
    req.flash("error", error.message);
    req.flash("formData", req.body);
    res.redirect(`/account/update/${req.body.account_id}`);
  }
};

// Process password update
accountController.updatePassword = async (req, res, next) => {
  try {
    const { account_id, account_password } = req.body;
    const hashedPassword = await bcrypt.hash(account_password, 10);
    
    const updateResult = await accountModel.updatePassword(
      account_id,
      hashedPassword
    );

    if (updateResult) {
      req.flash("success", "Password updated successfully");
      res.redirect("/account/");
    } else {
      throw new Error("Password update failed");
    }
  } catch (error) {
    req.flash("error", error.message);
    res.redirect(`/account/update/${req.body.account_id}`);
  }
};

module.exports = accountController;
