/**
 * run-schema.js
 * Connects to Supabase PostgreSQL via the DATABASE_URL in backend/.env
 * and executes database/schema.sql, database/policies.sql
 *
 * Usage: node scripts/run-schema.js
 */

require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 15000,
});

async function runFile(filePath, label) {
  const absolute = path.resolve(__dirname, '../../database', filePath);
  if (!fs.existsSync(absolute)) {
    console.warn(`⚠️  File not found, skipping: ${absolute}`);
    return;
  }

  console.log(`\n📄 Running ${label} → ${absolute}`);
  const sql = fs.readFileSync(absolute, 'utf8');

  const client = await pool.connect();
  try {
    await client.query(sql);
    console.log(`✅ ${label} executed successfully`);
  } catch (err) {
    console.error(`❌ Error in ${label}:`, err.message);
    // Print first 500 chars of the SQL context for debugging
    const idx = sql.indexOf(err.message.split('\n')[0]);
    if (idx !== -1) {
      console.error('   Near SQL:', sql.substring(Math.max(0, idx - 50), idx + 150));
    }
  } finally {
    client.release();
  }
}

async function testConnection() {
  console.log('🔌 Testing database connection...');
  const client = await pool.connect();
  const res = await client.query('SELECT current_database(), current_user, version()');
  client.release();
  const { current_database, current_user, version } = res.rows[0];
  console.log(`✅ Connected!`);
  console.log(`   Database : ${current_database}`);
  console.log(`   User     : ${current_user}`);
  console.log(`   Version  : ${version.split(' ').slice(0, 2).join(' ')}`);
}

async function main() {
  try {
    await testConnection();
    await runFile('schema.sql', 'Schema (tables + indexes + triggers)');
    await runFile('policies.sql', 'RLS Policies');
    console.log('\n🎉 Database setup complete! You can now run seed.sql if needed.');
    console.log('   To seed: node scripts/run-seed.js');
  } catch (err) {
    console.error('\n💥 Fatal error:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();

