const db = require('../db/postgres');
const paymentService = require('./paymentService');
const { businessOrdersCreated, businessOrderCreationDuration } = require('../metrics/metrics');

async function createOrder(
  userId,
  {
    simulatePaymentDelay = true,
    paymentScenario = 'ok',
    paymentDelayMs = 0
  } = {}
) {
  const timer = businessOrderCreationDuration.startTimer();
  const client = await db.getClient();

  try {
    await client.query('BEGIN');

    const cartItemsResult = await client.query(
      `
        SELECT
          ci.product_id,
          ci.quantity,
          p.price,
          p.stock
        FROM carts c
        JOIN cart_items ci ON ci.cart_id = c.id
        JOIN products p ON p.id = ci.product_id
        WHERE c.user_id = $1
        FOR UPDATE
      `,
      [userId]
    );

    if (cartItemsResult.rowCount === 0) {
      await client.query('ROLLBACK');
      return { type: 'bad_request', message: 'Cart is empty' };
    }

    const cartItems = cartItemsResult.rows;

    for (const item of cartItems) {
      if (item.stock < item.quantity) {
        await client.query('ROLLBACK');
        return { type: 'conflict', message: `Not enough stock for product ${item.product_id}` };
      }
    }

    const totalAmount = cartItems.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);

    if (simulatePaymentDelay) {
      const paymentResult = await paymentService.chargePayment({
        scenario: paymentScenario,
        delayMs: paymentDelayMs
      });

      if (!paymentResult.ok) {
        await client.query('ROLLBACK');
        return {
          type: 'bad_gateway',
          statusCode: paymentResult.status || 502,
          message: 'Payment provider request failed',
          payment: paymentResult.data
        };
      }
    }

    const orderResult = await client.query(
      `
        INSERT INTO orders (user_id, status, total_amount)
        VALUES ($1, $2, $3)
        RETURNING id, user_id, status, total_amount, created_at
      `,
      [userId, 'created', totalAmount]
    );

    const order = orderResult.rows[0];

    for (const item of cartItems) {
      await client.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)',
        [order.id, item.product_id, item.quantity, item.price]
      );

      await client.query(
        'UPDATE products SET stock = stock - $1, updated_at = NOW() WHERE id = $2',
        [item.quantity, item.product_id]
      );
    }

    await client.query(
      'DELETE FROM cart_items WHERE cart_id = (SELECT id FROM carts WHERE user_id = $1)',
      [userId]
    );

    await client.query('UPDATE carts SET updated_at = NOW() WHERE user_id = $1', [userId]);

    await client.query('COMMIT');
    businessOrdersCreated.inc();
    timer();

    return {
      type: 'success',
      order: {
        id: order.id,
        userId: order.user_id,
        status: order.status,
        totalAmount: Number(order.total_amount),
        createdAt: order.created_at
      }
    };
  } catch (error) {
    await client.query('ROLLBACK');
    timer();
    throw error;
  } finally {
    client.release();
  }
}

async function getOrderById(userId, orderId) {
  const orderResult = await db.query(
    'SELECT id, user_id, status, total_amount, created_at FROM orders WHERE id = $1 AND user_id = $2',
    [orderId, userId]
  );

  if (orderResult.rowCount === 0) {
    return null;
  }

  const itemsResult = await db.query(
    `
      SELECT oi.product_id, p.name, oi.quantity, oi.price
      FROM order_items oi
      JOIN products p ON p.id = oi.product_id
      WHERE oi.order_id = $1
      ORDER BY oi.id ASC
    `,
    [orderId]
  );

  const order = orderResult.rows[0];
  return {
    id: order.id,
    userId: order.user_id,
    status: order.status,
    totalAmount: Number(order.total_amount),
    createdAt: order.created_at,
    items: itemsResult.rows.map((item) => ({
      ...item,
      price: Number(item.price)
    }))
  };
}

module.exports = {
  createOrder,
  getOrderById
};