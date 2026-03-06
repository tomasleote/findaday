import { useState, useCallback, useMemo } from 'react';
import { getDatesBetween } from '../utils/overlap';

/**
 * Hook for standard calendar range selection.
 * Click a start date, click an end date → all days between are selected.
 * Click the same date twice → single day selected.
 * Click a new date after a completed range → resets and starts new range.
 * Reverse selection (end before start) is auto-normalized.
 */
export function useRangeSelection(allowedDateRange, initialDays = []) {
  const [rangeStart, setRangeStart] = useState(null);
  const [rangeEnd, setRangeEnd] = useState(null);
  const [selectedDays, setSelectedDays] = useState(initialDays);
  const [hasCompletedRange, setHasCompletedRange] = useState(initialDays.length > 0);

  const allowedSet = useMemo(() => new Set(allowedDateRange), [allowedDateRange]);

  const computeRangeDays = useCallback((start, end) => {
    if (!start) return [];
    if (!end) return allowedSet.has(start) ? [start] : [];

    // Normalize: ensure start <= end
    const [normalizedStart, normalizedEnd] = start <= end ? [start, end] : [end, start];
    const rangeDays = getDatesBetween(normalizedStart, normalizedEnd);
    return rangeDays.filter(d => allowedSet.has(d));
  }, [allowedSet]);

  const handleDayClick = useCallback((dateStr) => {
    if (!allowedSet.has(dateStr)) return;

    if (!rangeStart || hasCompletedRange) {
      // Starting a new range
      setRangeStart(dateStr);
      setRangeEnd(null);
      setSelectedDays([dateStr]);
      setHasCompletedRange(false);
    } else {
      // Completing the range (second click)
      setRangeEnd(dateStr);
      const days = computeRangeDays(rangeStart, dateStr);
      setSelectedDays(days);
      setHasCompletedRange(true);
    }
  }, [rangeStart, hasCompletedRange, allowedSet, computeRangeDays]);

  const syncFromSaved = useCallback((savedDays) => {
    if (!savedDays || savedDays.length === 0) {
      setSelectedDays([]);
      setRangeStart(null);
      setRangeEnd(null);
      setHasCompletedRange(false);
      return;
    }
    const sorted = [...savedDays].sort();
    setSelectedDays(sorted);
    setRangeStart(sorted[0]);
    setRangeEnd(sorted.length > 1 ? sorted[sorted.length - 1] : null);
    setHasCompletedRange(true);
  }, []);

  return {
    selectedDays,
    rangeStart,
    rangeEnd,
    handleDayClick,
    syncFromSaved,
    hasCompletedRange,
  };
}
