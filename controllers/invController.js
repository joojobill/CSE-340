const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");
const { validationResult } = require("express-validator");

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
      req.flash("error", "Invalid classification ID");
      return res.redirect("/inv/");
    }

    const data = await invModel.getInventoryByClassificationId(classification_id);
    if (!data || !data.rows || data.rows.length === 0) {
      req.flash("notice", "No vehicles found in this classification");
      return res.redirect("/inv/");
    }

    const grid = await utilities.buildClassificationGrid(data);

    res.render("inventory/classification", {
      title: `${data.rows[0].classification_name} vehicles`,
      nav: await utilities.getNav(),
      grid,
      messages: req.flash(),
      classification_name: data.rows[0].classification_name,
      errors: []
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
      req.flash("error", "Invalid inventory ID");
      return res.redirect("/inv/");
    }

    const data = await invModel.getInventoryById(inv_id);
    if (!data) {
      req.flash("error", "Vehicle not found");
      return res.redirect("/inv/");
    }

    res.render("inventory/detail", {
      title: `${data.inv_make} ${data.inv_model}`,
      nav: await utilities.getNav(),
      vehicle: data,
      messages: req.flash(),
      formData: req.flash("formData")[0] || {},
      utilities
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
      errors: req.flash("errors") || [],
      classification_name: req.flash("classification_name")[0] || "",
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
    req.flash("errors", errors.array());
    req.flash("classification_name", req.body.classification_name);
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
    req.flash("error", error.message.includes("unique")
      ? "Classification name already exists"
      : "Failed to add classification"
    );
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
      errors: req.flash("errors") || [],
      messages: req.flash(),
      formData: req.flash("formData")[0] || {},
      csrfToken: req.csrfToken()
    });
  } catch (error) {
    utilities.handleError(error, req, res);
  }
};

/* ******************************************
 * Process inventory addition
 * ******************************************/
invCont.addInventory = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    req.flash("errors", errors.array());
    req.flash("formData", req.body);
    return res.redirect("/inv/add-inventory");
  }

  try {
    const {
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_price,
      inv_miles,
      inv_color,
      classification_id,
      inv_image
    } = req.body;

    const result = await invModel.addInventory(
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_price,
      inv_miles,
      inv_color,
      classification_id,
      inv_image
    );

    if (result) {
      req.flash("success", "Inventory added successfully!");
      return res.redirect("/inv/");
    }

    throw new Error("Inventory addition failed");
  } catch (error) {
    req.flash("error", "Failed to add inventory: " + error.message);
    req.flash("formData", req.body);
    res.redirect("/inv/add-inventory");
  }
};

/* ******************************************
 * Build Delete Confirmation View
 * ******************************************/
invCont.buildDeleteConfirmationView = async (req, res, next) => {
  const { inv_id } = req.params;

  try {
    const inventory = await invModel.getInventoryById(inv_id);

    if (!inventory) {
      req.flash("error", "Inventory item not found");
      return res.redirect("/inv/");
    }

    const name = `${inventory.inv_make} ${inventory.inv_model}`;

    res.render("inventory/delete-confirm", {
      title: `Delete ${name}`,
      nav: await utilities.getNav(),
      inv_id: inventory.inv_id,
      inv_make: inventory.inv_make,
      inv_model: inventory.inv_model,
      inv_year: inventory.inv_year,
      inv_price: inventory.inv_price,
      classification_id: inventory.classification_id,
      csrfToken: req.csrfToken()
    });
  } catch (error) {
    utilities.handleError(error, req, res);
  }
};

/* ******************************************
 * Process Inventory Deletion
 * ******************************************/
invCont.deleteInventoryItem = async (req, res, next) => {
  const { inv_id } = req.params;

  try {
    const result = await invModel.deleteInventoryItem(parseInt(inv_id));

    if (result.rowCount > 0) {
      req.flash("success", "Inventory item deleted successfully.");
      return res.redirect("/inv/");
    } else {
      req.flash("error", "Failed to delete inventory item.");
      return res.redirect(`/inv/delete/${inv_id}`);
    }
  } catch (error) {
    utilities.handleError(error, req, res);
  }
};

module.exports = invCont;
