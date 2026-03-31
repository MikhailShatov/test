const express = require('express');
const sleep = require('../utils/sleep');

const router = express.Router();

router.post('/payment/charge', async (req, res, next) => {
  try {
    const scenario = String(req.body?.scenario || req.query?.scenario || 'ok').toLowerCase();
    const delayMs = Number(req.body?.delayMs ?? req.query?.delayMs ?? 0);

    if (Number.isFinite(delayMs) && delayMs > 0) {
      await sleep(delayMs);
    }

    if (scenario === 'slow') {
      await sleep(1500);
      return res.status(200).json({
        status: 'approved',
        provider: 'mock-payment',
        scenario: 'slow'
      });
    }

    if (scenario === 'error') {
      return res.status(502).json({
        status: 'failed',
        provider: 'mock-payment',
        scenario: 'error',
        message: 'Upstream payment provider error'
      });
    }

    if (scenario === 'timeout') {
      await sleep(10000);
      return res.status(504).json({
        status: 'failed',
        provider: 'mock-payment',
        scenario: 'timeout',
        message: 'Upstream payment provider timeout'
      });
    }

    return res.status(200).json({
      status: 'approved',
      provider: 'mock-payment',
      scenario: 'ok'
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;