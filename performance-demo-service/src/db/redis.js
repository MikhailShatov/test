const { createClient } = require('redis');
const env = require('../config/env');

const client = createClient({ url: env.redisUrl });

client.on('error', (error) => {
  console.error('Redis client error', error);
});

async function connectRedis() {
  if (!client.isOpen) {
    await client.connect();
  }
}

module.exports = {
  client,
  connectRedis
};
