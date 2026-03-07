# PRP2: Data Architecture Refactor -- Flatten Availability Data

## Objective

Restructure the Firebase RTDB data model to **separate availability data from participant metadata**, eliminating the monolithic subtree problem that causes ~770 KB downloads on every change.

## Problem Statement

All data for a group lives under `groups/{groupId}`. The `availableDays` arrays (up to 365 entries per participant) are nested inside each participant object. When any participant subscribes to `groups/{groupId}/participants` via `onValue`, they receive **every participant's full availability data** on every change.

With 200 participants x 365 days, the participants subtree is approximately **770 KB**. This is transferred to every connected client on every single write -- including non-availability changes like name or email updates.

The `addParticipant` transaction (`src/services/participantService.js:20`) reads and writes the **entire participants subtree** atomically, which becomes increasingly expensive and failure-prone as the group grows.

## Scope

- Firebase RTDB data structure
- `database.rules.json` -- new paths and rules
- `src/services/participantService.js` -- read/write paths
- `src/services/groupService.js` -- subscription paths
- `src/components/ParticipantView.js` -- data consumption
- `src/features/admin/hooks/useGroupData.js` -- data fetching
- `src/utils/overlap.js` -- input format change
- Data migration script for existing groups

## Out of Scope

- Security rules hardening (PRP1 -- should be completed first)
- Frontend performance optimizations (PRP4)
- Listener deduplication (PRP3 -- depends on this PRP)
- API endpoint changes

## Technical Implementation Plan

### New Data Structure

```
groups/
  {groupId}/
    name, description, startDate, endDate, eventType,
    adminEmail, createdAt, adminTokenHash, location
    participants/
      {participantId}/
        name, email, duration, blockType, id, createdAt
        (NO availableDays here anymore)
    availability/
      {participantId}/
        {dateStr}: true     <-- e.g., "2026-01-15": true
    dailyCounts/
      {dateStr}: <number>   <-- pre-aggregated count per date
    poll/
      (unchanged)
```

### Key Design Decisions

1. **`availability/{participantId}/{dateStr}: true`** instead of arrays:
   - Firebase RTDB handles object keys efficiently
   - Allows granular writes (add/remove individual dates without rewriting the array)
   - Enables `.hasChild()` checks in security rules
   - Subscribing to `availability/` gives all availability data; subscribing to `availability/{participantId}` gives only one participant's data

2. **`dailyCounts/{dateStr}: <number>`** -- pre-aggregated heatmap data:
   - Updated via `runTransaction` when availability changes
   - Heatmap can render from this alone without iterating all participants
   - Dramatically reduces read amplification for the heatmap

### Phase A -- Add new paths alongside existing ones (backward compatible)

1. Create a new service file `src/services/availabilityService.js`:
   ```js
   export const saveAvailability = async (groupId, participantId, days) => {
       // Write to availability/{participantId} as { "2026-01-15": true, ... }
       const availRef = ref(database, `groups/${groupId}/availability/${participantId}`);
       const daysObj = {};
       days.forEach(d => { daysObj[d] = true; });
       await set(availRef, daysObj);
   };

   export const subscribeToAvailability = (groupId, callback, onError) => {
       const availRef = ref(database, `groups/${groupId}/availability`);
       return onValue(availRef, (snapshot) => {
           callback(snapshot.exists() ? snapshot.val() : {});
       }, onError);
   };
   ```

2. Create `src/services/dailyCountsService.js`:
   ```js
   export const updateDailyCounts = async (groupId, oldDays, newDays) => {
       // Compute diff: added days, removed days
       // Use runTransaction on each changed date's count
       // Or batch via multi-path update
   };

   export const subscribeToDailyCounts = (groupId, callback, onError) => {
       const countsRef = ref(database, `groups/${groupId}/dailyCounts`);
       return onValue(countsRef, (snapshot) => {
           callback(snapshot.exists() ? snapshot.val() : {});
       }, onError);
   };
   ```

3. Update `addParticipant` to write availability to the new path:
   - Remove `availableDays` from the participant object written under `participants/`
   - Call `saveAvailability(groupId, participantId, availableDays)` separately
   - Call `updateDailyCounts(groupId, [], availableDays)` to increment counts

4. Update `updateParticipant` similarly:
   - Read old availability from `availability/{participantId}`
   - Write new availability
   - Update daily counts (decrement old days, increment new days)

### Phase B -- Migrate consumers to read from new paths

5. Update `SlidingOverlapCalendar`'s `dailyAvailability` to consume `dailyCounts` directly instead of re-deriving from participant arrays.

6. Update `calculateOverlap` to accept availability as a separate Map:
   ```js
   // Before: participants[i].availableDays
   // After:  availabilityMap[participants[i].id] -> Set of dates
   ```

7. Update `ParticipantView` and `useGroupData` to:
   - Subscribe to `participants/` (metadata only -- small payload)
   - Subscribe to `availability/` (only when overlap/heatmap is needed)
   - Subscribe to `dailyCounts/` (for heatmap rendering)

### Phase C -- Data Migration

8. Write a one-time migration script (`scripts/migrate-availability.mjs`):
   - Reads all groups from RTDB using Admin SDK
   - For each group, for each participant:
     - Copies `availableDays` array to `availability/{participantId}/{date}: true`
     - Computes and writes `dailyCounts`
   - Does NOT delete `availableDays` from participants yet (backward compatibility)

9. Run migration against production database.

### Phase D -- Remove old path

10. After confirming all reads use the new paths:
    - Remove `availableDays` from participant writes in `participantService.js`
    - Update database rules to remove `availableDays` validation from participants
    - Add rules for the new `availability` and `dailyCounts` paths

11. Write a cleanup script to remove `availableDays` from existing participant objects.

### Database Rules for New Paths

```json
"availability": {
    ".read": "true",
    "$participantId": {
        ".write": "auth != null",
        "$dateStr": {
            ".validate": "newData.isBoolean() && newData.val() === true"
        },
        ".validate": "newData.numChildren() <= 400"
    }
},
"dailyCounts": {
    ".read": "true",
    "$dateStr": {
        ".write": "auth != null",
        ".validate": "newData.isNumber() && newData.val() >= 0"
    }
}
```

## SEO / UX / Performance Impact

- **Massive bandwidth reduction**: Participant list subscription drops from ~770 KB to ~40 KB (200 participants x ~200 bytes metadata)
- **Faster heatmap rendering**: `dailyCounts` provides O(1) lookup per date instead of O(N x K) computation
- **Reduced transaction contention**: `addParticipant` no longer reads/writes availability data
- **No UX changes** -- all views remain the same

## Risks

- **Migration complexity**: Dual-write period required during rollout. Must ensure both old and new paths stay in sync until migration is complete.
- **`dailyCounts` consistency**: If a `saveAvailability` succeeds but `updateDailyCounts` fails, counts become stale. Mitigation: use multi-path updates or periodically recompute counts via a maintenance script.
- **Overlap computation change**: `calculateOverlap` must be updated to accept the new data format. Unit tests exist (`src/utils/overlap.test.js`) and must be updated.
- **Backward compatibility**: During migration, old clients may still write `availableDays` to the participant object. The migration must handle this gracefully.

## Estimated Effort

**Large** -- 4-5 focused development sessions. This is the most impactful architectural change and requires careful phased rollout with a migration script.
