# PRP9: Stress Testing Infrastructure

## Objective

Build an automated stress testing framework that validates the system can handle large groups, concurrent usage, and heavy data loads -- detecting performance regressions and scalability failures before real users encounter them.

## Problem Statement

The application has no automated performance or load tests. The only validation is manual testing with small groups. This means:

- Algorithmic regressions (e.g., someone reverting a Set back to Array.includes) would go undetected
- Data structure growth problems only appear with real scale
- Transaction concurrency issues only manifest under simultaneous writes
- Firebase listener bandwidth costs are invisible until billing spikes

Without automated stress tests, every PRP implemented in this roadmap (PRP1-PRP8) can only be validated manually, and regressions after future changes are likely.

## Scope

- New directory: `tests/stress/`
- New script: `scripts/generate-test-data.mjs` -- synthetic dataset generator
- New test files: performance benchmarks for `calculateOverlap`, `dailyAvailability`, and data loading
- Firebase Emulator configuration for integration tests
- Optional: Playwright-based E2E load simulation

## Out of Scope

- Fixing the issues identified by the tests (those are covered by PRP1-PRP8)
- Production monitoring/alerting (separate operational concern)
- CI/CD pipeline changes (can be added later)

## Technical Implementation Plan

### Step 1 -- Create synthetic dataset generator

Create `scripts/generate-test-data.mjs`:

```js
import { getDatesBetween } from '../src/utils/overlap.js';

/**
 * Generates a synthetic group with N participants over a given date range.
 * @param {Object} options
 * @param {number} options.participantCount - Number of participants to generate
 * @param {string} options.startDate - ISO date string
 * @param {string} options.endDate - ISO date string
 * @param {number} options.availabilityRate - Fraction of dates each participant is available (0-1)
 * @returns {Object} { group, participants }
 */
export function generateTestGroup({
    participantCount = 50,
    startDate = '2026-01-01',
    endDate = '2026-06-30',
    availabilityRate = 0.6,
} = {}) {
    const dateRange = getDatesBetween(startDate, endDate);

    const group = {
        id: `test-group-${Date.now()}`,
        name: `Stress Test Group (${participantCount}p)`,
        description: 'Auto-generated for stress testing',
        startDate,
        endDate,
        eventType: 'vacation',
        createdAt: new Date().toISOString(),
    };

    const participants = Array.from({ length: participantCount }, (_, i) => ({
        id: `participant-${i}`,
        name: `Test User ${i}`,
        email: `user${i}@test.com`,
        duration: 3,
        blockType: 'flexible',
        availableDays: dateRange.filter(() => Math.random() < availabilityRate),
        createdAt: new Date().toISOString(),
    }));

    return { group, participants, dateRange };
}

/**
 * Generates data and writes it to Firebase Emulator for integration testing.
 */
export async function seedEmulator(adminDb, options) {
    const { group, participants } = generateTestGroup(options);

    await adminDb.ref(`groups/${group.id}`).set(group);

    const participantUpdates = {};
    participants.forEach(p => {
        participantUpdates[p.id] = p;
    });
    await adminDb.ref(`groups/${group.id}/participants`).set(participantUpdates);

    return { groupId: group.id, participantCount: participants.length };
}
```

### Step 2 -- Create performance benchmark tests

Create `tests/stress/overlap-performance.test.js`:

```js
import { calculateOverlap, getDatesBetween } from '../../src/utils/overlap';
import { generateTestGroup } from '../../scripts/generate-test-data.mjs';

describe('Overlap Performance Benchmarks', () => {
    const scenarios = [
        { name: 'Small (10p x 30d)', participants: 10, days: 30, maxMs: 5 },
        { name: 'Medium (50p x 90d)', participants: 50, days: 90, maxMs: 20 },
        { name: 'Large (100p x 180d)', participants: 100, days: 180, maxMs: 50 },
        { name: 'Stress (200p x 365d)', participants: 200, days: 365, maxMs: 100 },
    ];

    scenarios.forEach(({ name, participants: pCount, days, maxMs }) => {
        test(`${name}: calculateOverlap completes within ${maxMs}ms`, () => {
            const endDate = new Date('2026-01-01');
            endDate.setDate(endDate.getDate() + days - 1);

            const { participants } = generateTestGroup({
                participantCount: pCount,
                startDate: '2026-01-01',
                endDate: endDate.toISOString().split('T')[0],
            });

            const start = performance.now();
            const results = calculateOverlap(
                participants, '2026-01-01',
                endDate.toISOString().split('T')[0], 3
            );
            const elapsed = performance.now() - start;

            expect(elapsed).toBeLessThan(maxMs);
            expect(results.length).toBeGreaterThan(0);
        });
    });
});
```

