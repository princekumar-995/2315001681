const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const Log = require('logging-middleware');

router.get('/', async (req, res, next) => {
  const reqId = req.requestId || 'N/A';
  try {
    await Log(
      'backend', 
      'debug', 
      'middleware', 
      `[ReqID: ${reqId}] Route Layer: GET /notifications -> Routing to notificationController.getNotifications`
    );
  } catch (err) {
    process.stderr.write(`Router logging failed: ${err.message}\n`);
  }
  notificationController.getNotifications(req, res, next);
});

router.get('/priority', async (req, res, next) => {
  const reqId = req.requestId || 'N/A';
  try {
    await Log(
      'backend', 
      'debug', 
      'middleware', 
      `[ReqID: ${reqId}] Route Layer: GET /notifications/priority -> Routing to notificationController.getPriorityNotifications`
    );
  } catch (err) {
    process.stderr.write(`Router logging failed: ${err.message}\n`);
  }
  notificationController.getPriorityNotifications(req, res, next);
});

module.exports = router;
