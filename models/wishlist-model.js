const pool = require("../database/");

/* ***************************
 * Add vehicle to wishlist
 * ************************** */
async function addToWishlist(account_id, inv_id) {
  try {
    const sql = "INSERT INTO wishlist (account_id, inv_id) VALUES ($1, $2) RETURNING *";
    return await pool.query(sql, [account_id, inv_id]);
  } catch (error) {
    console.error("addToWishlist error:", error);
    throw error;
  }
}

/* ***************************
 * Remove vehicle from wishlist
 * ************************** */
async function removeFromWishlist(account_id, inv_id) {
  try {
    const sql = "DELETE FROM wishlist WHERE account_id = $1 AND inv_id = $2 RETURNING *";
    return await pool.query(sql, [account_id, inv_id]);
  } catch (error) {
    console.error("removeFromWishlist error:", error);
    throw error;
  }
}

/* ***************************
 * Get user's wishlist
 * ************************** */
async function getWishlist(account_id) {
  try {
    const sql = `
      SELECT i.* FROM wishlist w
      JOIN inventory i ON w.inv_id = i.inv_id
      WHERE w.account_id = $1
      ORDER BY w.added_date DESC
    `;
    return await pool.query(sql, [account_id]);
  } catch (error) {
    console.error("getWishlist error:", error);
    throw error;
  }
}

/* ***************************
 * Check if vehicle is in wishlist
 * ************************** */
async function isInWishlist(account_id, inv_id) {
  try {
    const sql = "SELECT * FROM wishlist WHERE account_id = $1 AND inv_id = $2";
    const result = await pool.query(sql, [account_id, inv_id]);
    return result.rowCount > 0;
  } catch (error) {
    console.error("isInWishlist error:", error);
    throw error;
  }
}

module.exports = {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
  isInWishlist
};