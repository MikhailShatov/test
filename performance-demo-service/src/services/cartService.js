const db = require('../db/postgres');

async function ensureCart(userId) {
  const existingCart = await db.query('SELECT id FROM carts WHERE user_id = $1', [userId]);

  if (existingCart.rowCount > 0) {
    return existingCart.rows[0].id;
  }

  const createdCart = await db.query(
    `
      INSERT INTO carts (user_id)
      VALUES ($1)
      ON CONFLICT (user_id)
      DO UPDATE SET updated_at = NOW()
      RETURNING id
    `,
    [userId]
  );

  return createdCart.rows[0].id;
}

async function addToCart(userId, productId, quantity) {
  const safeProductId = Number(productId);
  const safeQuantity = Number(quantity);

  if (!Number.isInteger(safeProductId) || safeProductId <= 0) {
    return { type: 'bad_request', message: 'productId must be a positive integer' };
  }

  if (!Number.isInteger(safeQuantity) || safeQuantity <= 0) {
    return { type: 'bad_request', message: 'quantity must be a positive integer' };
  }

  const cartId = await ensureCart(userId);

  const productResult = await db.query(
    'SELECT id, stock FROM products WHERE id = $1',
    [safeProductId]
  );

  if (productResult.rowCount === 0) {
    return { type: 'not_found', message: 'Product not found' };
  }

  const product = productResult.rows[0];
  if (Number(product.stock) < safeQuantity) {
    return { type: 'conflict', message: 'Not enough stock' };
  }

  await db.query(
    `
      INSERT INTO cart_items (cart_id, product_id, quantity)
      VALUES ($1, $2, $3)
      ON CONFLICT (cart_id, product_id)
      DO UPDATE
      SET quantity = cart_items.quantity + EXCLUDED.quantity,
          updated_at = NOW()
    `,
    [cartId, safeProductId, safeQuantity]
  );

  await db.query('UPDATE carts SET updated_at = NOW() WHERE id = $1', [cartId]);

  return { type: 'success', message: 'Item added to cart' };
}

async function getCart(userId) {
  const cartId = await ensureCart(userId);

  const result = await db.query(
    `
      SELECT
        c.id AS cart_id,
        ci.product_id,
        p.name,
        p.price,
        ci.quantity,
        (p.price * ci.quantity) AS line_total
      FROM carts c
      LEFT JOIN cart_items ci ON ci.cart_id = c.id
      LEFT JOIN products p ON p.id = ci.product_id
      WHERE c.id = $1
      ORDER BY ci.id ASC
    `,
    [cartId]
  );

  const items = result.rows
    .filter((row) => row.product_id !== null)
    .map((row) => ({
      cartId: Number(row.cart_id),
      productId: Number(row.product_id),
      name: row.name,
      price: Number(row.price),
      quantity: Number(row.quantity),
      lineTotal: Number(row.line_total)
    }));

  const total = items.reduce((sum, item) => sum + item.lineTotal, 0);

  return {
    items,
    totalAmount: Number(total.toFixed(2))
  };
}

module.exports = {
  addToCart,
  getCart
};