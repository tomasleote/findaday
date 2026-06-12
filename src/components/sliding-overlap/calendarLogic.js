import { getDatesBetween } from '../../utils/overlap';

export const getHeatmapColor = (count, max) => {
    if (max === 0) return 'bg-dark-800';
    if (count === 0) return 'bg-dark-800/50';

    const ratio = count / max;
    if (ratio >= 0.9) return 'bg-brand-500 text-white font-bold shadow-[0_0_12px_rgba(249,115,22,0.3)]';
    if (ratio >= 0.7) return 'bg-brand-600 text-white font-semibold';
    if (ratio >= 0.4) return 'bg-amber-500 text-amber-100';
    if (ratio > 0) return 'bg-brand-900/60 text-brand-300';
    return 'bg-dark-800';
};

export const computeDailyAvailability = (dateRange, participants) => {
    const counts = {};
    dateRange.forEach(dateStr => {
        let availableCount = 0;
        participants.forEach(p => {
            if (p.availableDays?.includes(dateStr)) {
                availableCount++;
            }
        });
        counts[dateStr] = availableCount;
    });
    return counts;
};

export const computeCandidateDateMap = (votingMode) => {
    if (!votingMode?.active || !votingMode.poll?.candidates) return {};
    const map = {};
    Object.entries(votingMode.poll.candidates).forEach(([id, c]) => {
        getDatesBetween(c.startDate, c.endDate).forEach(d => {
            if (!map[d]) map[d] = [];
            map[d].push(id);
        });
    });
    return map;
};

export const computeOrderedCandidates = (votingMode) => {
    if (!votingMode?.active || !votingMode.poll?.candidates) return [];
    return Object.entries(votingMode.poll.candidates)
        .map(([id, c]) => ({ id, ...c }))
        .sort((a, b) => a.label - b.label);
};

export const getBlockDetails = (activeBlock, participants, duration, votingMode) => {
    if (activeBlock.length === 0) return null;

    // In voting mode the candidate defines its own duration
    const reqDuration = votingMode?.active ? activeBlock.length : parseInt(duration);

    const available = [];
    const unavailable = [];

    participants.forEach(p => {
        // Check if participant is available for ALL days in the activeBlock
        const isAvailable = activeBlock.every(day => p.availableDays?.includes(day));
        if (isAvailable && activeBlock.length === reqDuration) {
            available.push(p);
        } else {
            unavailable.push(p);
        }
    });

    return { available, unavailable, start: activeBlock[0], end: activeBlock[activeBlock.length - 1] };
};
