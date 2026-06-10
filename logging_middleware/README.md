# Logging Middleware

A production-ready reusable JavaScript logging middleware package that authenticates with an evaluation service and forwards application logs.

## Installation

Install dependencies within the package folder:

```bash
npm install
```

To use it in your project, you can install it locally:

```bash
npm install /path/to/logging_middleware
```

## Configuration

The package obtains its authentication credentials from environment variables. Ensure the following environment variables are set in your execution context:

* `EMAIL` or `LOG_EMAIL` - Registration email address
* `NAME` or `LOG_NAME` - Registration name
* `ROLL_NO` or `LOG_ROLL_NO` - Student Roll Number
* `ACCESS_CODE` or `LOG_ACCESS_CODE` - Access Code
* `CLIENT_ID` or `LOG_CLIENT_ID` - Client ID
* `CLIENT_SECRET` or `LOG_CLIENT_SECRET` - Client Secret

## Usage

Here is a usage example:

```javascript
const Log = require('logging-middleware');

async function run() {
  try {
    await Log(
      'backend',          
      'info',             
      'user-service',     
      'User signup processed successfully' 
    );
  } catch (error) {
    process.stderr.write(`Logging error occurred: ${error.message}\n`);
  }
}

run();
```

## API Specifications

### `Log(stack, level, packageName, message)`

#### Parameters

* `stack` (String): Must be exactly `'backend'` or `'frontend'`.
* `level` (String): Must be one of `'debug'`, `'info'`, `'warn'`, `'error'`, `'fatal'`.
* `packageName` (String): Non-empty string representing the module/package name.
* `message` (String): Non-empty string representing the log text.

#### Behavior

1. **Parameter Validation**: Throws an `Error` if any parameter is invalid.
2. **Authentication**: Performs authentication with the evaluation service (`POST http://4.224.186.213/evaluation-service/auth`). Tokens are cached in-memory and reused until expiry.
3. **Log Dispatching**: Sends log records via `POST http://4.224.186.213/evaluation-service/logs`.
4. **Token Expiry & Recovery**: If a log dispatch fails with a `401 Unauthorized` or `403 Forbidden` response, the middleware automatically clears its cache, requests a new token, and retries the dispatch operation once before failing.
5. **No `console.log`**: The package contains zero console output side-effects to remain pure and compatible with production application environments.
