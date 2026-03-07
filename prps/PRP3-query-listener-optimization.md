# PRP3: Query & Listener Optimization -- Eliminate Duplicate Downloads

## Objective

Fix the duplicate data transfer caused by overlapping Firebase subscriptions and ensure each view only downloads the data it actually needs.

## Problem Statement

Both the admin and participant views create **3 concurrent real-time listeners**:

1. `subscribeToGroup(groupId, ...)` -- listens to `groups/{groupId}` -- **downloads the entire group subtree** including all participants, availability, and poll data
2. `subscribeToParticipants(groupId, ...)` -- listens to `groups/{groupId}/participants` -- **downloads all participant data** (a subset of #1)
3. `subscribeToPoll(groupId, ...)` -- listens to `groups/{groupId}/poll` -- **downloads all poll data** (also a subset of #1)

Listener #1 is a superset of #2 and #3. Every change to any participant or poll node triggers **all three listeners**, each downloading overlapping data. This triples bandwidth for participant and poll changes.

Additionally, `isDateInRange` in `SlidingOverlapCalendar.js:144` and `CalendarView.js:100` uses `dateRange.includes()` -- an O(D) scan called per cell per render.

## Scope

- `src/services/groupService.js` -- `subscribeToGroup` function
- `src/components/ParticipantView.js` -- listener setup
- `src/features/admin/hooks/useGroupData.js` -- listener setup
- `database.rules.json` -- add `.indexOn` rules

## Out of Scope

- Data architecture changes (PRP2 -- should be completed first, this PRP builds on it)
- Frontend rendering performance (PRP4)
- Security rules (PRP1)

## Technical Implementation Plan

### Step 1 -- Narrow `subscribeToGroup` to metadata only

Currently `subscribeToGroup` subscribes to `groups/{groupId}`, pulling the entire subtree. After PRP2 separates availability, this still includes participants and poll data.

**Option A -- Subscribe to individual fields (simpler, no migration):**

```js
export const subscribeToGroup = (groupId, callback, onError) => {
    const metadataFields = ['name', 'description', 'startDate', 'endDate',
                            'eventType', 'adminEmail', 'createdAt', 'id',
                            'adminTokenHash', 'location', 'recoveryPasswordHash'];

    const groupRef = ref(database, `groups/${groupId}`);
    const unsubscribe = onValue(groupRef, (snapshot) => {
        if (!snapshot.exists()) { callback(null); return; }
        const data = snapshot.val();
        const metadata = {};
        metadataFields.forEach(f => { if (data[f] !== undefined) metadata[f] = data[f]; });
        callback(metadata);
    }, onError);
    return unsubscribe;
};
```

This still downloads the full subtree due to how RTDB works. The real fix requires restructuring.

**Option B -- Restructure group data (preferred, requires PRP2 first):**

After PRP2, the group node should be restructured so that metadata lives at `groups/{groupId}/meta/` and participants, availability, dailyCounts, and poll are siblings:

```
groups/{groupId}/
    meta/         <-- subscribe here for group info
    participants/ <-- subscribe here for participant list
    availability/ <-- subscribe here for availability data
    dailyCounts/  <-- subscribe here for heatmap
    poll/         <-- subscribe here for poll data
```

Then `subscribeToGroup` subscribes to `groups/{groupId}/meta` -- a node containing only ~2 KB of metadata.

### Step 2 -- Implement the `meta` subpath

1. Update `createGroup` in `src/services/groupService.js` to write group metadata under `groups/{groupId}/meta/`:
   ```js
   const groupRef = ref(database, `groups/${groupId}/meta`);
   await set(groupRef, groupPayload);
   ```

2. Update `getGroup` to read from `groups/{groupId}/meta`.

3. Update `updateGroup` to write to `groups/{groupId}/meta`.

4. Update `deleteGroup` to delete `groups/{groupId}` (the entire node, including all children).

5. Update `subscribeToGroup` to listen to `groups/{groupId}/meta` only.

### Step 3 -- Update all consumers

6. `ParticipantView` -- the `group` state will now contain only metadata (same shape, minus `participants` and `poll`). Verify that no code accesses `group.participants` -- it shouldn't, since participants come from their own subscription.

7. `useGroupData` -- same adjustment. The `group` object returned no longer contains nested children.

8. Update database rules to reflect the new `meta` subpath:
   ```json
   "$groupId": {
       "meta": {
           ".read": "true",
           ".write": "auth != null && (!data.exists() || newData.exists())",
           "name": { ".validate": "newData.isString() && newData.val().length <= 100" },
           ...
       },
       "participants": { ... },
       "availability": { ... },
       "dailyCounts": { ... },
       "poll": { ... }
   }
   ```

### Step 4 -- Add `.indexOn` rules

9. Add indexing for `adminEmail` queries used by `api/find-groups.js`:
   ```json
   "groups": {
       ".indexOn": [],
       "$groupId": {
           "meta": {
               ".indexOn": ["adminEmail", "createdAt"]
           }
       }
   }
   ```

10. Update `api/find-groups.js` to query `groups/{groupId}/meta` instead of `groups/{groupId}`.

### Step 5 -- Migration script

11. Write `scripts/migrate-meta.mjs`:
    - For each group, copy metadata fields to `groups/{groupId}/meta/`
    - Leave original fields in place during transition
    - After all clients update, run cleanup to remove duplicated fields

## SEO / UX / Performance Impact

- **Bandwidth reduction**: Group metadata subscription drops from full subtree (~790 KB worst case) to ~2 KB
- **Eliminates duplicate downloads**: Each listener subscribes to its own non-overlapping path
- **Faster initial load**: First render only needs metadata (~2 KB) instead of everything
- **Firebase read cost reduction**: Fewer bytes transferred = lower billing

## Risks

- **Migration ordering**: This PRP depends on PRP2 being completed first (or at least the availability separation). Can be implemented independently if PRP2 is delayed, but the `meta` restructure alone still leaves participants as a large subtree.
- **API endpoint updates**: The `api/find-groups.js` and `api/cron-cleanup.js` endpoints read group data and must be updated to read from the `meta` subpath.
- **Dual-path period**: During migration, both old and new paths must be supported. The migration script must be idempotent.

## Estimated Effort

**Medium** -- 2-3 focused sessions. Depends on PRP2 being done first for maximum impact.
