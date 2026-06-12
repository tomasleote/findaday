import React from 'react';
import { getDatesBetween } from '../../utils/overlap';
import { getHeatmapColor } from './calendarLogic';

const DayCell = ({
    day,
    index,
    currentYear,
    currentMonth,
    dateRange,
    dailyAvailability,
    participants,
    activeBlock,
    votingMode,
    highlightedCandidates,
    candidateDateMap,
    selectedCandidateId,
    lockedDate,
    duration,
    onMouseEnter,
    onMouseLeave,
    onClick,
}) => {
    const dateStr = day ? `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : '';
    const inRange = day ? dateRange.includes(dateStr) : false;

    const count = inRange ? dailyAvailability[dateStr] : 0;
    const maxParts = participants.length;

    const isHighlighted = activeBlock.includes(dateStr);
    const isEndOfBlock = activeBlock[activeBlock.length - 1] === dateStr;

    // Check if starting a block here would go out of bounds
    const getHighlightBlock = (startStr) => {
        if (!startStr) return [];
        const startIndex = dateRange.indexOf(startStr);
        if (startIndex === -1) return [];
        return dateRange.slice(startIndex, startIndex + parseInt(duration));
    };

    const wouldBeValidBlock = getHighlightBlock(dateStr).length === parseInt(duration);

    const effectivelyDisabled = votingMode?.active
        ? (!candidateDateMap[dateStr] || candidateDateMap[dateStr].length === 0)
        : (!inRange || !wouldBeValidBlock);

    return (
        <div key={index} className="relative aspect-square">
            {day ? (
                <button
                    data-testid={dateStr ? `day-${dateStr}` : undefined}
                    onMouseEnter={() => onMouseEnter(dateStr, inRange, wouldBeValidBlock)}
                    onMouseLeave={() => onMouseLeave()}
                    onClick={() => day && onClick(dateStr)}
                    disabled={effectivelyDisabled}
                    className={`
            w-full h-full rounded-lg transition-all duration-200 flex flex-col items-center justify-center gap-1
             ${effectivelyDisabled ? 'text-gray-600 cursor-not-allowed opacity-20' : 'cursor-pointer hover:ring-2 hover:ring-brand-400 hover:ring-offset-1 hover:ring-offset-dark-800'}
             ${isHighlighted ? 'ring-2 ring-brand-500 shadow-md transform scale-[1.02] z-10' : ''}
             ${!votingMode?.active && highlightedCandidates?.some(c => getDatesBetween(c.startDate, c.endDate).includes(dateStr)) && !isHighlighted
                            ? 'ring-2 ring-amber-400 ring-offset-1 ring-offset-dark-800'
                            : ''}
             ${!effectivelyDisabled && !isHighlighted ? getHeatmapColor(count, maxParts) : ''}
             ${activeBlock.length > 0 && !effectivelyDisabled && !isHighlighted ? 'opacity-30' : ''}
             ${isHighlighted ? 'bg-brand-500 text-white font-bold' : ''}
          `}
                >
                    <span className="text-sm md:text-base">{day}</span>
                    {inRange && maxParts > 0 && (
                        <span className={`text-[10px] md:text-xs leading-none ${isHighlighted ? 'text-brand-100' : 'opacity-70'}`}>
                            {count}/{maxParts}
                        </span>
                    )}

                    {/* Candidate number label — voting mode active */}
                    {votingMode?.active && (() => {
                        const cids = candidateDateMap[dateStr];
                        if (!cids || cids.length === 0) return null;
                        return (
                            <div className="absolute top-0.5 left-0.5 flex gap-0.5 pointer-events-none z-20">
                                {cids.map(cid => {
                                    const candidate = votingMode.poll?.candidates?.[cid];
                                    if (!candidate || candidate.startDate !== dateStr) return null;
                                    return (
                                        <span key={cid} className="w-4 h-4 flex items-center justify-center rounded-full bg-brand-500 text-white text-[9px] font-bold shadow-[0_0_2px_rgba(0,0,0,0.5)]">
                                            {candidate.label}
                                        </span>
                                    );
                                })}
                            </div>
                        );
                    })()}

                    {/* Candidate number label — admin setup mode (highlightedCandidates) */}
                    {!votingMode?.active && highlightedCandidates && (() => {
                        const idx = highlightedCandidates.findIndex(c => c.startDate === dateStr);
                        if (idx < 0) return null;
                        return (
                            <span className="absolute top-0.5 left-0.5 w-4 h-4 flex items-center justify-center rounded-full bg-amber-400 text-dark-900 text-[9px] font-bold z-20">
                                {idx + 1}
                            </span>
                        );
                    })()}

                    {/* Vote checkmark */}
                    {votingMode?.active && (() => {
                        const cids = candidateDateMap[dateStr];
                        if (!cids || cids.length === 0) return null;
                        const myVote = votingMode.poll?.votes?.[votingMode.currentParticipantId];
                        const votedCids = cids.filter(cid => myVote?.candidateIds?.includes(cid) && votingMode.poll?.candidates?.[cid] && getDatesBetween(votingMode.poll.candidates[cid].startDate, votingMode.poll.candidates[cid].endDate).includes(dateStr));
                        if (votedCids.length === 0) return null;
                        return (
                            <div className="absolute top-0.5 right-0.5 flex gap-0.5 z-20">
                                {votedCids.map(cid => (
                                    <span key={cid} className="text-emerald-400 text-[10px] font-bold drop-shadow-md">✓</span>
                                ))}
                            </div>
                        );
                    })()}
                </button>
            ) : (
                <div className="w-full h-full"></div>
            )}
            {/* Highlight connecting bar for contiguous days */}
            {isHighlighted && !isEndOfBlock && (new Date(dateStr).getDay() !== 6) && (
                <div className="absolute top-1/2 -right-1 md:-right-2 w-2 md:w-4 h-8 -translate-y-1/2 bg-brand-500 z-0"></div>
            )}
        </div>
    );
};

export default DayCell;
