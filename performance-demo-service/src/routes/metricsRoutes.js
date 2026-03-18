const express = require('express');
const metricsController = require('../controllers/metricsController');

const router = express.Router();

router.get('/', metricsController.metrics);

module.exports = router;
