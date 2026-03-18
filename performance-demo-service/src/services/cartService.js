const db = require('../db/postgres');

async function addToCart(userId, productId, quantity) {
  const cartResult = await db.query('SELECT id FROM carts WHERE user_id = $1', [userId]);
  const cartId = cartResult.rows[0]?.id;

  if (!cartId) {
    throw new Error('Cart not found for user');
  }

  const productResult = await db.query('SELECT id, stock FROM products WHERE id = $1', [productId]);
  if (productResult.rowCount === 0) {
    return { type: 'not_found', message: 'Product not found' };
  }

  const product = productResult.rows[0];
  if (product.stock < quantity) {
    return { type: 'conflict', message: 'Not enough stock' };
  }

  await db.query(
    `
      INSERT INTO cart_items (cart_id, product_id, quantity)
      VALUES ($1, $2, $3)
      ON CONFLICT (cart_id, product_id)
      DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity, updated_at = NOW()
    `,
    [cartId, productId, quantity]
  );

  await db.query('UPDATE carts SET updated_at = NOW() WHERE id = $1', [cartId]);

  return { type: 'success', message: 'Item added to cart' };
}

async function getCart(userId) {
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
      WHERE c.user_id = $1
      ORDER BY ci.id ASC
    `,
    [userId]
  );

  const items = result.rows.filter((row) => row.product_id !== null);
  const total = items.reduce((sum, item) => sum + Number(item.line_total), 0);

  return {
    items,
    totalAmount: Number(total.toFixed(2))
  };
}

module.exports = {
  addToCart,
  getCart
};
