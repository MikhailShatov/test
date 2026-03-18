const db = require('../db/postgres');
const { client } = require('../db/redis');
const env = require('../config/env');
const sleep = require('../utils/sleep');

async function listProducts({ category, limit = 10, offset = 0, sort = 'id', order = 'asc', slow = false }) {
  const cacheKey = `products:${category || 'all'}:${limit}:${offset}:${sort}:${order}:${slow}`;
  const cached = await client.get(cacheKey);

  if (cached) {
    return JSON.parse(cached);
  }

  const allowedSort = ['id', 'price', 'created_at', 'name'];
  const safeSort = allowedSort.includes(sort) ? sort : 'id';
  const safeOrder = order.toLowerCase() === 'desc' ? 'DESC' : 'ASC';

  const values = [];
  let whereClause = '';

  if (category) {
    values.push(category);
    whereClause = `WHERE category = $${values.length}`;
  }

  values.push(limit);
  values.push(offset);

  if (slow) {
    await sleep(120);
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
      limit,
      offset,
      count: result.rowCount
    }
  };

  await client.set(cacheKey, JSON.stringify(data), { EX: env.cacheTtlSeconds });
  return data;
}

async function getProductById(productId, { slow = false }) {
  const cacheKey = `product:${productId}:${slow}`;
  const cached = await client.get(cacheKey);

  if (cached) {
    return JSON.parse(cached);
  }

  if (slow) {
    await sleep(80);
  }

  const result = await db.query(
    'SELECT id, sku, name, category, price, stock, description, created_at FROM products WHERE id = $1',
    [productId]
  );

  if (result.rowCount === 0) {
    return null;
  }

  const product = result.rows[0];
  await client.set(cacheKey, JSON.stringify(product), { EX: env.cacheTtlSeconds });
  return product;
}

module.exports = {
  listProducts,
  getProductById
};
