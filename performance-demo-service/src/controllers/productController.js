const productService = require('../services/productService');

async function listProducts(req, res, next) {
  try {
    const { category, limit, offset, sort, order, slow } = req.query;
    const result = await productService.listProducts({
      category,
      limit: Number(limit || 10),
      offset: Number(offset || 0),
      sort,
      order,
      slow: slow === 'true'
    });

    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

async function getProductById(req, res, next) {
  try {
    const productId = Number(req.params.id);
    const result = await productService.getProductById(productId, {
      slow: req.query.slow === 'true'
    });

    if (!result) {
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listProducts,
  getProductById
};