Create `tests/stress/heatmap-performance.test.js`:

```js
import { generateTestGroup } from '../../scripts/generate-test-data.mjs';

describe('Heatmap Computation Benchmarks', () => {
    test('dailyAvailability with Sets: 200p x 365d under 50ms', () => {
        const { participants, dateRange } = generateTestGroup({
            participantCount: 200,
            startDate: '2026-01-01',
            endDate: '2026-12-31',
        });

        const start = performance.now();

        // Simulate the Set-based computation (PRP4)
        const pSets = participants.map(p => new Set(p.availableDays || []));
        const counts = {};
        dateRange.forEach(dateStr => {
            let count = 0;
            pSets.forEach(s => { if (s.has(dateStr)) count++; });
            counts[dateStr] = count;
        });

        const elapsed = performance.now() - start;
        expect(elapsed).toBeLessThan(50);
        expect(Object.keys(counts).length).toBe(dateRange.length);
    });

    test('dailyAvailability with Array.includes: 200p x 365d is slow (baseline)', () => {
        const { participants, dateRange } = generateTestGroup({
            participantCount: 200,
            startDate: '2026-01-01',
            endDate: '2026-12-31',
        });

        const start = performance.now();

        // Simulate the current Array.includes approach
        const counts = {};
        dateRange.forEach(dateStr => {
            let count = 0;
            participants.forEach(p => {
                if ((p.availableDays || []).includes(dateStr)) count++;
            });
            counts[dateStr] = count;
        });

        const elapsed = performance.now() - start;
        // This is expected to be slow -- we're documenting the baseline
        console.log(`Array.includes baseline: ${elapsed.toFixed(1)}ms`);
        expect(Object.keys(counts).length).toBe(dateRange.length);
    });
});
```

### Step 3 -- Create data size estimation tests

Create `tests/stress/data-size.test.js`:

```js
import { generateTestGroup } from '../../scripts/generate-test-data.mjs';

describe('Data Size Estimation', () => {
    const scenarios = [
        { participants: 10, days: 30 },
        { participants: 50, days: 90 },
        { participants: 100, days: 180 },
        { participants: 200, days: 365 },
    ];

    scenarios.forEach(({ participants: pCount, days }) => {
        test(`${pCount} participants x ${days} days: estimate payload size`, () => {
            const endDate = new Date('2026-01-01');
            endDate.setDate(endDate.getDate() + days - 1);

            const { participants } = generateTestGroup({
                participantCount: pCount,
                startDate: '2026-01-01',
                endDate: endDate.toISOString().split('T')[0],
            });

            const json = JSON.stringify(participants);
            const sizeKB = (json.length / 1024).toFixed(1);

            console.log(`${pCount}p x ${days}d: ${sizeKB} KB (${json.length} bytes)`);

            // After PRP2 (metadata only, no availableDays in participants):
            const metadataOnly = participants.map(({ availableDays, ...rest }) => rest);
            const metaJson = JSON.stringify(metadataOnly);
            const metaSizeKB = (metaJson.length / 1024).toFixed(1);

            console.log(`  Metadata only: ${metaSizeKB} KB (${metaJson.length} bytes)`);
            console.log(`  Reduction: ${((1 - metaJson.length / json.length) * 100).toFixed(0)}%`);
        });
    });
});
```

### Step 4 -- Configure Firebase Emulator for integration tests

Create `firebase-emulator.json` (or update `firebase.json`):

```json
{
    "emulators": {
        "database": {
            "port": 9000,
            "host": "127.0.0.1"
        }
    }
}
```

Create `tests/stress/concurrent-writes.test.js`:

