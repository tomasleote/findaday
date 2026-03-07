// Vercel Serverless Cron Job — GET /api/cron-cleanup
// Automatically triggered by Vercel on a schedule (daily at 3 AM).
// Must have authentication from Vercel via CRON_SECRET header to run.
// Environment requirements:
// - CRON_SECRET: Automatically injected by Vercel for Cron authorization
// - FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY: Credentials for Firebase Admin
// - REACT_APP_FIREBASE_DATABASE_URL: Standard app DB URL

const admin = require('firebase-admin');

// Ensure the Admin SDK is correctly initialized exactly once
if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                // Replace literal \n blocks with actual newlines in private key if they exist
                privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
            }),
            databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
        });
    } catch (err) {
        console.error('[cron-cleanup] Firebase admin init error:', err);
    }
}

const BATCH_SIZE = 50;
const QUERY_LIMIT = 500;

module.exports = async function handler(req, res) {
    // 1. Validate Cron Secret Header (Vercel security requirement)
    if (req.headers['authorization'] !== `Bearer ${process.env.CRON_SECRET}`) {
        console.error('[cron-cleanup] Unauthorized attempt to run cron job');
        return res.status(401).json({ error: 'Unauthorized' });
    }

    // 2. Validate Firebase Admin Configuration
    if (!process.env.REACT_APP_FIREBASE_PROJECT_ID || !process.env.FIREBASE_PRIVATE_KEY) {
        console.error('[cron-cleanup] Missing Firebase Admin credentials');
        return res.status(500).json({ error: 'Internal Server Error: Missing DB Credentials' });
    }

    try {
        const db = admin.database();
        const cutoffDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        const cutoffISO = cutoffDate.toISOString();

        // --- Step 1: Clean up expired groups ---
        // Use server-side query with a limit to avoid downloading the entire database.
        // The index on meta/createdAt is defined in database.rules.json.
        const snapshot = await db.ref('groups')
            .orderByChild('meta/createdAt')
            .endAt(cutoffISO)
            .limitToFirst(QUERY_LIMIT)
            .get();

        const groupIds = [];
        if (snapshot.exists()) {
            snapshot.forEach((child) => {
                groupIds.push(child.key);
            });
        }

        // Delete in batches of BATCH_SIZE to avoid oversized single writes
        for (let i = 0; i < groupIds.length; i += BATCH_SIZE) {
            const batch = groupIds.slice(i, i + BATCH_SIZE);
            const updates = {};
            batch.forEach((id) => { updates[id] = null; });
            await db.ref('groups').update(updates);
        }

        const hasMore = groupIds.length === QUERY_LIMIT;

        // --- Step 2: Clean up expired rate limit entries ---
        let rateLimitsCleaned = 0;
        const rateLimitsSnapshot = await db.ref('_rateLimits').get();
        if (rateLimitsSnapshot.exists()) {
            const cleanups = {};
            const oneHourAgo = Date.now() - 60 * 60 * 1000;
            rateLimitsSnapshot.forEach((child) => {
                const data = child.val();
                if (data && data.windowStart < oneHourAgo) {
                    cleanups[child.key] = null;
                    rateLimitsCleaned++;
                }
            });
            if (rateLimitsCleaned > 0) {
                await db.ref('_rateLimits').update(cleanups);
            }
        }

        // --- Structured audit log ---
        console.log(JSON.stringify({
            event: 'cron-cleanup',
            timestamp: new Date().toISOString(),
            cutoffDate: cutoffISO,
            groupsDeleted: groupIds.length,
            batchCount: Math.ceil(groupIds.length / BATCH_SIZE),
            groupIds,
            hasMore,
            rateLimitsCleaned,
        }));

        return res.status(200).json({
            success: true,
            deleted: groupIds.length,
            rateLimitsCleaned,
            hasMore,
            message: hasMore
                ? 'Batch limit reached. Run again to continue cleanup.'
                : 'All expired groups have been cleaned up.',
        });

    } catch (err) {
        console.error('[cron-cleanup] Error running cleanup sweep:', err);
        return res.status(500).json({ error: 'Failed to run sweep', details: err.message });
    }
};
