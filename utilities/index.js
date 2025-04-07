const invModel = require("../models/inventory-model");
const accountModel = require("../models/account-model");
const Util = {};

/* ****************************************
 * Navigation Builder
 * *************************************** */
Util.getNav = async function () {
  try {
    let data = await invModel.getClassifications();
    let list = "<ul>";
    list += '<li><a href="/" title="Home page">Home</a></li>';
    
    data.rows.forEach((row) => {
      list += `<li>
        <a href="/inv/type/${row.classification_id}" 
           title="See our ${row.classification_name} vehicles">
          ${row.classification_name}
        </a>
      </li>`;
    });
    
    list += "</ul>";
    return list;
  } catch (error) {
    console.error("getNav error:", error);
    return "<ul><li><a href='/'>Home</a></li></ul>"; // Fallback navigation
  }
};

/* ****************************************
 * Classification Grid Builder
 * *************************************** */
Util.buildClassificationGrid = async function(data) {
  let grid = '';
  
  if (data?.length > 0) {
    grid = '<ul id="inv-display">';
    
    data.forEach(vehicle => {
      grid += `
        <li>
          <a href="/inv/detail/${vehicle.inv_id}" 
             title="View ${vehicle.inv_make} ${vehicle.inv_model} details">
            <img src="${vehicle.inv_thumbnail}" 
                 alt="${vehicle.inv_make} ${vehicle.inv_model} on CSE Motors">
          </a>
          <div class="namePrice">
            <hr />
            <h2>
              <a href="/inv/detail/${vehicle.inv_id}"
                 title="View ${vehicle.inv_make} ${vehicle.inv_model} details">
                ${vehicle.inv_make} ${vehicle.inv_model}
              </a>
            </h2>
            <span>$${new Intl.NumberFormat('en-US').format(vehicle.inv_price)}</span>
          </div>
        </li>`;
    });
    
    grid += '</ul>';
  } else {
    grid = '<p class="notice">Sorry, no matching vehicles could be found.</p>';
  }
  
  return grid;
};

/* ****************************************
 * Classification Select List Builder
 * *************************************** */
Util.buildClassificationList = async function(classification_id = null) {
  try {
    const data = await invModel.getClassifications();
    let classificationList = `
      <select name="classification_id" id="classificationList" 
        class="form-select ${classification_id === null ? 'is-invalid' : ''}"
        required
      >
        <option value="">Choose a Classification</option>
    `;
    
    data.rows.forEach((row) => {
      classificationList += `
        <option value="${row.classification_id}"
          ${classification_id == row.classification_id ? "selected" : ""}
        >
          ${row.classification_name}
        </option>
      `;
    });
    
    classificationList += "</select>";
    return classificationList;
  } catch (error) {
    console.error("buildClassificationList error:", error);
    return '<select class="form-select is-invalid"><option>Error loading classifications</option></select>';
  }
};

/* ****************************************
 * Error Handling Middleware Wrapper
 * *************************************** */
Util.handleErrors = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/* ****************************************
 * Login Status Check Middleware
 * *************************************** */
Util.checkLogin = (req, res, next) => {
  if (req.session.account?.account_id) {
    return next();
  }
  req.flash("notice", "Please log in.");
  return res.redirect("/account/login");
};

/* ****************************************
 * Account Type Check Middleware
 * @param {string} requiredType - Required account type
 * *************************************** */
Util.checkAccountType = (requiredType) => {
  return (req, res, next) => {
    if (req.session.account?.account_type === requiredType) {
      return next();
    }
    req.flash("notice", "Unauthorized access.");
    return res.redirect("/account");
  };
};

/* ****************************************
 * Build Inventory Detail View HTML
 * *************************************** */
Util.buildInventoryDetail = async function(vehicle) {
  try {
    return `
      <div class="vehicle-detail">
        <img src="${vehicle.inv_image}" 
             alt="${vehicle.inv_make} ${vehicle.inv_model}" 
             class="detail-image">
        <div class="detail-info">
          <h2>${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}</h2>
          <p><strong>Price:</strong> $${new Intl.NumberFormat('en-US').format(vehicle.inv_price)}</p>
          <p><strong>Description:</strong> ${vehicle.inv_description}</p>
          <p><strong>Color:</strong> ${vehicle.inv_color}</p>
          <p><strong>Mileage:</strong> ${new Intl.NumberFormat('en-US').format(vehicle.inv_miles)} miles</p>
        </div>
      </div>
    `;
  } catch (error) {
    console.error("buildInventoryDetail error:", error);
    return '<p class="notice">Sorry, vehicle details could not be loaded.</p>';
  }
};

module.exports = Util;