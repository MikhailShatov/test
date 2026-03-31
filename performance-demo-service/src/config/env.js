const dotenv = require('dotenv');

dotenv.config();

function toNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

module.exports = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: toNumber(process.env.PORT, 3000),
  jwtSecret: process.env.JWT_SECRET || 'super-secret-key',

  db: {
    host: process.env.DB_HOST || 'localhost',
    port: toNumber(process.env.DB_PORT, 5432),
    database: process.env.DB_NAME || 'perf_demo',
    user: process.env.DB_USER || 'perf_user',
    password: process.env.DB_PASSWORD || 'perf_pass'
  },

  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  cacheTtlSeconds: toNumber(process.env.CACHE_TTL_SECONDS, 30),
  cacheEnabled: process.env.CACHE_ENABLED !== 'false',

  performance: {
    productListSlowMs: toNumber(process.env.PRODUCT_LIST_SLOW_MS, 120),
    productDetailsSlowMs: toNumber(process.env.PRODUCT_DETAILS_SLOW_MS, 80),
    paymentDelayMs: toNumber(process.env.PAYMENT_DELAY_MS, 150)
  }
};