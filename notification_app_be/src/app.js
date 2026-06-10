const express = require('express');
const cors = require('cors');
const loggerMiddleware = require('./middleware/loggerMiddleware');
const notificationRoutes = require('./routes/notificationRoutes');
const Log = require('logging-middleware');

const app = express();

app.use(cors());
app.use(express.json());

app.use(loggerMiddleware);

// Routes
app.use('/notifications', notificationRoutes);

// 404 Route handler
app.use(async (req, res, next) => {
  const notFoundMessage = `Route Not Found: ${req.method} ${req.originalUrl}`;
  try {
    await Log('backend', 'warn', 'middleware', notFoundMessage);
  } catch (err) {
    process.stderr.write(`Logging not found error failed: ${err.message}\n`);
  }
  res.status(404).json({ error: 'NOT_FOUND', message: 'Requested resource not found' });
});

// Global Error Handler
app.use(async (err, req, res, next) => {
  const reqId = req.requestId || 'N/A';
  const errorMessage = `[ReqID: ${reqId}] Global Error Caught: ${err.message}\nStack: ${err.stack}`;
  
  try {
    await Log('backend', 'error', 'middleware', errorMessage);
  } catch (logErr) {
    process.stderr.write(`Logging global error failed: ${logErr.message}\n`);
  }

  res.status(err.status || 500).json({
    error: 'INTERNAL_SERVER_ERROR',
    message: err.message || 'An unexpected error occurred on the server'
  });
});

module.exports = app;
