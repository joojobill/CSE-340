const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");

const invCont = {};

/* ******************************************
 * Build inventory by classification view
 * ******************************************/
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId;
  const data = await invModel.getInventoryByClassificationId(classification_id);
  const grid = await utilities.buildClassificationGrid(data);
  let nav = await utilities.getNav();
  const className = data[0]?.classification_name || "Unknown";
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  });
};

/* ******************************************
 * Build inventory by inventory view
 * ******************************************/
invCont.buildByInventoryId = async function (req, res, next) {
  try {
    const inv_id = req.params.inv_id;
    const data = await invModel.getInventoryById(inv_id);
    const grid = await utilities.buildInventoryDetail(data);
    let nav = await utilities.getNav();
    res.render("./inventory/detail", {
      title: `${data.inv_make} ${data.inv_model}`,
      nav,
      grid,
    });
  } catch (error) {
    next(error);
  }
};

// Render management view
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

// Render add classification form
invCont.buildAddClassification = async (req, res, next) => {
  try {
    res.render("inventory/add-classification", {
      title: "Add Classification",
      nav: await utilities.getNav(),
      errors: null,
      classification_name: "",
    });
  } catch (error) {
    next(error);
  }
};

// Process classification addition
invCont.addClassification = async (req, res, next) => {
  try {
    const { classification_name } = req.body;
    await invModel.addClassification(classification_name);
    const nav = await utilities.getNav();
    req.flash("success", "Classification added successfully!");
    res.status(201).render("inventory/management", {
      title: "Inventory Management",
      nav,
      messages: req.flash(),
    });
  } catch (error) {
    next(error);
  }
};

// Render add inventory form
invCont.buildAddInventory = async (req, res, next) => {
  try {
    const classificationList = await utilities.buildClassificationList();
    res.render("inventory/add-inventory", {
      title: "Add Inventory",
      nav: await utilities.getNav(),
      errors: null,
      classificationList,
      formData: {
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
    });
  } catch (error) {
    next(error);
  }
};

// Process inventory addition
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
    next(error);
  }
};

module.exports = invCont;
