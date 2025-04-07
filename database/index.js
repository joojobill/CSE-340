const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for Render.com
  },
  connectionTimeoutMillis: 10000, // 10 second timeout
  idleTimeoutMillis: 30000
});

// Error handling
pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
});

module.exports = {
  async query(text, params) {
    try {
      const res = await pool.query(text, params);
      return res;
    } catch (error) {
      console.error('Database query error:', {
        query: text,
        error: error.message
      });
      throw error;
    }
  },
  pool
};