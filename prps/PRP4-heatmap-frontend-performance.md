# PRP4: Heatmap & Frontend Performance -- Fix O(n) Lookups and Reduce Re-renders

## Objective

Eliminate algorithmic inefficiencies in the heatmap computation and calendar rendering, and reduce unnecessary React re-renders caused by unstable references.

## Problem Statement

Three performance problems were identified in the audit:

1. **`dailyAvailability` in SlidingOverlapCalendar** (line 79) uses `p.availableDays?.includes(dateStr)` -- an O(K) linear scan for each of N participants for each of D dates. Total: O(D x N x K). With 200 participants x 365 days x 200 avg available days = **~14.6 million string comparisons**.

2. **`isDateInRange`** in both `SlidingOverlapCalendar.js:144` and `CalendarView.js:100` uses `dateRange.includes(dateStr)` -- O(D) per call, called per day cell per render.

3. **Overlap recalculation trigger** (`ParticipantView.js:123-135`) -- `calculateOverlap` runs every time the `participants` array reference changes, even for non-availability changes (name, email).

## Scope

- `src/components/SlidingOverlapCalendar.js` -- `dailyAvailability`, `isDateInRange`, `getHighlightBlock`
- `src/components/CalendarView.js` -- `isDateInRange`
- `src/components/ParticipantView.js` -- overlap recalculation dependency

## Out of Scope

- Data model changes (PRP2)
- Listener changes (PRP3)
- Security rules (PRP1)
- If PRP2/PRP3 are completed first, the `dailyAvailability` fix becomes unnecessary (it would use pre-computed `dailyCounts`). This PRP is designed to work **independently** of PRP2/PRP3 as a standalone performance fix.

## Technical Implementation Plan

### Step 1 -- Convert `dailyAvailability` to use Sets

In `SlidingOverlapCalendar.js:73-85`:

```js
// BEFORE (O(D x N x K)):
participants.forEach(p => {
    if (p.availableDays?.includes(dateStr)) { availableCount++; }
});

// AFTER (O(D x N) with O(1) lookups):
const dailyAvailability = useMemo(() => {
    // Pre-convert each participant's availableDays to a Set once
    const pSets = participants.map(p => new Set(p.availableDays || []));
    const counts = {};
    dateRange.forEach(dateStr => {
        let count = 0;
        pSets.forEach(s => { if (s.has(dateStr)) count++; });
        counts[dateStr] = count;
    });
    return counts;
}, [dateRange, participants]);
```

**Complexity reduction**: From O(D x N x K) to O(N x K + D x N). For 200 participants x 365 days: from ~14.6M ops to ~146K ops -- **100x improvement**.

### Step 2 -- Convert `isDateInRange` to use a Set

In `SlidingOverlapCalendar.js:144`:

```js
// BEFORE:
const isDateInRange = (dateStr) => dateRange.includes(dateStr);

// AFTER:
const dateRangeSet = useMemo(() => new Set(dateRange), [dateRange]);
const isDateInRange = useCallback((dateStr) => dateRangeSet.has(dateStr), [dateRangeSet]);
```

Same fix in `CalendarView.js:100`:

```js
const dateRangeSet = useMemo(() => new Set(dateRange), [dateRange]);
const isDateInRange = useCallback((dateStr) => dateRangeSet.has(dateStr), [dateRangeSet]);
```

### Step 3 -- Pre-compute `dateRange` index map for `indexOf`

In `SlidingOverlapCalendar.js:149-154`, `getHighlightBlock` calls `dateRange.indexOf(startStr)` -- O(D) per call.

```js
// Add alongside dateRange:
const dateIndexMap = useMemo(() => {
    const map = new Map();
    dateRange.forEach((d, i) => map.set(d, i));
    return map;
}, [dateRange]);

// Then in getHighlightBlock:
const getHighlightBlock = (startStr) => {
    if (!startStr) return [];
    const startIndex = dateIndexMap.get(startStr);
    if (startIndex === undefined) return [];
    return dateRange.slice(startIndex, startIndex + parseInt(duration));
};
```

### Step 4 -- Stabilize overlap recalculation dependency

In `ParticipantView.js:123-135`, `calculateOverlap` runs whenever `participants` changes. Since Firebase returns a new array on every update (via `Object.values(snapshot.val())`), this triggers on name/email changes too.

Create a stable fingerprint for availability data:

```js
// Compute a fingerprint that only changes when availability data changes
const availabilityFingerprint = useMemo(() => {
    if (!participants?.length) return '';
    return participants
        .map(p => `${p.id}:${(p.availableDays || []).length}:${(p.availableDays || []).join(',')}`)
        .sort()
        .join('|');
}, [participants]);

useEffect(() => {
    if (group && participants?.length > 0) {
        const results = calculateOverlap(participants, group.startDate, group.endDate, parseInt(heatmapDuration || '3'));
        setOverlaps(results);
    } else {
        setOverlaps([]);
    }
}, [group?.startDate, group?.endDate, availabilityFingerprint, heatmapDuration]);
```

### Step 5 -- Verify with tests

Update `SlidingOverlapCalendar.test.js` and `CalendarView.test.js` to ensure behavior is unchanged. Add a performance benchmark test:

```js
test('dailyAvailability computes within 50ms for 200 participants x 365 days', () => {
    const start = performance.now();
    // ... setup and invoke
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(50);
});
```

## SEO / UX / Performance Impact

- **100x reduction** in heatmap computation cost
- **O(1) date-in-range checks** instead of O(365) per cell
- **Fewer wasted overlap recalculations** -- only triggers when actual availability changes
- **Smoother calendar interactions** -- hover/click responsiveness improves significantly at scale

## Risks

- **Minimal** -- these are pure algorithmic improvements with no data model or API changes
- The availability fingerprint approach adds a small computation cost itself, but it's O(N) and prevents a much more expensive O(D x N) recalculation
- Must ensure the fingerprint is sensitive enough to detect all availability changes (including order changes in the array)

## Estimated Effort

**Small** -- 1 focused development session. All changes are localized to 3 files with no migration needed.
