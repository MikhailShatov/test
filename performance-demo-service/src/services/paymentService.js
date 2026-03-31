const env = require('../config/env');
const { paymentRequestsTotal, paymentRequestDuration } = require('../metrics/metrics');

function getPaymentBaseUrl() {
  return process.env.PAYMENT_BASE_URL || `http://127.0.0.1:${env.port}/mock`;
}

function getPaymentTimeoutMs() {
  const parsed = Number(process.env.PAYMENT_TIMEOUT_MS);
  return Number.isFinite(parsed) ? parsed : 3000;
}

async function chargePayment({ scenario = 'ok', delayMs = 0 } = {}) {
  const normalizedScenario = String(scenario || 'ok').toLowerCase();
  const timer = paymentRequestDuration.startTimer({
    scenario: normalizedScenario,
    result: 'unknown'
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), getPaymentTimeoutMs());

  try {
    const response = await fetch(`${getPaymentBaseUrl()}/payment/charge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        scenario: normalizedScenario,
        delayMs
      }),
      signal: controller.signal
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      paymentRequestsTotal.inc({
        scenario: normalizedScenario,
        result: 'error',
        status_code: String(response.status)
      });

      timer({
        scenario: normalizedScenario,
        result: 'error'
      });

      return {
        ok: false,
        status: response.status,
        data
      };
    }

    paymentRequestsTotal.inc({
      scenario: normalizedScenario,
      result: 'success',
      status_code: String(response.status)
    });

    timer({
      scenario: normalizedScenario,
      result: 'success'
    });

    return {
      ok: true,
      status: response.status,
      data
    };
  } catch (error) {
    if (error.name === 'AbortError') {
      paymentRequestsTotal.inc({
        scenario: normalizedScenario,
        result: 'timeout',
        status_code: '504'
      });

      timer({
        scenario: normalizedScenario,
        result: 'timeout'
      });

      return {
        ok: false,
        status: 504,
        data: {
          status: 'failed',
          provider: 'mock-payment',
          scenario: 'timeout',
          message: 'Payment request timed out'
        }
      };
    }

    paymentRequestsTotal.inc({
      scenario: normalizedScenario,
      result: 'network_error',
      status_code: '502'
    });

    timer({
      scenario: normalizedScenario,
      result: 'network_error'
    });

    return {
      ok: false,
      status: 502,
      data: {
        status: 'failed',
        provider: 'mock-payment',
        scenario: 'network_error',
        message: error.message
      }
    };
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = {
  chargePayment
};