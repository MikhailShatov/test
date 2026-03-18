const db = require('../db/postgres');
const { client } = require('../db/redis');

async function health(req, res, next) {
  try {
    const dbResult = await db.query('SELECT 1 AS ok');
    const redisResult = await client.ping();

    return res.status(200).json({
      status: 'ok',
      services: {
        postgres: dbResult.rows[0].ok === 1 ? 'up' : 'down',
        redis: redisResult === 'PONG' ? 'up' : 'down'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  health
};
