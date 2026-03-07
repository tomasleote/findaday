# PRP7: Abuse Prevention & Rate Limiting for API Endpoints

## Objective

Add persistent rate limiting to all Vercel serverless API endpoints that send emails, and protect against spam/abuse at the API level.

## Problem Statement

The audit identified that:

1. **Only `/api/find-groups`** has rate limiting, and it uses an **in-memory `Map`** (`find-groups.js:21-44`) that resets on every cold start and is not shared across Vercel instances.

2. **All other email endpoints** -- `send-reminder`, `send-invite`, `send-vote-invite`, `send-vote-result`, `send-welcome` -- have **no rate limiting at all**.

3. **No admin token validation** on sensitive endpoints like `send-reminder` and `send-vote-result`. Anyone who knows a group ID could trigger email sends.

4. Vercel serverless functions are stateless -- **in-memory rate limiting is ineffective** across cold starts and multiple instances.

## Scope

- `api/find-groups.js` -- replace in-memory rate limiting
- `api/send-reminder.js` -- add rate limiting and auth
- `api/send-invite.js` -- add rate limiting and auth
- `api/send-vote-invite.js` -- add rate limiting and auth
- `api/send-vote-result.js` -- add rate limiting and auth
- `api/send-welcome.js` -- add rate limiting
- New shared utility: `api/_lib/rateLimit.js`
- New shared utility: `api/_lib/adminAuth.js`

## Out of Scope

- Firebase database rules (PRP1)
- Client-side validation (PRP6)
- Data architecture (PRP2)

## Technical Implementation Plan

### Step 1 -- Choose a persistent rate limiting strategy

Options for Vercel:

| Option | Pros | Cons |
|--------|------|------|
| **Vercel KV (Redis)** | Native integration, persistent, fast | Paid feature, adds dependency |
| **Upstash Redis** | Free tier, REST API, works in edge/serverless | External dependency |
| **Firebase RTDB as rate limit store** | Already in the stack, free within quota | Slightly higher latency |

**Recommended: Firebase RTDB as rate limit store** -- it's already in the stack, requires no new dependencies, and the rate limit data is small.

### Step 2 -- Create shared rate limiter using Firebase RTDB

Create `api/_lib/rateLimit.js`:

```js
const admin = require('firebase-admin');

// Ensure admin is initialized (shared with cron-cleanup.js)
function getDb() {
    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert({ ... }),
            databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
        });
    }
    return admin.database();
}

/**
 * Check and increment rate limit.
 * @param {string} key - Rate limit key (e.g., "email:user@example.com" or "ip:1.2.3.4")
 * @param {number} maxRequests - Max requests per window
 * @param {number} windowMs - Window duration in milliseconds
 * @returns {Promise<{allowed: boolean, remaining: number}>}
 */
async function checkRateLimit(key, maxRequests, windowMs) {
    const db = getDb();
    const ref = db.ref(`_rateLimits/${encodeKey(key)}`);

    const result = await ref.transaction((current) => {
        const now = Date.now();
        if (!current || now - current.windowStart > windowMs) {
            return { count: 1, windowStart: now };
        }
        if (current.count >= maxRequests) {
            return; // Abort -- rate limited
        }
        return { count: current.count + 1, windowStart: current.windowStart };
    });

    return {
        allowed: result.committed,
        remaining: result.committed ? maxRequests - result.snapshot.val().count : 0
    };
}

function encodeKey(key) {
    // Firebase keys cannot contain . $ # [ ] /
    return key.replace(/[.$#\[\]/]/g, '_');
}

module.exports = { checkRateLimit };
```

### Step 3 -- Create shared admin auth helper

Create `api/_lib/adminAuth.js`:

