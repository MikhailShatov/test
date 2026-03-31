const db = require('../db/postgres');
const { client } = require('../db/redis');
const env = require('../config/env');

async function health(req, res, next) {
  try {
    const dbResult = await db.query('SELECT 1 AS ok');

    let redisStatus = 'disabled';
    if (env.cacheEnabled) {
      if (client.isOpen) {
        const redisResult = await client.ping();
        redisStatus = redisResult === 'PONG' ? 'up' : 'down';
      } else {
        redisStatus = 'down';
      }
    }

    return res.status(200).json({
      status: 'ok',
      services: {
        postgres: dbResult.rows[0].ok === 1 ? 'up' : 'down',
        redis: redisStatus
      },
      cacheEnabled: env.cacheEnabled,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  health
};