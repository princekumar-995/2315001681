const Log = require('logging-middleware');


async function loggerMiddleware(req, res, next) {
  const startTime = Date.now();
  const requestId = req.headers['x-request-id'] || Math.random().toString(36).substring(2, 9);
  req.requestId = requestId;

  try {
    const requestMessage = `[ReqID: ${requestId}] Incoming: ${req.method} ${req.originalUrl} - IP: ${req.ip} - User-Agent: ${req.get('user-agent')}`;
    await Log('backend', 'info', 'middleware', requestMessage);
  } catch (err) {
    process.stderr.write(`Request logging failed: ${err.message}\n`);
  }

  const originalEnd = res.end;
  res.end = function (chunk, encoding) {
    res.end = originalEnd;
    res.end(chunk, encoding);

    const duration = Date.now() - startTime;
    const responseMessage = `[ReqID: ${requestId}] Outgoing: ${req.method} ${req.originalUrl} - Status: ${res.statusCode} - Duration: ${duration}ms`;

    Log('backend', 'info', 'middleware', responseMessage).catch((err) => {
      process.stderr.write(`Response logging failed: ${err.message}\n`);
    });
  };

  next();
}

module.exports = loggerMiddleware;
