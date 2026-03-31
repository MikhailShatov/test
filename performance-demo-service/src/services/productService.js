const db = require('../db/postgres');
const { client } = require('../db/redis');
const env = require('../config/env');
const sleep = require('../utils/sleep');

function canUseCache() {
  return env.cacheEnabled && client.isOpen;
}

async function readCache(key) {
  if (!canUseCache()) {
    return null;
  }

  const cached = await client.get(key);
  return cached ? JSON.parse(cached) : null;
}

async function writeCache(key, value) {
  if (!canUseCache()) {
    return;
  }

  await client.set(key, JSON.stringify(value), { EX: env.cacheTtlSeconds });
}

async function listProducts({ category, limit = 10, offset = 0, sort = 'id', order = 'asc', slow = false }) {
  const safeLimit = Number.isFinite(Number(limit)) ? Number(limit) : 10;
  const safeOffset = Number.isFinite(Number(offset)) ? Number(offset) : 0;
  const cacheKey = `products:${category || 'all'}:${safeLimit}:${safeOffset}:${sort}:${order}:${slow}`;

  const cached = await readCache(cacheKey);
  if (cached) {
    return cached;
  }

  const allowedSort = ['id', 'price', 'created_at', 'name'];
  const safeSort = allowedSort.includes(sort) ? sort : 'id';
  const safeOrder = String(order).toLowerCase() === 'desc' ? 'DESC' : 'ASC';

  const values = [];
  let whereClause = '';

  if (category) {
    values.push(category);
    whereClause = `WHERE category = $${values.length}`;
  }

  values.push(safeLimit);
  values.push(safeOffset);

  if (slow) {
    await sleep(env.performance.productListSlowMs);
  }

  const query = `
    SELECT id, sku, name, category, price, stock, description, created_at
    FROM products
    ${whereClause}
    ORDER BY ${safeSort} ${safeOrder}
    LIMIT $${values.length - 1} OFFSET $${values.length}
  `;

  const result = await db.query(query, values);
  const data = {
    items: result.rows,
    pagination: {
      limit: safeLimit,
      offset: safeOffset,
      count: result.rowCount
    }
  };

  await writeCache(cacheKey, data);
  return data;
}

async function getProductById(productId, { slow = false }) {
  const safeProductId = Number(productId);
  const cacheKey = `product:${safeProductId}:${slow}`;

  const cached = await readCache(cacheKey);
  if (cached) {
    return cached;
  }

  if (slow) {
    await sleep(env.performance.productDetailsSlowMs);
  }

  const result = await db.query(
    'SELECT id, sku, name, category, price, stock, description, created_at FROM products WHERE id = $1',
    [safeProductId]
  );

  if (result.rowCount === 0) {
    return null;
  }

  const product = result.rows[0];
  await writeCache(cacheKey, product);
  return product;
}

module.exports = {
  listProducts,
  getProductById
};