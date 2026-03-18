const express = require('express');
const cartController = require('../controllers/cartController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);
router.get('/', cartController.getCart);
router.post('/add', cartController.addToCart);

module.exports = router;
