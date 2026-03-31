const cartService = require('../services/cartService');

async function addToCart(req, res, next) {
  try {
    const { productId, quantity } = req.body;

    if (productId === undefined || quantity === undefined) {
      return res.status(400).json({ message: 'productId and quantity are required' });
    }

    const result = await cartService.addToCart(req.user.id, Number(productId), Number(quantity));

    if (result.type === 'bad_request') {
      return res.status(400).json({ message: result.message });
    }

    if (result.type === 'not_found') {
      return res.status(404).json({ message: result.message });
    }

    if (result.type === 'conflict') {
      return res.status(409).json({ message: result.message });
    }

    return res.status(200).json({ message: result.message });
  } catch (error) {
    return next(error);
  }
}

async function getCart(req, res, next) {
  try {
    const result = await cartService.getCart(req.user.id);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  addToCart,
  getCart
};