import React, { useState, useMemo, forwardRef, useImperativeHandle } from 'react';
import { getDatesBetween } from '../utils/overlap';
import {
    computeDailyAvailability,
    computeCandidateDateMap,
    computeOrderedCandidates,
    getBlockDetails,
} from './sliding-overlap/calendarLogic';
import CalendarPanel from './sliding-overlap/CalendarPanel';
import DetailsPanel from './sliding-overlap/DetailsPanel';

/**
 * SlidingOverlapCalendar component displays a visual heatmap of availability
 * and allows users to select an overlap period.
 *
 * @param {Object} props
 * @param {Date|string} props.startDate - The start date of the date range
 * @param {Date|string} props.endDate - The end date of the date range
 * @param {Array} props.participants - List of participants with their availableDays
 * @param {number|string} props.duration - The requested event duration in days
 * @param {Array} props.overlaps - The calculated overlap periods
 * @param {Function} [props.onDurationChange] - Callback when duration changes
 * @param {boolean} [props.singleDay=false] - Whether this is a single day selection mode
 * @param {Function} [props.renderSelectedAction] - Optional render prop for a custom action button or content.
 *   Signature: `(selection) => ReactNode`
 *   The `selection` object contains:
 *   - `startDate` {string|Date}: The start date of the selected block
 *   - `endDate` {string|Date}: The end date of the selected block
 *   - `availableCount` {number}: The number of participants available for this block
 *   Note: This function is only called when a selection is locked (i.e. not null).
 *   Expected return type: React Node.
 */
