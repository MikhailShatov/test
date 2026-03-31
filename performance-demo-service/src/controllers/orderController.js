const orderService = require('../services/orderService');

async function createOrder(req, res, next) {
  try {
    const result = await orderService.createOrder(req.user.id, {
      simulatePaymentDelay: req.query.simulatePaymentDelay !== 'false',
      paymentScenario: String(req.query.paymentScenario || 'ok').toLowerCase(),
      paymentDelayMs: Number(req.query.paymentDelayMs || 0)
    });

    if (result.type === 'bad_request') {
      return res.status(400).json({ message: result.message });
    }

    if (result.type === 'conflict') {
      return res.status(409).json({ message: result.message });
    }

    if (result.type === 'bad_gateway') {
      return res.status(result.statusCode || 502).json({
        message: result.message,
        payment: result.payment
      });
    }

    return res.status(201).json(result.order);
  } catch (error) {
    return next(error);
  }
}

async function getOrderById(req, res, next) {
  try {
    const result = await orderService.getOrderById(req.user.id, Number(req.params.id));

    if (!result) {
      return res.status(404).json({ message: 'Order not found' });
    }

    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createOrder,
  getOrderById
};