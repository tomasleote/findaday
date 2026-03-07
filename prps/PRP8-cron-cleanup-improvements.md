# PRP8: Cron/Cleanup Improvements

## Objective

Fix the cron cleanup job so it no longer downloads the **entire database** into memory, and ensure it operates safely within Vercel's serverless function memory and execution time limits.

## Problem Statement

The current cleanup cron job (`api/cron-cleanup.js:47`) executes:

```js
const snapshot = await db.ref('groups').get();
```

This downloads **every group and all nested data** (participants, availability, polls, votes) into the serverless function's memory. With 10,000 groups of moderate size (~50 KB each), this is approximately **500 MB** -- far exceeding Vercel's default 1024 MB function memory limit and likely causing timeouts (Vercel functions have a 10-second default / 60-second max execution time).

Additionally:
- The cleanup iterates all groups client-side to filter by `createdAt` -- there is no server-side query filter
- The mass deletion uses a single `update()` call with all keys set to `null`, which could be a very large write
- There is no logging of which groups were deleted for audit purposes

## Scope

- `api/cron-cleanup.js` -- rewrite cleanup logic
- `database.rules.json` -- add `.indexOn` for `createdAt` (if not added in PRP3)

## Out of Scope

- Data architecture changes (PRP2/PRP3)
- Rate limiting (PRP7)
- Security rules (PRP1)

## Technical Implementation Plan

### Step 1 -- Add `.indexOn` for `createdAt`

If not already done in PRP3, add indexing to enable server-side filtering:

```json
"groups": {
    "$groupId": {
        ".indexOn": ["createdAt"]
    }
}
```

**Note**: If PRP3 has moved metadata to `groups/{groupId}/meta/`, then the index should be on `meta`:

```json
"$groupId": {
    "meta": {
        ".indexOn": ["adminEmail", "createdAt"]
    }
}
```

### Step 2 -- Use a server-side query instead of downloading everything

Replace the full download with a filtered query:

```js
// BEFORE:
const snapshot = await db.ref('groups').get();

// AFTER:
const cutoffDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
const cutoffISO = cutoffDate.toISOString();

// Query only groups created before the cutoff
const snapshot = await db.ref('groups')
    .orderByChild('createdAt')
    .endAt(cutoffISO)
    .limitToFirst(500)  // Process in batches to stay within memory limits
    .get();
```

This downloads only the groups that need deletion, and limits each batch to 500 groups.

**Important**: If PRP3 has been implemented and metadata is under `meta/`, the query path changes to: `orderByChild('meta/createdAt')`.

### Step 3 -- Use shallow reads to minimize payload

For the cleanup job, we only need the group ID and `createdAt` -- not the full group data with all participants.

**Option A -- Shallow query with REST API:**

```js
const cutoffDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
const url = `${DB_URL}/groups.json?orderBy="createdAt"&endAt="${cutoffISO}"&limitToFirst=500&shallow=false`;

// Note: shallow=true doesn't work with orderBy in RTDB REST API.
// Instead, use the Admin SDK query which returns full nodes but is filtered server-side.
```

**Option B -- Two-phase approach (recommended):**

Phase 1: Get IDs of old groups:
```js
const snapshot = await db.ref('groups')
    .orderByChild('createdAt')
    .endAt(cutoffISO)
    .limitToFirst(500)
    .get();
```

Phase 2: Delete in batches of 50 using multi-path updates:
```js
const groupIds = [];
snapshot.forEach((child) => {
    groupIds.push(child.key);
});

// Delete in batches of 50 to avoid oversized single writes
const BATCH_SIZE = 50;
for (let i = 0; i < groupIds.length; i += BATCH_SIZE) {
    const batch = groupIds.slice(i, i + BATCH_SIZE);
    const updates = {};
    batch.forEach(id => { updates[id] = null; });
    await db.ref('groups').update(updates);
}
```

### Step 4 -- Add structured logging

```js
console.log(JSON.stringify({
    event: 'cron-cleanup',
    timestamp: new Date().toISOString(),
    cutoffDate: cutoffISO,
    groupsScanned: groupIds.length,
    groupsDeleted: groupIds.length,
    batchCount: Math.ceil(groupIds.length / BATCH_SIZE),
    groupIds: groupIds, // For audit trail
}));
```

### Step 5 -- Handle pagination for very large backlogs

If there are more than 500 expired groups, the job should process them across multiple invocations. Add a response that indicates whether more work remains:

```js
const hasMore = groupIds.length === 500; // Hit the limit -- more may exist

return res.status(200).json({
    success: true,
    deleted: groupIds.length,
    hasMore,
    message: hasMore
        ? 'Batch limit reached. Run again to continue cleanup.'
        : 'All expired groups have been cleaned up.'
});
```

The Vercel cron schedule can be set to run more frequently (e.g., daily) to handle backlogs incrementally.

### Step 6 -- Add rate limit cleanup (from PRP7)

If PRP7 has been implemented, add cleanup of expired rate limit entries in the same cron job:

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

### Step 7 -- Update Vercel cron schedule

In `vercel.json`, ensure the cron schedule is set appropriately:

```json
{
    "crons": [{
        "path": "/api/cron-cleanup",
        "schedule": "0 3 * * *"
    }]
}
```

Running daily at 3 AM handles backlogs incrementally and keeps the database clean.

## SEO / UX / Performance Impact

- **Prevents serverless function crashes**: No more downloading the entire database into memory
- **Faster cleanup execution**: Server-side query filtering reduces payload by orders of magnitude
- **Reliable batch processing**: Handles large backlogs gracefully across multiple runs
- **No user-facing impact**: Cron job runs in the background

## Risks

- **`.indexOn` requirement**: The `orderByChild('createdAt')` query requires an index. Without it, Firebase will log a warning and the query will still work but perform poorly. Ensure the index is deployed before this change.
- **Groups without `createdAt`**: Very old groups created before `createdAt` was added will not be matched by the query. These should be handled separately (e.g., assume they are old enough to delete, or add a fallback check).
- **Deletion of active groups**: The 90-day cutoff should be generous enough for real use cases. Adding a `lastActivityAt` field updated on any write would be more accurate but requires additional tracking (out of scope for this PRP).

## Estimated Effort

**Small** -- 1 focused session. The changes are contained to a single file with no frontend impact.
