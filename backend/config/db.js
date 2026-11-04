// Direct PostgreSQL connection using pg Pool (for running raw SQL / migrations)
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Required for Supabase Pooler (AWS RDS)
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.on('error', (err) => {
  console.error('PostgreSQL pool error:', err.message);
});

/**
 * Execute a single SQL query
 * @param {string} text  - SQL string
 * @param {Array}  params - Parameterized values
 */
const query = (text, params) => pool.query(text, params);

/**
 * Get a client from the pool (use for transactions)
 */
const getClient = () => pool.connect();

module.exports = { pool, query, getClient };

