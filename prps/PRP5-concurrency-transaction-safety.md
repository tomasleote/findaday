# PRP5: Concurrency & Transaction Safety

## Objective

Fix race conditions in participant creation, poll closing, and vote submission to ensure data integrity under concurrent usage.

## Problem Statement

Four concurrency issues were identified:

1. **`addParticipant` transaction scope** (`participantService.js:20`) -- The transaction reads/writes the **entire participants subtree** to check name uniqueness. With 200 participants, this is ~770 KB per transaction. If two participants submit simultaneously, one transaction will fail and retry, re-reading the full node. At scale, this creates a retry storm.

2. **`closePoll` is non-atomic** (`pollService.js:42-43`) -- Uses two separate `set()` calls for `status` and `closedAt`. If the first succeeds and the second fails, the poll is "closed" without a timestamp.

3. **Auto-close fires from every client** (`ParticipantView.js:109-116`) -- Every connected participant runs the auto-close check. When the last vote arrives, N clients simultaneously call `closePoll()`, creating N redundant writes.

4. **`updateParticipant` without name change** (`participantService.js:78-79`) -- Uses plain `update()` instead of a transaction, so concurrent updates to the same participant result in last-write-wins.

## Scope

- `src/services/participantService.js` -- `addParticipant`, `updateParticipant`
- `src/services/pollService.js` -- `closePoll`, `submitVote`
- `src/components/ParticipantView.js` -- auto-close logic

## Out of Scope

- Data architecture changes (PRP2)
- Security rules (PRP1)
- Performance optimizations (PRP4)
- Rate limiting (PRP7)

## Technical Implementation Plan

### Step 1 -- Narrow `addParticipant` transaction scope

The transaction currently operates on the entire `participants` node to check name uniqueness. After PRP2 separates availability, the transaction payload is smaller (~40 KB for 200 participants). But we can do better:

**Option A -- Maintain a `participantNames` index node:**

```
groups/{groupId}/participantNames/
    {normalizedName}: {participantId}  <-- e.g., "john doe": "abc-123"
```

Then `addParticipant` does:
1. `runTransaction` on `participantNames/{normalizedName}` -- a single small node
2. If the name doesn't exist, write the participantId and proceed
3. If it exists, abort (name taken)
4. Write the participant data separately (no transaction needed)

This reduces transaction scope from the entire participants subtree to a single key.

```js
export const addParticipant = async (groupId, participantData) => {
    const name = String(participantData.name || '').trim().slice(0, 100);
    if (!name) throw new Error('A participant name is required.');
    const normalizedName = name.toLowerCase();
    const participantId = crypto.randomUUID();

    // Step 1: Reserve the name atomically
    const nameRef = ref(database, `groups/${groupId}/participantNames/${normalizedName}`);
    const nameResult = await runTransaction(nameRef, (current) => {
        if (current !== null) return; // Name taken -- abort
        return participantId;
    });

    if (!nameResult.committed) {
        throw new Error('A participant with this name already exists.');
    }

    // Step 2: Write participant data (no transaction needed)
    const participantRef = ref(database, `groups/${groupId}/participants/${participantId}`);
    await set(participantRef, {
        name, email, duration, blockType, id: participantId, createdAt: new Date().toISOString()
    });

    return participantId;
};
```

**Option B -- If PRP2 is not yet done, at minimum add retry limits:**

```js
const transactionResult = await runTransaction(participantsRef, handler, { applyLocally: false });
```

Setting `applyLocally: false` prevents local state from being updated before the server confirms, reducing visual glitches during retries.

### Step 2 -- Make `closePoll` atomic

Replace two separate `set()` calls with a single `update()`:

```js
// BEFORE:
export const closePoll = async (groupId) => {
    await set(ref(database, `groups/${groupId}/poll/status`), 'closed');
    await set(ref(database, `groups/${groupId}/poll/closedAt`), new Date().toISOString());
};

// AFTER:
export const closePoll = async (groupId) => {
    const pollRef = ref(database, `groups/${groupId}/poll`);
    await update(pollRef, {
        status: 'closed',
        closedAt: new Date().toISOString()
    });
};
```

### Step 3 -- Make auto-close idempotent and deduplicated

In `ParticipantView.js:109-116`:

```js
// BEFORE: Every client calls closePoll
if (voterCount >= participantsRef.current) {
    closePoll(groupId).catch(...);
}

// AFTER: Use a transaction to ensure only one client closes the poll
if (pollData?.status === 'active' && participantsRef.current > 0) {
    const voterCount = Object.keys(pollData.votes || {}).length;
    if (voterCount >= participantsRef.current) {
        const statusRef = ref(database, `groups/${groupId}/poll/status`);
        runTransaction(statusRef, (current) => {
            if (current === 'active') return 'closed';
            return; // Already closed -- abort
        }).then((result) => {
            if (result.committed) {
                // Only the "winner" client writes closedAt
                set(ref(database, `groups/${groupId}/poll/closedAt`), new Date().toISOString());
            }
        }).catch(err => console.error('[ParticipantView] auto-close failed:', err));
    }
}
```

This ensures exactly one client performs the close, regardless of how many detect the condition simultaneously.

### Step 4 -- Add optimistic concurrency for `updateParticipant`

For non-name updates, use a lightweight transaction that merges updates:

```js
// For availability-only updates (after PRP2, this is a separate path anyway)
// For metadata updates (name, email, duration):
const participantRef = ref(database, `groups/${groupId}/participants/${participantId}`);
await runTransaction(participantRef, (current) => {
    if (!current) return current; // Participant deleted -- abort
    return { ...current, ...safeUpdates };
});
```

This prevents last-write-wins data loss when admin and participant update simultaneously.

### Step 5 -- Add database rules for `participantNames` index

```json
"participantNames": {
    ".read": "true",
    "$normalizedName": {
        ".write": "auth != null",
        ".validate": "newData.isString()"
    }
}
```

### Step 6 -- Update `deleteParticipant` to clean up the name index

```js
export const deleteParticipant = async (groupId, participantId) => {
    // Read participant to get name
    const participant = await getParticipant(groupId, participantId);
    if (participant?.name) {
        const normalizedName = participant.name.trim().toLowerCase();
        await remove(ref(database, `groups/${groupId}/participantNames/${normalizedName}`));
    }
    await remove(ref(database, `groups/${groupId}/participants/${participantId}`));
};
```

## SEO / UX / Performance Impact

- **Eliminates transaction retry storms** for participant creation at scale
- **Prevents duplicate poll closings** -- single atomic operation
- **Prevents data loss** from concurrent participant updates
- **No UX changes** -- all fixes are invisible to users

## Risks

- **`participantNames` index consistency**: If a participant is deleted but the name index isn't cleaned up, the name becomes permanently reserved. Mitigation: clean up in `deleteParticipant` and add a periodic consistency check.
- **Name rename requires updating the index**: `updateParticipant` with a name change must atomically remove the old name and reserve the new one. This requires a multi-path transaction or two sequential transactions with rollback.
- **Auto-close transaction adds latency**: The `runTransaction` for auto-close adds a round-trip. Since this only runs once per poll lifecycle, the impact is negligible.

## Estimated Effort

**Medium** -- 2 focused sessions. Step 1 (name index) is the most complex; Steps 2-4 are straightforward.
