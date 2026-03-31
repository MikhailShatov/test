const http = require('http');
const app = require('./app');
const env = require('./config/env');
const { connectRedis } = require('./db/redis');
const db = require('./db/postgres');

async function start() {
  try {
    await db.query('SELECT 1');
    console.log('PostgreSQL connected');

    if (env.cacheEnabled) {
      await connectRedis();
      console.log('Redis connected');
    } else {
      console.log('Redis connection skipped because CACHE_ENABLED=false');
    }

    const server = http.createServer(app);
    server.listen(env.port, () => {
      console.log(`API listening on port ${env.port}`);
    });
  } catch (error) {
    console.error('Failed to start application', error);
    process.exit(1);
  }
}

start();