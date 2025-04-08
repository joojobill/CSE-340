const pool = require("../database/");

/* ******************************************
 * Get all classifications
 * ******************************************/
async function getClassifications() {
  try {
    return await pool.query(
      "SELECT * FROM public.classification ORDER BY classification_name"
    );
  } catch (error) {
    console.error("getClassifications error:", error);
    throw error;
  }
}

/* ******************************************
 * Get inventory by classification ID
 * ******************************************/
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i
       JOIN public.classification AS c
       ON i.classification_id = c.classification_id
       WHERE i.classification_id = $1`,
      [classification_id]
    );
    return data.rows;
  } catch(error) {
    console.error("getInventoryByClassificationId error:", error);
    throw error;
  }
}

/* ******************************************
 * Get single inventory item by ID
 * ******************************************/
async function getInventoryById(inv_id) {
  try {
    const data = await pool.query(
      "SELECT * FROM public.inventory WHERE inv_id = $1",
      [inv_id]
    );
    return data.rows[0];
  } catch(error) {
    console.error("getInventoryById error:", error);
    throw error;
  }
}

/* ******************************************
 * Add new classification
 * ******************************************/
const addClassification = async (classification_name) => {
  try {
    const sql = "INSERT INTO classification (classification_name) VALUES ($1) RETURNING *";
    return await pool.query(sql, [classification_name]);
  } catch (error) {
    console.error("addClassification error:", error);
    throw error;
  }
};

/* ******************************************
 * Add new inventory item
 * ******************************************/
const addInventory = async (
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
) => {
  try {
    const sql = `
      INSERT INTO inventory (
        inv_make, inv_model, inv_year, inv_description,
        inv_image, inv_thumbnail, inv_price, inv_miles,
        inv_color, classification_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    return await pool.query(sql, [
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
    ]);
  } catch (error) {
    console.error("addInventory error:", error);
    throw error;
  }
};

// Export model functions
module.exports = {
  getClassifications,
  getInventoryByClassificationId,
  getInventoryById,
  addClassification,
  addInventory
};