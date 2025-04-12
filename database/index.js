const { Pool } = require('pg');
require('dotenv').config();

const poolConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  max: 20 // Maximum number of clients in the pool
};

const pool = new Pool(poolConfig);

// Test connection on startup
pool.query('SELECT NOW()')
  .then(() => console.log('Database connected successfully'))
  .catch(err => console.error('Database connection error:', err));

// Enhanced error handling
pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
  // Optionally: reconnect logic here
});

module.exports = {
  async query(text, params) {
    const start = Date.now();
    try {
      const res = await pool.query(text, params);
      const duration = Date.now() - start;
      console.log('Executed query', { text, duration, rows: res.rowCount });
      return res;
    } catch (error) {
      console.error('Database query error:', {
        query: text,
        params: params || [],
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  },
  pool,
  // Add helper methods
  getClient: async () => {
    const client = await pool.connect();
    const query = client.query;
    const release = client.release;
    
    // Set a timeout of 5 seconds
    const timeout = setTimeout(() => {
      console.error('A client has been checked out for more than 5 seconds!');
    }, 5000);
    
    // Monkey patch the query method
    client.query = (...args) => {
      clearTimeout(timeout);
      return query.apply(client, args);
    };
    
    client.release = () => {
      clearTimeout(timeout);
      release.apply(client);
    };
    
    return client;
  }
};