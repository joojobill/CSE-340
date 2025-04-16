const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");

const invCont = {};

/* ******************************************
 * Build management view
 * ******************************************/
invCont.buildManagementView = async (req, res, next) => {
  try {
    res.render("inventory/management", {
      title: "Inventory Management",
      nav: await utilities.getNav(),
      messages: req.flash(),
      csrfToken: req.csrfToken()
    });
  } catch (error) {
    utilities.handleError(error, req, res);
  }
};

/* ******************************************
 * Build classification view
 * ******************************************/
invCont.buildByClassificationId = async (req, res, next) => {
  try {
    const classification_id = parseInt(req.params.classificationId);
    if (isNaN(classification_id)) {
      req.flash('error', 'Invalid classification ID');
      return res.redirect('/inv/');
    }

    const data = await invModel.getInventoryByClassificationId(classification_id);
    
    if (!data || !data.rows || data.rows.length === 0) {
      req.flash('notice', 'No vehicles found in this classification');
      return res.redirect('/inv/');
    }

    const grid = await utilities.buildClassificationGrid(data);
    
    res.render("inventory/classification", {
      title: `${data.rows[0].classification_name} vehicles`,
      nav: await utilities.getNav(),
      grid: grid,
      messages: req.flash(),
      classification_name: data.rows[0].classification_name, 
      errors: [] // Ensure errors is defined
    });
  } catch (error) {
    utilities.handleError(error, req, res);
  }
};

/* ******************************************
 * Build inventory detail view
 * ******************************************/
invCont.buildByInventoryId = async (req, res, next) => {
  try {
    const inv_id = parseInt(req.params.inv_id);
    if (isNaN(inv_id)) {
      req.flash('error', 'Invalid inventory ID');
      return res.redirect('/inv/');
    }

    const data = await invModel.getInventoryById(inv_id);
    if (!data) {
      req.flash('error', 'Vehicle not found');
      return res.redirect('/inv/');
    }

    res.render("inventory/detail", {
      title: `${data.inv_make} ${data.inv_model}`,
      nav: await utilities.getNav(),
      vehicle: data,
      messages: req.flash()
    });
  } catch (error) {
    utilities.handleError(error, req, res);
  }
};

/* ******************************************
 * Build add classification view
 * ******************************************/
invCont.buildAddClassification = async (req, res, next) => {
  try {
    res.render("inventory/add-classification", {
      title: "Add Classification",
      nav: await utilities.getNav(),
      errors: req.flash('errors') || [], // Ensure errors is always an array
      classification_name: req.flash('classification_name')[0] || "",
      messages: req.flash(),
      csrfToken: req.csrfToken()
    });
  } catch (error) {
    utilities.handleError(error, req, res);
  }
};

/* ******************************************
 * Process classification addition
 * ******************************************/
invCont.addClassification = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash('errors', errors.array());
    req.flash('classification_name', req.body.classification_name);
    return res.redirect("/inv/add-classification");
  }

  try {
    const { classification_name } = req.body;
    const result = await invModel.addClassification(classification_name);
    
    if (result) {
      req.flash("success", "Classification added successfully!");
      return res.redirect("/inv/");
    }
    throw new Error("Classification addition failed");
  } catch (error) {
    req.flash("error", error.message.includes('unique') ? 
      "Classification name already exists" : "Failed to add classification");
    req.flash("classification_name", req.body.classification_name);
    res.redirect("/inv/add-classification");
  }
};

/* ******************************************
 * Build add inventory view
 * ******************************************/
invCont.buildAddInventory = async (req, res, next) => {
  try {
    const classificationList = await utilities.buildClassificationList();
    res.render("inventory/add-inventory", {
      title: "Add Inventory",
      nav: await utilities.getNav(),
      classificationList,
      errors: req.flash('errors') || [],
      messages: req.flash(),
      csrfToken: req.csrfToken()
    });
  } catch (error) {
    utilities.handleError(error, req, res);
  }
};

module.exports = invCont;