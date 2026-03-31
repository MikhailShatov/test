const client = require('prom-client');

client.collectDefaultMetrics();

const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.01, 0.03, 0.05, 0.1, 0.3, 0.5, 1, 2, 5]
});

const businessOrdersCreated = new client.Counter({
  name: 'business_orders_created_total',
  help: 'Total number of successfully created orders'
});

const businessOrderCreationDuration = new client.Histogram({
  name: 'business_order_creation_duration_seconds',
  help: 'Order creation duration in seconds',
  buckets: [0.01, 0.03, 0.05, 0.1, 0.3, 0.5, 1, 2, 5]
});

const paymentRequestsTotal = new client.Counter({
  name: 'payment_requests_total',
  help: 'Total number of payment provider requests',
  labelNames: ['scenario', 'result', 'status_code']
});

const paymentRequestDuration = new client.Histogram({
  name: 'payment_request_duration_seconds',
  help: 'Payment provider request duration in seconds',
  labelNames: ['scenario', 'result'],
  buckets: [0.01, 0.03, 0.05, 0.1, 0.3, 0.5, 1, 2, 5, 10]
});

module.exports = {
  register: client.register,
  httpRequestsTotal,
  httpRequestDuration,
  businessOrdersCreated,
  businessOrderCreationDuration,
  paymentRequestsTotal,
  paymentRequestDuration
};