const crypto = require('crypto');

const generateRequestId = () => {
  if (typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
};

const requestContext = (req, res, next) => {
  req.requestContext = {
    requestId: generateRequestId(),
    startedAt: new Date().toISOString(),
    ipAddress: req.headers['x-forwarded-for'] || req.socket?.remoteAddress || null,
    userAgent: req.get('user-agent') || null,
  };

  next();
};

module.exports = requestContext;
