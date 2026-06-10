require('dotenv').config();
const Log = require('logging-middleware');

// Start routing execution
async function startServer() {
  try {
    // Log startup attempt immediately using the validated package name 'middleware'
    await Log('backend', 'info', 'middleware', 'Starting server initialization...');

    const app = require('./src/app');
    const port = process.env.PORT || 5000;

    app.listen(port, async () => {
      try {
        await Log('backend', 'info', 'middleware', `Express server running and listening on port ${port}`);
      } catch (logErr) {
        process.stderr.write(`Logging error during server startup: ${logErr.message}\n`);
      }
    });
  } catch (error) {
    process.stderr.write(`Fatal error during server startup: ${error.message}\n`);
    process.exit(1);
  }
}

startServer();
