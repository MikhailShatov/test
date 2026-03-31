const { Pool } = require('pg');
const env = require('../config/env');

function toNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

const pool = new Pool({
  ...env.db,
  max: toNumber(process.env.DB_POOL_MAX, 10),
  min: toNumber(process.env.DB_POOL_MIN, 0),
  idleTimeoutMillis: toNumber(process.env.DB_IDLE_TIMEOUT_MS, 30000),
  connectionTimeoutMillis: toNumber(process.env.DB_CONNECTION_TIMEOUT_MS, 5000),
  application_name: process.env.DB_APPLICATION_NAME || 'performance-demo-service'
});

pool.on('connect', () => {
  console.log('PostgreSQL pool client acquired');
});

pool.on('error', (error) => {
  console.error('Unexpected PostgreSQL pool error', error);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  getClient: () => pool.connect(),
  pool
};