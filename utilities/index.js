const invModel = require("../models/inventory-model");
const Util = {};

/* ****************************************
 * Navigation Builder
 * *************************************** */
Util.getNav = async function () {
  try {
    const data = await invModel.getClassifications();
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
    return "<ul><li><a href='/'>Home</a></li></ul>";
  }
};

/* ****************************************
 * Build Classification Grid View
 * *************************************** */
Util.buildClassificationGrid = async function(data) {
  try {
    if (!data || !data.rows || data.rows.length === 0) {
      return '<div class="alert alert-info">No vehicles found in this classification.</div>';
    }

    let grid = '<div class="row vehicle-grid">';
    
    data.rows.forEach(vehicle => {
      const thumbnail = vehicle.inv_thumbnail || '/images/vehicles/no-image-tn.jpg';
      const image = vehicle.inv_image || '/images/vehicles/no-image.jpg';
      
      grid += `
        <div class="col-md-4 mb-4">
          <div class="card h-100">
            <a href="/inv/detail/${vehicle.inv_id}">
              <img src="${thumbnail}" 
                   class="card-img-top" 
                   alt="${vehicle.inv_make} ${vehicle.inv_model}"
                   onerror="this.onerror=null;this.src='/images/vehicles/no-image-tn.jpg'">
            </a>
            <div class="card-body">
              <h5 class="card-title">
                ${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}
              </h5>
              <p class="card-text">
                <strong>Price:</strong> $${new Intl.NumberFormat('en-US').format(vehicle.inv_price)}<br>
                <strong>Miles:</strong> ${new Intl.NumberFormat('en-US').format(vehicle.inv_miles)}
              </p>
              <a href="/inv/detail/${vehicle.inv_id}" class="btn btn-primary">Details</a>
            </div>
          </div>
        </div>
      `;
    });
    
    grid += '</div>';
    return grid;
  } catch (error) {
    console.error("buildClassificationGrid error:", error);
    return '<div class="alert alert-danger">Error loading vehicles</div>';
  }
};

/* ****************************************
 * Classification Select List Builder
 * *************************************** */
Util.buildClassificationList = async function(classification_id = null) {
  try {
    const data = await invModel.getClassifications();
    let select = `
      <select name="classification_id" id="classificationList" 
        class="form-select ${classification_id === null ? 'is-invalid' : ''}"
        required
      >
        <option value="">Choose a Classification</option>
    `;
    
    data.rows.forEach((row) => {
      select += `
        <option value="${row.classification_id}"
          ${classification_id == row.classification_id ? "selected" : ""}
        >
          ${row.classification_name}
        </option>
      `;
    });
    
    select += "</select>";
    return select;
  } catch (error) {
    console.error("buildClassificationList error:", error);
    return '<select class="form-select is-invalid"><option>Error loading classifications</option></select>';
  }
};

/* ****************************************
 * Error Handling
 * *************************************** */
Util.handleErrors = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

Util.handleError = function(error, req, res) {
  console.error('Error:', {
    message: error.message,
    stack: error.stack,
    route: req.originalUrl,
    user: req.session.account?.account_id,
    timestamp: new Date().toISOString()
  });
  
  const statusCode = error.status || 500;
  const errorMessage = process.env.NODE_ENV === 'development' ? 
    error.message : 'An unexpected error occurred';
  
  req.flash('error', errorMessage);
  
  if (req.originalUrl.startsWith('/inv')) {
    return res.redirect('/inv/');
  }
  return res.redirect('/');
};
/* ****************************************
 * Check Login Middleware
 * *************************************** */
Util.checkLogin = (req, res, next) => {
  if (req.session.account?.id) {
    return next();
  }
  req.flash("notice", "Please log in.");
  return res.redirect("/account/login");
};
module.exports = Util;