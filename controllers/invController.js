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
    });
  } catch (error) {
    next(error);
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
      errors: req.flash('errors') || null,
      classification_name: req.flash('classification_name') || "",
      messages: req.flash()
    });
  } catch (error) {
    next(error);
  }
};

/* ******************************************
 * Process classification addition
 * ******************************************/
invCont.addClassification = async (req, res, next) => {
  try {
    const { classification_name } = req.body;
    await invModel.addClassification(classification_name);
    req.flash("success", "Classification added successfully!");
    res.redirect("/inv/");
  } catch (error) {
    req.flash("error", "Failed to add classification");
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
      errors: req.flash('errors') || null,
      classificationList,
      formData: req.flash('formData')[0] || {
        inv_make: "",
        inv_model: "",
        inv_year: "",
        inv_description: "",
        inv_image: "/images/vehicles/no-image.jpg",
        inv_thumbnail: "/images/vehicles/no-image-tn.jpg",
        inv_price: "",
        inv_miles: "",
        inv_color: "",
        classification_id: "",
      },
      messages: req.flash()
    });
  } catch (error) {
    next(error);
  }
};

/* ******************************************
 * Process inventory addition
 * ******************************************/
invCont.addInventory = async (req, res, next) => {
  try {
    const {
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id,
    } = req.body;

    await invModel.addInventory(
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id
    );

    req.flash("success", "Inventory item added successfully!");
    res.redirect("/inv/");
  } catch (error) {
    req.flash("error", "Failed to add inventory item");
    req.flash("formData", req.body);
    res.redirect("/inv/add-inventory");
  }
};
/* ******************************************
 * Build inventory by classification view
 * ******************************************/
invCont.buildByClassificationId = async (req, res, next) => {
  try {
    const classificationId = req.params.classificationId;
    const data = await invModel.getInventoryByClassificationId(classificationId);
    
    if (!data?.rows?.length) {
      const error = new Error('No vehicles found for this classification');
      error.statusCode = 404;
      throw error;
    }

    const vehiclesWithImages = data.rows.map(vehicle => ({
      ...vehicle,
      inv_image: vehicle.inv_image || '/images/vehicles/no-image.jpg',
      inv_thumbnail: vehicle.inv_thumbnail || '/images/vehicles/no-image-tn.jpg'
    }));

    const grid = await utilities.buildClassificationGrid(vehiclesWithImages);
    const nav = await utilities.getNav();

    res.render("inventory/classification", {
      title: `${data.classificationName || 'Unknown'} vehicles`,
      nav,
      grid,
      messages: req.flash(),
      errors: null,
      classification_name: "",
      classificationId
    });
  } catch (error) {
    // Use our new error handler
    utilities.handleError(error, req, res);
    // OR you can still use:
    // next(error); if you prefer Express error middleware
  }
};


/* ******************************************
 * Build inventory detail view
 * ******************************************/
invCont.buildByInventoryId = async (req, res, next) => {
  try {
    const inv_id = req.params.inv_id;
    const data = await invModel.getInventoryById(inv_id);
    
    res.render("inventory/detail", {
      title: data.inv_make + " " + data.inv_model,
      nav: await utilities.getNav(),
      vehicle: data,
      messages: req.flash(),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = invCont;