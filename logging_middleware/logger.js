const axios = require('axios');

let cachedToken = null;
let cachedTokenExpiry = null;

/**
 * @param {string} token 
 * @returns {object|null}
 */
function parseJwt(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = Buffer.from(base64, 'base64').toString('utf8');
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

/**

 * @returns {Promise<string>}
 */
async function getAuthToken() {
  const now = Date.now();
  if (cachedToken && cachedTokenExpiry && now < cachedTokenExpiry) {
    return cachedToken;
  }

  
  const email = process.env.LOG_EMAIL || process.env.EMAIL || process.env.email;
  const name = process.env.LOG_NAME || process.env.NAME || process.env.name;
  const rollNo = process.env.LOG_ROLL_NO || process.env.ROLL_NO || process.env.ROLLNO || process.env.rollNo;
  const accessCode = process.env.LOG_ACCESS_CODE || process.env.ACCESS_CODE || process.env.accessCode;
  const clientID = process.env.LOG_CLIENT_ID || process.env.CLIENT_ID || process.env.clientID;
  const clientSecret = process.env.LOG_CLIENT_SECRET || process.env.CLIENT_SECRET || process.env.clientSecret;

  const missing = [];
  if (!email) missing.push('email');
  if (!name) missing.push('name');
  if (!rollNo) missing.push('rollNo');
  if (!accessCode) missing.push('accessCode');
  if (!clientID) missing.push('clientID');
  if (!clientSecret) missing.push('clientSecret');

  if (missing.length > 0) {
    throw new Error(`Missing required configuration environment variables: ${missing.join(', ')}`);
  }

  try {
    const response = await axios.post('http://4.224.186.213/evaluation-service/auth', {
      email,
      name,
      rollNo,
      accessCode,
      clientID,
      clientSecret
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 5000
    });

    const token = response.data.token || response.data.accessToken || response.data.access_token || response.data.auth_token || (typeof response.data === 'string' ? response.data : null);
    if (!token) {
      throw new Error('Server response did not contain a valid token');
    }

    cachedToken = token;

    // Cache duration fallback (default to 50 minutes in seconds)
    let expiresInSeconds = 3000;
    const resExpires = response.data.expiresIn || response.data.expires_in || response.data.expiry;
    if (resExpires && typeof resExpires === 'number') {
      expiresInSeconds = resExpires;
    }

    // Attempt to inspect expiration from JWT claim first
    const decoded = parseJwt(token);
    if (decoded && decoded.exp) {
      const jwtExpiryMs = decoded.exp * 1000;
      cachedTokenExpiry = jwtExpiryMs - 60000; // 1-minute safety buffer
    } else {
      cachedTokenExpiry = Date.now() + (expiresInSeconds * 1000) - 60000; // 1-minute safety buffer
    }

    return cachedToken;
  } catch (error) {
    // Clear cache on authentication failure
    cachedToken = null;
    cachedTokenExpiry = null;
    const errorMsg = error.response && error.response.data && error.response.data.message
      ? error.response.data.message
      : error.message;
    throw new Error(`Authentication failed: ${errorMsg}`);
  }
}

/**
 * Sends a log message payload to the evaluation service logs endpoint.
 * @param {string} token 
 * @param {object} payload 
 */
async function sendLogRequest(token, payload) {
  await axios.post('http://4.224.186.213/evaluation-service/logs', payload, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    timeout: 5000
  });
}

/**
 * @param {string} stack - '
 * @param {string} level - 
 * @param {string} packageName 
 * @param {string} message 
 * @returns {Promise<void>}
 */
async function Log(stack, level, packageName, message) {
  const allowedStacks = ['backend', 'frontend'];
  const allowedLevels = ['debug', 'info', 'warn', 'error', 'fatal'];

  if (!allowedStacks.includes(stack)) {
    process.stderr.write(`[Logging Middleware Error]: Invalid stack value: "${stack}". Must be one of: ${allowedStacks.join(', ')}\n`);
    return;
  }
  if (!allowedLevels.includes(level)) {
    process.stderr.write(`[Logging Middleware Error]: Invalid level value: "${level}". Must be one of: ${allowedLevels.join(', ')}\n`);
    return;
  }
  if (typeof packageName !== 'string' || !packageName.trim()) {
    process.stderr.write('[Logging Middleware Error]: packageName must be a non-empty string\n');
    return;
  }
  if (typeof message !== 'string' || !message.trim()) {
    process.stderr.write('[Logging Middleware Error]: message must be a non-empty string\n');
    return;
  }

  let safeMessage = message.trim();
  if (safeMessage.length > 48) {
    safeMessage = safeMessage.substring(0, 45) + '...';
  }

  try {
    let token = await getAuthToken();
    try {
      await sendLogRequest(token, {
        stack,
        level,
        package: packageName,
        message: safeMessage
      });
    } catch (logErr) {
      const isAuthError = logErr.response && (logErr.response.status === 401 || logErr.response.status === 403);
      if (isAuthError) {
        cachedToken = null;
        cachedTokenExpiry = null;
        token = await getAuthToken();
        await sendLogRequest(token, {
          stack,
          level,
          package: packageName,
          message: safeMessage
        });
      } else {
        throw logErr;
      }
    }
  } catch (err) {
    const errorMsg = err.response && err.response.data && err.response.data.message
      ? err.response.data.message
      : err.message;
    process.stderr.write(`[Logging Middleware Transport Error]: Failed to dispatch log - ${errorMsg}\n`);
  }
}

module.exports = Log;
module.exports.Log = Log;
