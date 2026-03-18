const { register } = require('../metrics/metrics');

async function metrics(req, res, next) {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (error) {
    next(error);
  }
}

module.exports = {
  metrics
};