const SlidingOverlapCalendar = forwardRef(function SlidingOverlapCalendar({ startDate, endDate, participants, duration, overlaps, onDurationChange, singleDay = false, renderSelectedAction, votingMode, highlightedCandidates }, ref) {
    const [currentMonth, setCurrentMonth] = useState(new Date(startDate).getMonth());
    const [currentYear, setCurrentYear] = useState(new Date(startDate).getFullYear());
    const [hoveredDate, setHoveredDate] = useState(null);
    const [lockedDate, setLockedDate] = useState(null);
    const [localDuration, setLocalDuration] = useState(duration);
    const [debouncedDuration, setDebouncedDuration] = useState(duration);
    const [selectedCandidateId, setSelectedCandidateId] = useState(null);
    const [hoveredCandidateId, setHoveredCandidateId] = useState(null);

    useImperativeHandle(ref, () => ({
        clearSelection: () => {
            setSelectedCandidateId(null);
            setHoveredCandidateId(null);
            setLockedDate(null);
        },
    }), []);

    const { start, end, dateRange } = useMemo(() => ({
        start: new Date(startDate),
        end: new Date(endDate),
        dateRange: getDatesBetween(startDate, endDate)
    }), [startDate, endDate]);

    // Keep local duration in sync if props change from outside
    React.useEffect(() => {
        setLocalDuration(duration);
    }, [duration]);

    // Debounce the duration input
    React.useEffect(() => {
        const handler = setTimeout(() => {
            let val = parseInt(localDuration);
            if (!isNaN(val) && val >= 1) {
                if (val > (dateRange?.length || 100)) val = dateRange.length;
                setDebouncedDuration(String(val));
                if (onDurationChange && String(val) !== String(duration)) {
                    onDurationChange(String(val));
                }
            }
        }, 500);

        return () => clearTimeout(handler);
    }, [localDuration, dateRange?.length, duration, onDurationChange]);

    // 1. Calculate Daily Availability (Heatmap)
    const dailyAvailability = useMemo(
        () => computeDailyAvailability(dateRange, participants),
        [dateRange, participants]
    );

    // Maps each date string to an array of its candidateIds when voting is active
    const candidateDateMap = useMemo(
        () => computeCandidateDateMap(votingMode),
        [votingMode]
    );

    // Ordered array of candidates for display (sorted by label)
    const orderedCandidates = useMemo(
        () => computeOrderedCandidates(votingMode),
        [votingMode]
    );

    // 2. Calendar Pagination Logic
    const daysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

    const monthYear = new Date(currentYear, currentMonth);
    const days = [];
    const startingDayOfWeek = firstDayOfMonth(monthYear);

    for (let i = 0; i < startingDayOfWeek; i++) {
        days.push(null);
    }
    for (let i = 1; i <= daysInMonth(monthYear); i++) {
        days.push(i);
    }

    const handlePrevMonth = () => {
        const newMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const newYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        if (new Date(newYear, newMonth, 1) >= new Date(start.getFullYear(), start.getMonth(), 1)) {
            setCurrentMonth(newMonth);
            setCurrentYear(newYear);
        }
    };

    const handleNextMonth = () => {
        const newMonth = currentMonth === 11 ? 0 : currentMonth + 1;
        const newYear = currentMonth === 11 ? currentYear + 1 : currentYear;
        if (new Date(newYear, newMonth, 1) <= new Date(end.getFullYear(), end.getMonth(), 1)) {
            setCurrentMonth(newMonth);
            setCurrentYear(newYear);
        }
    };

    const monthName = monthYear.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    // 3. Highlight Logic
    const isDateInRange = (dateStr) => dateRange.includes(dateStr);

    const getHighlightBlock = (startStr) => {
        if (!startStr) return [];

        // Find index of startStr in dateRange
        const startIndex = dateRange.indexOf(startStr);
        if (startIndex === -1) return [];

        // Return up to `duration` days from that index
        return dateRange.slice(startIndex, startIndex + parseInt(duration));
    };

    // Selection takes precedence over hover: once a candidate is picked,
    // hovering others doesn't change the highlighted block
    const activeCandidateId = votingMode?.active
        ? (selectedCandidateId || hoveredCandidateId)
        : null;

    const activeBlock = (() => {
        if (votingMode?.active && activeCandidateId) {
            const candidate = votingMode.poll?.candidates?.[activeCandidateId];
            return candidate ? getDatesBetween(candidate.startDate, candidate.endDate) : [];
        }
        return getHighlightBlock(lockedDate || hoveredDate);
    })();

    // Unified "is something locked" across both modes
    const isLocked = votingMode?.active ? Boolean(selectedCandidateId) : Boolean(lockedDate);

    const clearSelection = () => {
        if (votingMode?.active) {
            setSelectedCandidateId(null);
        } else {
            setLockedDate(null);
        }
    };

    const handleDayClick = (dateStr) => {
        if (votingMode?.active) {
            const cids = candidateDateMap[dateStr];
            if (!cids || cids.length === 0) return;
            // Select the best candidate (default to first, or toggle)
            const activeIds = cids.filter(cid => cid === selectedCandidateId);
            if (activeIds.length > 0) {
                setSelectedCandidateId(null); // toggle off
            } else {
                setSelectedCandidateId(cids[0]);
                setHoveredCandidateId(null);
            }
            return;
        }

        // Original logic
        if (!isDateInRange(dateStr)) return;
        const block = getHighlightBlock(dateStr);
        if (block.length < parseInt(duration)) return;
        if (lockedDate === dateStr) {
            setLockedDate(null);
        } else {
            setLockedDate(dateStr);
        }
    };

    const handleDayCellMouseEnter = (dateStr, inRange, wouldBeValidBlock) => {
        if (votingMode?.active) {
            const cids = candidateDateMap[dateStr];
            if (cids && cids.length > 0 && !selectedCandidateId) setHoveredCandidateId(cids[0]);
            return;
        }
        inRange && wouldBeValidBlock && !lockedDate && setHoveredDate(dateStr);
    };

    const handleDayCellMouseLeave = () => {
        if (votingMode?.active) {
            if (!selectedCandidateId) setHoveredCandidateId(null);
            return;
        }
        !lockedDate && setHoveredDate(null);
    };

    // 4. Details Panel Logic
    const blockDetails = getBlockDetails(activeBlock, participants, duration, votingMode);

    return (
        <div className="bg-dark-900 rounded-xl flex flex-col md:flex-row overflow-hidden border border-dark-700">

            {/* LEFT: Calendar Panel */}
            <CalendarPanel
                monthName={monthName}
                handlePrevMonth={handlePrevMonth}
                handleNextMonth={handleNextMonth}
                votingMode={votingMode}
                onDurationChange={onDurationChange}
                singleDay={singleDay}
                duration={duration}
                localDuration={localDuration}
                setLocalDuration={setLocalDuration}
                dateRange={dateRange}
                days={days}
                currentYear={currentYear}
                currentMonth={currentMonth}
                dailyAvailability={dailyAvailability}
                participants={participants}
                activeBlock={activeBlock}
                highlightedCandidates={highlightedCandidates}
                candidateDateMap={candidateDateMap}
                selectedCandidateId={selectedCandidateId}
                lockedDate={lockedDate}
                onDayCellMouseEnter={handleDayCellMouseEnter}
                onDayCellMouseLeave={handleDayCellMouseLeave}
                onDayClick={handleDayClick}
            />

            {/* RIGHT: Details Panel */}
            <DetailsPanel
                activeBlock={activeBlock}
                blockDetails={blockDetails}
                isLocked={isLocked}
                lockedDate={lockedDate}
                singleDay={singleDay}
                votingMode={votingMode}
                orderedCandidates={orderedCandidates}
                overlaps={overlaps}
                activeCandidateId={activeCandidateId}
                renderSelectedAction={renderSelectedAction}
                clearSelection={clearSelection}
                onSelectCandidate={(candidate) => {
                    const month = new Date(candidate.startDate);
                    setCurrentMonth(month.getMonth());
                    setCurrentYear(month.getFullYear());
                    setSelectedCandidateId(candidate.id);
                }}
                onSelectOverlap={(overlap) => {
                    const overlapStart = new Date(overlap.startDate);
                    setCurrentMonth(overlapStart.getMonth());
                    setCurrentYear(overlapStart.getFullYear());
                    setLockedDate(overlapStart.toISOString().split('T')[0]);
                }}
            />
        </div>
    );
});

export default SlidingOverlapCalendar;
