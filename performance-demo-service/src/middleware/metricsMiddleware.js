const { httpRequestsTotal, httpRequestDuration } = require('../metrics/metrics');

module.exports = function metricsMiddleware(req, res, next) {
  const start = process.hrtime.bigint();

  res.on('finish', () => {
    const durationInSeconds = Number(process.hrtime.bigint() - start) / 1_000_000_000;
    const route = req.route?.path || req.baseUrl || req.path;
    const labels = {
      method: req.method,
      route,
      status_code: String(res.statusCode)
    };

    httpRequestsTotal.inc(labels);
    httpRequestDuration.observe(labels, durationInSeconds);
  });

  next();
};
