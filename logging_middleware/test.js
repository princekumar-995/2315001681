const Log = require('./logger');

async function testValidation() {
  console.error("Starting validation tests...");
  let errorsCaught = 0;

  try {
    await Log('invalid-stack', 'info', 'test-pkg', 'hello');
  } catch (err) {
    if (err.message.includes('Invalid stack value')) {
      errorsCaught++;
    } else {
      console.error("Test 1 failed with unexpected error:", err.message);
    }
  }

  try {
    await Log('backend', 'invalid-level', 'test-pkg', 'hello');
  } catch (err) {
    if (err.message.includes('Invalid level value')) {
      errorsCaught++;
    } else {
      console.error("Test 2 failed with unexpected error:", err.message);
    }
  }

  try {
    await Log('backend', 'info', '  ', 'hello');
  } catch (err) {
    if (err.message.includes('packageName must be a non-empty string')) {
      errorsCaught++;
    } else {
      console.error("Test 3 failed with unexpected error:", err.message);
    }
  }

  /
  try {
    await Log('backend', 'info', 'test-pkg', '');
  } catch (err) {
    if (err.message.includes('message must be a non-empty string')) {
      errorsCaught++;
    } else {
      console.error("Test 4 failed with unexpected error:", err.message);
    }
  }

  try {
    await Log('backend', 'info', 'test-pkg', 'test message');
  } catch (err) {
    if (err.message.includes('Missing required configuration environment variables') || err.message.includes('Authentication failed')) {
      errorsCaught++;
    } else {
      console.error("Test 5 failed with unexpected error:", err.message);
    }
  }

  if (errorsCaught === 5) {
    process.stderr.write("Validation test suite passed successfully (all validation errors caught correctly).\n");
    process.exit(0);
  } else {
    process.stderr.write(`Validation test suite failed. Expected 5 errors to be caught, got ${errorsCaught}.\n`);
    process.exit(1);
  }
}

testValidation();
