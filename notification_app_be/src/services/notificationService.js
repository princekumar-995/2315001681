const axios = require('axios');
const Log = require('logging-middleware');

const mockNotifications = [
  {
    id: "notif-001",
    title: "Google Interview Shortlist",
    body: "Congratulations! You have been shortlisted for the Google software engineering role interview on 2026-06-15.",
    category: "Placement",
    isRead: false,
    createdAt: "2026-06-10T10:00:00.000Z"
  },
  {
    id: "notif-002",
    title: "Semester 4 Results Published",
    body: "Your grades for Semester 4 are now available in the portal. Please review and report discrepancies within 4 days.",
    category: "Result",
    isRead: false,
    createdAt: "2026-06-09T08:30:00.000Z"
  },
  {
    id: "notif-003",
    title: "Annual Hackathon 2026 Registration",
    body: "Register for the upcoming annual university hackathon. Registration closes on June 20th. Cash prizes up to $5000.",
    category: "Event",
    isRead: true,
    createdAt: "2026-06-08T14:00:00.000Z"
  },
  {
    id: "notif-004",
    title: "Microsoft Placement PPT",
    body: "Microsoft will conduct a pre-placement talk in Seminar Hall 1 tomorrow starting at 11:00 AM.",
    category: "Placement",
    isRead: true,
    createdAt: "2026-06-07T09:00:00.000Z"
  },
  {
    id: "notif-005",
    title: "AWS Certification Workshop",
    body: "Free AWS cloud practitioner certification workshop scheduled for this Saturday. Limited seats available.",
    category: "Event",
    isRead: false,
    createdAt: "2026-06-06T11:00:00.000Z"
  },
  {
    id: "notif-006",
    title: "Scholarship Merit List Out",
    body: "The merit list for the academic year 2025-26 scholarships has been published. Selected students should verify details.",
    category: "Result",
    isRead: false,
    createdAt: "2026-06-05T15:30:00.000Z"
  },
  {
    id: "notif-007",
    title: "Uber Placement Drive Status",
    body: "Uber has updated its interview rounds schedule. Registered students please check their emails for invitation links.",
    category: "Placement",
    isRead: false,
    createdAt: "2026-06-10T12:00:00.000Z"
  },
  {
    id: "notif-008",
    title: "Guest Lecture: AI Ethics",
    body: "Join the guest lecture on Ethical Dimensions of Artificial Intelligence by Dr. Sarah Jenkins on June 12th.",
    category: "Event",
    isRead: true,
    createdAt: "2026-06-04T10:15:00.000Z"
  }
];

let beCachedToken = null;
let beCachedTokenExpiry = null;


async function getBeAuthToken() {
  const now = Date.now();
  if (beCachedToken && beCachedTokenExpiry && now < beCachedTokenExpiry) {
    return beCachedToken;
  }

  const email = process.env.EMAIL || process.env.LOG_EMAIL || 'bpragati21@gmail.com';
  const name = process.env.NAME || process.env.LOG_NAME || 'Pragati Bansal';
  const rollNo = process.env.ROLL_NO || process.env.LOG_ROLL_NO || '2315001681';
  const accessCode = process.env.ACCESS_CODE || process.env.LOG_ACCESS_CODE || 'access123';
  const clientID = process.env.CLIENT_ID || process.env.LOG_CLIENT_ID || 'client-id';
  const clientSecret = process.env.CLIENT_SECRET || process.env.LOG_CLIENT_SECRET || 'client-secret';

  try {
    const response = await axios.post('http://4.224.186.213/evaluation-service/auth', {
      email,
      name,
      rollNo,
      accessCode,
      clientID,
      clientSecret
    }, { timeout: 10000 });

    const token = response.data.token || response.data.accessToken || response.data.access_token || (typeof response.data === 'string' ? response.data : null);
    if (!token) throw new Error('Token not returned');

    beCachedToken = token;
    beCachedTokenExpiry = Date.now() + 3000000; // 50 mins
    return token;
  } catch (err) {
    throw new Error(`Authentication with evaluation service failed: ${err.message}`);
  }
}


async function getRawNotifications() {
  try {
    await Log('backend', 'debug', 'middleware', 'Service Layer: Fetching notifications from external evaluation API...');
    const token = await getBeAuthToken();
    const response = await axios.get('http://4.224.186.213/evaluation-service/notifications', {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      timeout: 10000
    });

    if (Array.isArray(response.data)) {
      await Log('backend', 'info', 'middleware', `Service Layer: Successfully fetched ${response.data.length} notifications from external service.`);
      return response.data;
    }
    throw new Error('Response data from external service is not an array');
  } catch (error) {
    const errorMsg = error.response && error.response.data && error.response.data.message
      ? error.response.data.message
      : error.message;

    try {
      await Log(
        'backend',
        'warn',
        'middleware',
        `Service Layer: External fetch failed (${errorMsg}). Falling back to local mock data.`
      );
    } catch (logErr) {
      process.stderr.write(`Service logging error failed: ${logErr.message}\n`);
    }

    return mockNotifications;
  }
}


async function fetchNotifications({ page, limit, type, isRead }) {
  await Log(
    'backend',
    'debug',
    'middleware',
    `Service Layer: Entering fetchNotifications with page=${page}, limit=${limit}, type=${type}, isRead=${isRead}`
  );

  let notifications = await getRawNotifications();

  if (type) {
    const filterType = type.trim().toLowerCase();
    notifications = notifications.filter(n => n.category.trim().toLowerCase() === filterType);
    await Log('backend', 'debug', 'middleware', `Service Layer: Filtered notifications by type="${type}". Remaining: ${notifications.length}`);
  }

  if (isRead !== undefined) {
    notifications = notifications.filter(n => n.isRead === isRead);
    await Log('backend', 'debug', 'middleware', `Service Layer: Filtered notifications by isRead=${isRead}. Remaining: ${notifications.length}`);
  }

  notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const totalItems = notifications.length;
  const totalPages = Math.ceil(totalItems / limit);
  const startIndex = (page - 1) * limit;
  const paginatedData = notifications.slice(startIndex, startIndex + limit);

  await Log(
    'backend',
    'info',
    'middleware',
    `Service Layer: Completed fetchNotifications. Returning page ${page}/${totalPages} (${paginatedData.length} items out of ${totalItems} total)`
  );

  return {
    data: paginatedData,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems,
      limit
    }
  };
}


async function fetchPriorityNotifications({ limit }) {
  await Log(
    'backend',
    'debug',
    'middleware',
    `Service Layer: Entering fetchPriorityNotifications with limit=${limit}`
  );

  let notifications = await getRawNotifications();

  const priorityMap = {
    'Placement': 3,
    'Result': 2,
    'Event': 1
  };

  notifications.sort((a, b) => {
    const pA = priorityMap[a.category] || 0;
    const pB = priorityMap[b.category] || 0;

    if (pA !== pB) {
      return pB - pA; 
    }
    return new Date(b.createdAt) - new Date(a.createdAt); 
  });

  const limitedData = notifications.slice(0, limit);

  await Log(
    'backend',
    'info',
    'middleware',
    `Service Layer: Completed fetchPriorityNotifications. Sorted priority items count: ${limitedData.length}`
  );

  return {
    data: limitedData
  };
}

module.exports = {
  fetchNotifications,
  fetchPriorityNotifications
};