```js
/**
 * Integration test: requires Firebase Emulator running.
 * Tests concurrent participant submissions to detect transaction conflicts.
 */
describe('Concurrent Write Stress Tests', () => {
    // This test requires the Firebase Emulator to be running
    // Run with: firebase emulators:exec "npx jest tests/stress/concurrent-writes.test.js"

    test('50 simultaneous addParticipant calls: all succeed without data loss', async () => {
        // Setup: create a group in the emulator
        // Execute: 50 parallel addParticipant calls
        // Verify: exactly 50 participants exist, no duplicates, no data loss

        const CONCURRENT_COUNT = 50;
        const promises = Array.from({ length: CONCURRENT_COUNT }, (_, i) =>
            addParticipant(testGroupId, {
                name: `Concurrent User ${i}`,
                email: `concurrent${i}@test.com`,
                duration: 3,
                availableDays: ['2026-01-15', '2026-01-16'],
            })
        );

        const results = await Promise.allSettled(promises);
        const successes = results.filter(r => r.status === 'fulfilled');
        const failures = results.filter(r => r.status === 'rejected');

        console.log(`Successes: ${successes.length}, Failures: ${failures.length}`);

        // All should succeed (unique names)
        expect(successes.length).toBe(CONCURRENT_COUNT);

        // Verify in database
        const participants = await getParticipants(testGroupId);
        expect(participants.length).toBe(CONCURRENT_COUNT);
    });

    test('Duplicate name submissions: exactly one succeeds', async () => {
        const CONCURRENT_COUNT = 10;
        const promises = Array.from({ length: CONCURRENT_COUNT }, () =>
            addParticipant(testGroupId, {
                name: 'Same Name',
                email: 'same@test.com',
                duration: 3,
                availableDays: ['2026-01-15'],
            })
        );

        const results = await Promise.allSettled(promises);
        const successes = results.filter(r => r.status === 'fulfilled');

        // Exactly one should succeed
        expect(successes.length).toBe(1);
    });
});
```

### Step 5 -- Create a test runner script

Create `scripts/run-stress-tests.sh`:

```bash
#!/bin/bash
echo "=== Find-a-Day Stress Tests ==="
echo ""

echo "--- Unit Performance Benchmarks ---"
npx jest tests/stress/overlap-performance.test.js --verbose
npx jest tests/stress/heatmap-performance.test.js --verbose
npx jest tests/stress/data-size.test.js --verbose

echo ""
echo "--- Integration Tests (requires Firebase Emulator) ---"
firebase emulators:exec "npx jest tests/stress/concurrent-writes.test.js --verbose"

echo ""
echo "=== Stress Tests Complete ==="
```

### Step 6 -- Add npm script

In `package.json`:

```json
"scripts": {
    "test:stress": "jest tests/stress/ --verbose",
    "test:stress:integration": "firebase emulators:exec 'jest tests/stress/concurrent-writes.test.js --verbose'"
}
```

### Step 7 -- Optional: Playwright E2E load simulation

Create `tests/stress/e2e-load.spec.js` for Playwright:

```js
/**
 * Simulates 20 concurrent participants using the application.
 * Each participant opens the group page, selects dates, and submits.
 */
test('20 concurrent participants submit availability', async ({ browser }) => {
    const contexts = await Promise.all(
        Array.from({ length: 20 }, () => browser.newContext())
    );

    const results = await Promise.allSettled(
        contexts.map(async (context, i) => {
            const page = await context.newPage();
            await page.goto(`http://localhost:3000?group=${TEST_GROUP_ID}`);
            // Fill in name, select dates, submit
            await page.fill('input[placeholder="Your Name *"]', `E2E User ${i}`);
            // ... click dates, submit
            await page.click('button:has-text("Submit Availability")');
            await page.waitForSelector('text=Your response has been recorded');
            await context.close();
        })
    );

    const successes = results.filter(r => r.status === 'fulfilled').length;
    expect(successes).toBe(20);
});
```

## SEO / UX / Performance Impact

- **No production impact** -- all tests run in development/CI only
- **Prevents regressions** -- algorithmic and scalability improvements from PRP1-PRP8 are locked in
- **Quantifies improvements** -- baseline vs. optimized benchmarks provide concrete metrics
- **Validates PRPs** -- integration tests confirm that concurrency fixes and data architecture changes work correctly

## Risks

- **Firebase Emulator dependency**: Integration tests require the Firebase Emulator Suite to be installed and running. This adds a development environment requirement.
- **Flaky timing tests**: Performance benchmarks can vary across machines and CI environments. Use generous thresholds and focus on relative improvements rather than absolute numbers.
- **Test maintenance**: As the data model evolves (PRP2/PRP3), the test data generator must be updated to match the new structure.

## Estimated Effort

**Medium** -- 2-3 focused sessions. Step 1-3 (unit benchmarks) can ship quickly. Steps 4-7 (integration and E2E) require more setup.
