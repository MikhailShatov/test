const { httpRequestsTotal, httpRequestDuration } = require('../metrics/metrics');

function normalizeRoute(req) {
  if (req.baseUrl && req.route?.path) {
    return `${req.baseUrl}${req.route.path}`;
  }

  if (req.route?.path) {
    return req.route.path;
  }

  if (req.baseUrl) {
    return req.baseUrl;
  }

  return req.path || req.originalUrl || 'unknown';
}

module.exports = function metricsMiddleware(req, res, next) {
  const start = process.hrtime.bigint();

  res.on('finish', () => {
    const durationInSeconds = Number(process.hrtime.bigint() - start) / 1_000_000_000;
    const labels = {
      method: req.method,
      route: normalizeRoute(req),
      status_code: String(res.statusCode)
    };

    httpRequestsTotal.inc(labels);
    httpRequestDuration.observe(labels, durationInSeconds);
  });

  next();
};