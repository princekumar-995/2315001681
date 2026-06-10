const notificationService = require('../services/notificationService');
const Log = require('logging-middleware');


 
 
async function getNotifications(req, res, next) {
  const reqId = req.requestId || 'N/A';
  const { page = 1, limit = 10, type, isRead } = req.query;

  try {
    await Log(
      'backend',
      'info',
      'middleware',
      `[ReqID: ${reqId}] Controller Layer: Entering getNotifications. Query params: page=${page}, limit=${limit}, type=${type}, isRead=${isRead}`
    );

    const result = await notificationService.fetchNotifications({
      page: parseInt(page),
      limit: parseInt(limit),
      type,
      isRead: isRead === undefined ? undefined : isRead === 'true'
    });

    await Log(
      'backend',
      'info',
      'middleware',
      `[ReqID: ${reqId}] Controller Layer: Exiting getNotifications. Successfully retrieved ${result.data.length} notifications.`
    );

    return res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    try {
      await Log(
        'backend',
        'error',
        'middleware',
        `[ReqID: ${reqId}] Controller Layer Error in getNotifications: ${error.message}`
      );
    } catch (logErr) {
      process.stderr.write(`Controller error logging failed: ${logErr.message}\n`);
    }
    next(error);
  }
}

/**
 */
async function getPriorityNotifications(req, res, next) {
  const reqId = req.requestId || 'N/A';
  const { limit = 10 } = req.query;

  try {
    await Log(
      'backend',
      'info',
      'middleware',
      `[ReqID: ${reqId}] Controller Layer: Entering getPriorityNotifications. Limit: ${limit}`
    );

    const result = await notificationService.fetchPriorityNotifications({
      limit: parseInt(limit)
    });

    await Log(
      'backend',
      'info',
      'middleware',
      `[ReqID: ${reqId}] Controller Layer: Exiting getPriorityNotifications. Returned ${result.data.length} high priority notifications.`
    );

    return res.status(200).json({
      success: true,
      data: result.data
    });
  } catch (error) {
    try {
      await Log(
        'backend',
        'error',
        'middleware',
        `[ReqID: ${reqId}] Controller Layer Error in getPriorityNotifications: ${error.message}`
      );
    } catch (logErr) {
      process.stderr.write(`Controller error logging failed: ${logErr.message}\n`);
    }
    next(error);
  }
}

module.exports = {
  getNotifications,
  getPriorityNotifications
};