```js
const crypto = require('crypto');

async function validateAdminToken(groupId, adminToken) {
    if (!adminToken) return false;

    const db = require('firebase-admin').database();
    const snapshot = await db.ref(`groups/${groupId}/adminTokenHash`).get();
    if (!snapshot.exists()) return false;

    const storedHash = snapshot.val();
    const providedHash = crypto.createHash('sha256').update(adminToken).digest('hex');

    // Timing-safe comparison
    if (storedHash.length !== providedHash.length) return false;
    return crypto.timingSafeEqual(Buffer.from(storedHash), Buffer.from(providedHash));
}

module.exports = { validateAdminToken };
```

### Step 4 -- Apply rate limiting to all endpoints

| Endpoint | Rate Limit | Key | Auth Required |
|----------|-----------|-----|---------------|
| `find-groups` | 3/minute per email | `find:${email}` | No |
| `send-welcome` | 5/hour per group | `welcome:${groupId}` | No (triggered at creation) |
| `send-invite` | 3/hour per group | `invite:${groupId}` | Admin token |
| `send-reminder` | 3/hour per group | `reminder:${groupId}` | Admin token |
| `send-vote-invite` | 3/hour per group | `voteinvite:${groupId}` | Admin token |
| `send-vote-result` | 3/hour per group | `voteresult:${groupId}` | Admin token |

Example for `send-reminder.js`:

```js
const { checkRateLimit } = require('./_lib/rateLimit');
const { validateAdminToken } = require('./_lib/adminAuth');

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const { groupId, adminToken, ... } = req.body;

    // 1. Auth check
    const isAdmin = await validateAdminToken(groupId, adminToken);
    if (!isAdmin) return res.status(403).json({ error: 'Invalid admin token' });

    // 2. Rate limit check
    const { allowed } = await checkRateLimit(`reminder:${groupId}`, 3, 60 * 60 * 1000);
    if (!allowed) return res.status(429).json({ error: 'Rate limit exceeded. Try again later.' });

    // 3. Proceed with sending emails...
};
```

### Step 5 -- Update frontend to pass `adminToken` to API calls

In `src/features/admin/AdminPage.jsx`, the `handleSendReminder` function (line 113-132) already sends `groupId` but not `adminToken`. Add it:

```js
body: JSON.stringify({
    groupId,
    adminToken,  // <-- ADD THIS
    groupName: group.name,
    ...
})
```

Same for `handleSendVoteInvites` and `handleSendVoteResult` (these already send `adminToken`).

### Step 6 -- Add cleanup rule for rate limit data

Add a cleanup step to the cron job (`api/cron-cleanup.js`):

```js
// Clean up expired rate limit entries
const rateLimitsSnapshot = await db.ref('_rateLimits').get();
if (rateLimitsSnapshot.exists()) {
    const cleanups = {};
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    rateLimitsSnapshot.forEach((child) => {
        const data = child.val();
        if (data.windowStart < oneHourAgo) {
            cleanups[child.key] = null;
        }
    });
    if (Object.keys(cleanups).length > 0) {
        await db.ref('_rateLimits').update(cleanups);
    }
}
```

### Step 7 -- Add database rules for rate limit path

```json
"_rateLimits": {
    ".read": false,
    ".write": false
    // Only accessible via Admin SDK
}
```

## SEO / UX / Performance Impact

- **Prevents email spam**: No endpoint can be abused to send unlimited emails
- **Protects against cost attacks**: Email services charge per send; rate limiting caps costs
- **Minimal UX impact**: Legitimate users will never hit 3 reminders/hour
- **Admin auth on API**: Prevents unauthorized users from triggering emails

## Risks

- **Firebase Admin SDK initialization**: The rate limiter uses Firebase Admin SDK, which requires service account credentials. These already exist for `cron-cleanup.js` but must be available for all API functions.
- **Rate limit storage in RTDB**: Adds a small number of writes to RTDB. With the cleanup step, this data stays minimal.
- **Cold start latency**: Firebase Admin SDK initialization adds ~200-500ms to the first invocation after a cold start. Subsequent invocations reuse the initialized instance.

## Estimated Effort

**Medium** -- 2-3 focused sessions. Most work is creating the shared utilities and updating each endpoint.
