const admin = require('firebase-admin');

// Ensure admin is initialized mapping to project variables 
function getDb() {
    if (!admin.apps.length) {
        try {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID || process.env.REACT_APP_FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
                }),
                databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
            });
        } catch (err) {
            console.error('[_lib/rateLimit] Firebase admin init error:', err);
        }
    }
    return admin.database();
}

/**
 * Check and increment rate limit inside a Firebase RTDB protected namespace transaction.
 * @param {string} key - Rate limit key (e.g., "email:user@example.com" or "ip:1.2.3.4")
 * @param {number} maxRequests - Max requests per window
 * @param {number} windowMs - Window duration in milliseconds
 * @returns {Promise<{allowed: boolean, remaining: number}>}
 */
async function checkRateLimit(key, maxRequests, windowMs) {
    const db = getDb();
    const encodedKey = encodeKey(key);
    const ref = db.ref(`_rateLimits/${encodedKey}`);

    const result = await ref.transaction((current) => {
        const now = Date.now();
        // If it doesn't exist or window expired, initialize count to 1 and reset start time
        if (!current || now - current.windowStart > windowMs) {
            return { count: 1, windowStart: now };
        }
        // If window is active and requests are above max, block it by abandoning transaction
        if (current.count >= maxRequests) {
            return;
        }
        // Increment valid active request
        return { count: current.count + 1, windowStart: current.windowStart };
    });

    return {
        allowed: result.committed,
        remaining: result.committed ? maxRequests - result.snapshot.val().count : 0
    };
}

function encodeKey(key) {
    // Firebase node keys cannot contain . $ # [ ] / characters
    return key.replace(/[.$#\[\]/]/g, '_');
}

module.exports = { checkRateLimit };
