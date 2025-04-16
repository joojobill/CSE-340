const pool = require("../database/");

/* ******************************************
 * Get all classifications
 * ******************************************/
async function getClassifications() {
  try {
    const result = await pool.query(
      "SELECT * FROM public.classification ORDER BY classification_name"
    );
    return result;
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
    if (!classification_id || isNaN(classification_id)) {
      throw new Error("Invalid classification ID");
    }

    const result = await pool.query(
      `SELECT i.*, c.classification_name 
       FROM public.inventory AS i
       JOIN public.classification AS c
       ON i.classification_id = c.classification_id
       WHERE i.classification_id = $1
       ORDER BY i.inv_make, i.inv_model`,
      [classification_id]
    );
    return result;
  } catch (error) {
    console.error("getInventoryByClassificationId error:", error);
    throw error;
  }
}

/* ******************************************
 * Get single inventory item by ID
 * ******************************************/
async function getInventoryById(inv_id) {
  try {
    if (!inv_id || isNaN(inv_id)) {
      throw new Error("Invalid inventory ID");
    }

    const result = await pool.query(
      "SELECT * FROM public.inventory WHERE inv_id = $1",
      [inv_id]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error("getInventoryById error:", error);
    throw error;
  }
}

/* ******************************************
 * Add new classification
 * ******************************************/
async function addClassification(classification_name) {
  try {
    const result = await pool.query(
      "INSERT INTO public.classification (classification_name) VALUES ($1) RETURNING *",
      [classification_name]
    );
    return result.rows[0];
  } catch (error) {
    console.error("addClassification error:", error);
    throw error;
  }
}

/* ******************************************
 * Add new inventory item
 * ******************************************/
async function addInventory(
  inv_make,
  inv_model,
  inv_year,
  inv_description,
  inv_price,
  inv_miles,
  inv_color,
  classification_id,
  inv_image
) {
  try {
    const result = await pool.query(
      `INSERT INTO public.inventory (
        inv_make, inv_model, inv_year, inv_description,
        inv_price, inv_miles, inv_color, classification_id, inv_image
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        inv_make,
        inv_model,
        inv_year,
        inv_description,
        inv_price,
        inv_miles,
        inv_color,
        classification_id,
        inv_image
      ]
    );
    return result.rows[0];
  } catch (error) {
    console.error("addInventory error:", error);
    throw error;
  }
}

/* ******************************************
 * Delete inventory item by ID
 * ******************************************/
async function deleteInventoryItem(inv_id) {
  try {
    if (!inv_id || isNaN(inv_id)) {
      throw new Error("Invalid inventory ID");
    }

    const result = await pool.query(
      "DELETE FROM public.inventory WHERE inv_id = $1",
      [inv_id]
    );
    return result;
  } catch (error) {
    console.error("deleteInventoryItem error:", error);
    throw error;
  }
}

module.exports = {
  getClassifications,
  getInventoryByClassificationId,
  getInventoryById,
  addClassification,
  addInventory,
  deleteInventoryItem
};
