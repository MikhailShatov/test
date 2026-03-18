const { Pool } = require('pg');
const env = require('../config/env');

const pool = new Pool(env.db);

pool.on('error', (error) => {
  console.error('Unexpected PostgreSQL pool error', error);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  getClient: () => pool.connect(),
  pool
};
