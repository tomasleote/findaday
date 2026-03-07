# PRP6: System Limits & Guardrails

## Objective

Implement hard limits at both the **client and database rule levels** to prevent abuse and ensure the system operates within safe performance bounds.

## Problem Statement

The audit identified multiple unbounded data structures:

| Resource | Current Limit | Enforced Where |
|----------|--------------|----------------|
| Participants per group | None | Nowhere |
| Date range length | None | Nowhere |
| `availableDays` per participant | 365 | Client-side only |
| Poll candidates | None | Nowhere |
| Votes per participant | None | Nowhere |
| Group creation rate | None | Nowhere |

A malicious or careless user can create a group with a 10-year date range, add thousands of fake participants, or submit millions of availability entries directly through the Firebase REST API, bypassing all client-side checks.

## Scope

- `database.rules.json` -- add `.validate` rules with numeric limits
- `src/utils/constants/validation.js` -- centralize all limits
- `src/services/groupService.js` -- enforce date range limit
- `src/services/participantService.js` -- enforce participant count limit
- `src/services/pollService.js` -- enforce candidate/vote limits
- `src/components/CalendarView.js` -- UI enforcement
- `src/features/home/CreateGroupForm.jsx` -- date range validation

## Out of Scope

- Rate limiting on API endpoints (PRP7)
- Data architecture changes (PRP2)
- Security authentication (PRP1)

## Technical Implementation Plan

### Step 1 -- Define all limits in a single constants file

Expand `src/utils/constants/validation.js`:

```js
// Existing
export const MAX_GROUP_NAME_LENGTH = 30;
export const MAX_PARTICIPANT_NAME_LENGTH = 20;

// New limits
export const MAX_PARTICIPANTS_PER_GROUP = 100;
export const MAX_DATE_RANGE_DAYS = 180;
export const MAX_AVAILABLE_DAYS_PER_PARTICIPANT = 365;
export const MAX_POLL_CANDIDATES = 10;
export const MAX_VOTES_PER_PARTICIPANT = 10;
export const MAX_DESCRIPTION_LENGTH = 1000;
export const MAX_EMAIL_LENGTH = 255;
```

### Step 2 -- Enforce date range limit in group creation

In `src/services/groupService.js`, `createGroup`:

```js
import { MAX_DATE_RANGE_DAYS } from '../utils/constants/validation';

const start = new Date(startDate);
const end = new Date(endDate);
const rangeDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
if (rangeDays > MAX_DATE_RANGE_DAYS) {
    throw new Error(`Date range cannot exceed ${MAX_DATE_RANGE_DAYS} days.`);
}
if (rangeDays < 1) {
    throw new Error('End date must be after start date.');
}
```

In `src/features/home/CreateGroupForm.jsx`, show a validation error in the UI when the selected range exceeds the limit.

### Step 3 -- Enforce participant count limit

In `src/services/participantService.js`, `addParticipant`:

```js
import { MAX_PARTICIPANTS_PER_GROUP } from '../utils/constants/validation';

// Inside the transaction:
const existing = Object.values(currentParticipants);
if (existing.length >= MAX_PARTICIPANTS_PER_GROUP) {
    return; // Abort -- group is full
}
```

Update the error message when the transaction doesn't commit:

```js
if (!transactionResult.committed) {
    // Distinguish between "name taken" and "group full"
    throw new Error('Could not add participant. The group may be full or the name may be taken.');
}
```

### Step 4 -- Enforce poll limits

In `src/services/pollService.js`, `createPoll`:

```js
import { MAX_POLL_CANDIDATES } from '../utils/constants/validation';

if (candidates.length > MAX_POLL_CANDIDATES) {
    throw new Error(`Cannot create a poll with more than ${MAX_POLL_CANDIDATES} candidates.`);
}
```

In `submitVote`:

```js
import { MAX_VOTES_PER_PARTICIPANT } from '../utils/constants/validation';

if (candidateIds.length > MAX_VOTES_PER_PARTICIPANT) {
    throw new Error(`Cannot vote for more than ${MAX_VOTES_PER_PARTICIPANT} candidates.`);
}
```

### Step 5 -- Enforce limits in database rules

Add `.validate` rules that mirror the client-side limits:

```json
"participants": {
    ".validate": "newData.numChildren() <= 100",
    "$participantId": {
        "availableDays": {
            ".validate": "newData.numChildren() <= 400",
            "$idx": {
                ".validate": "newData.isString() && newData.val().length <= 10"
            }
        }
    }
},
"poll": {
    "candidates": {
        ".validate": "newData.numChildren() <= 15",
        "$candidateId": { ... }
    },
    "votes": {
        "$participantId": {
            "candidateIds": {
                ".validate": "newData.numChildren() <= 15"
            }
        }
    }
}
```

### Step 6 -- Add UI feedback for limits

In `ParticipantView`, show a "Group is full" banner when `participants.length >= MAX_PARTICIPANTS_PER_GROUP` and hide the submission form.

In `CreateGroupForm`, show remaining days count and disable date selection beyond 180 days.

### Step 7 -- Add date range validation in `CalendarView`

The duration input (`CalendarView.js:246-262`) already clamps to `dateRange.length`, which is correct. Verify that the heatmap duration input in SlidingOverlapCalendar has the same clamping.

## SEO / UX / Performance Impact

- **Prevents abuse**: Malicious clients cannot create oversized data structures
- **Improves UX**: Users get clear feedback about limits before hitting errors
- **Protects performance**: Guarantees all computations stay within bounded complexity
- **Reduces Firebase billing risk**: Prevents storage/bandwidth spikes from abuse

## Risks

- **Existing groups exceeding new limits**: Groups created before these limits may have > 100 participants or > 180-day ranges. These groups will continue to work but won't accept new data that would exceed limits.
- **Participant limit UX**: Users may be confused when they can't add more participants. Clear messaging is essential.
- **Database rule deployment**: Rules are deployed globally and take effect immediately. If a rule is too restrictive, it could break existing writes. **Test thoroughly with Firebase Emulator first.**

## Estimated Effort

**Small** -- 1-2 focused sessions. Mostly additive validation code with no architectural changes.
