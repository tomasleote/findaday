const admin = require('firebase-admin');
const crypto = require('crypto');

async function validateAdminToken(groupId, adminToken) {
    if (!adminToken) return false;

    // Ensure the Admin SDK is initialized 
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
            console.error('[_lib/adminAuth] Firebase admin init error:', err);
            return false;
        }
    }

    const db = admin.database();

    // Check multiple paths for backward compatibility since PRP3 migration
    let storedHash = null;

    // Try /adminTokenHash
    const rootSnap = await db.ref(`groups/${groupId}/adminTokenHash`).get();
    if (rootSnap.exists()) {
        storedHash = rootSnap.val();
    } else {
        // Try /meta/adminTokenHash
        const metaSnap = await db.ref(`groups/${groupId}/meta/adminTokenHash`).get();
        if (metaSnap.exists()) storedHash = metaSnap.val();
    }

    if (!storedHash) return false;

    const providedHash = crypto.createHash('sha256').update(adminToken).digest('hex');

    // Prevent timing attacks using length comparison scaling up to cryptographic constant-time comparison
    if (storedHash.length !== providedHash.length) return false;
    return crypto.timingSafeEqual(Buffer.from(storedHash), Buffer.from(providedHash));
}

module.exports = { validateAdminToken };
