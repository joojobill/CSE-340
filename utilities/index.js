const invModel = require("../models/inventory-model");
const Util = {};

/**
 * Builds navigation HTML with classifications
 * @returns {Promise<string>} HTML unordered list
 */
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

/**
 * Builds HTML grid for classification view
 * @param {Array} data - Inventory items array
 * @returns {string} HTML grid
 */
Util.buildClassificationGrid = async function(data) {
  let grid = '';
  
  if (data.length > 0) {
    grid = '<ul id="inv-display">';
    
    data.forEach(vehicle => {
      grid += `
        <li>
          <a href="../../inv/detail/${vehicle.inv_id}" 
             title="View ${vehicle.inv_make} ${vehicle.inv_model} details">
            <img src="${vehicle.inv_thumbnail}" 
                 alt="${vehicle.inv_make} ${vehicle.inv_model} on CSE Motors">
          </a>
          <div class="namePrice">
            <hr />
            <h2>
              <a href="../../inv/detail/${vehicle.inv_id}"
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

/**
 * Error handling middleware wrapper
 * @param {Function} fn - Async middleware function
 * @returns {Function} Wrapped middleware
 */
Util.handleErrors = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = Util;