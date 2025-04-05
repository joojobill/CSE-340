const { Pool } = require("pg");
require("dotenv").config();

/**
 * Database Connection Pool
 * - Configures connection based on environment (development/production)
 * - Handles SSL settings for local vs production environments
 * - Provides query method with error logging
 */
let pool;

// Development environment configuration
if (process.env.NODE_ENV === "development") {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : false
  });
} 
// Production environment configuration
else {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: true } // Enforce SSL in production
  });
}

/**
 * Query Function
 * @param {string} text - SQL query string
 * @param {array} params - Query parameters
 * @returns {object} Query result
 */
module.exports = {
  async query(text, params) {
    try {
      const res = await pool.query(text, params);
      console.log("Executed query:", { text });
      return res;
    } catch (error) {
      console.error("Query error:", { text, error });
      throw error;
    }
  }
};