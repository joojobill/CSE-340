const pool = require("../database/");

/**
 * Gets all vehicle classifications
 * @returns {Promise<Array>} Array of classification records
 */
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

/**
 * Gets inventory items by classification ID
 * @param {number} classification_id 
 * @returns {Promise<Array>} Array of inventory items
 */
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

/**
 * Gets single inventory item by ID
 * @param {number} inv_id 
 * @returns {Promise<Object>} Inventory item details
 */
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

module.exports = {
  getClassifications,
  getInventoryByClassificationId,
  getInventoryById
};