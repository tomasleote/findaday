import React from 'react';
import { formatDateRange, getTopFilteredOverlaps } from '../../utils/overlap';
import { Calendar as CalendarIcon, Users, UserX, PartyPopper, TrendingUp } from 'lucide-react';
import { TruncatedText } from '../../shared/ui';
import VotingCandidatePanel from './VotingCandidatePanel';

const DetailsPanel = ({
    activeBlock,
    blockDetails,
    isLocked,
    lockedDate,
    singleDay,
    votingMode,
    orderedCandidates,
    overlaps,
    activeCandidateId,
    renderSelectedAction,
    clearSelection,
    onSelectCandidate,
    onSelectOverlap,
}) => {
    return (
        <div className="w-full md:w-[40%] bg-dark-900 p-6 flex flex-col h-[500px] md:h-auto overflow-y-auto">

            {/* State 1: A block is highlighted or locked */}
            {activeBlock.length > 0 && blockDetails ? (
                <div className="animate-in fade-in duration-200 h-full flex flex-col">
                    <div className="flex justify-between items-start mb-6 pb-4 border-b border-dark-700">
                        <div>
                            <h4 className="text-sm font-bold text-brand-400 uppercase tracking-wider mb-1">
                                {lockedDate ? (singleDay ? "Selected Date" : "Selected Period") : (singleDay ? "Hovered Date" : "Hovered Period")}
                            </h4>
                            <div className="text-xl md:text-2xl font-bold text-gray-50">
                                {formatDateRange(blockDetails.start, blockDetails.end)}
                            </div>
                        </div>
                        <div className="bg-brand-500/10 text-brand-400 px-3 py-2 rounded-lg text-center font-bold">
                            <div className="text-2xl leading-none">{blockDetails.available.length}</div>
                            <div className="text-xs uppercase mt-1">Available</div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 space-y-6">
                        {/* Available Users List */}
                        <div>
                            <h5 className="flex items-center gap-2 text-sm font-bold text-gray-300 mb-3 uppercase tracking-wide">
                                <Users size={16} className="text-emerald-400" />
                                Who can make it
                            </h5>
                            {blockDetails?.available?.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {blockDetails.available.map((p, i) => (
                                        <div key={i} className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-full text-sm font-medium">
                                            <TruncatedText text={p.name || 'Unnamed'} maxWidth="150px" />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-400 italic bg-dark-800 p-3 rounded-lg border border-dark-700">Nobody is fully available for this period.</p>
                            )}
                        </div>

                        {/* Unavailable Users List */}
                        <div>
                            <h5 className="flex items-center gap-2 text-sm font-bold text-gray-300 mb-3 uppercase tracking-wide">
                                <UserX size={16} className="text-rose-400" />
                                Who is holding you back
                            </h5>
                            {blockDetails?.unavailable?.length > 0 ? (
                                <div className="flex flex-col gap-2">
                                    {blockDetails.unavailable.map((p, i) => {
                                        // Calculate exactly how many days they are missing for THIS block
                                        const missingCount = activeBlock.filter(day => !p.availableDays?.includes(day)).length;
                                        return (
                                            <div key={i} className="flex justify-between items-center bg-rose-500/10 text-rose-400 border border-rose-500/20 px-3 py-2 rounded-lg text-sm">
                                                <span className="font-medium">
                                                    <TruncatedText text={p.name || 'Unnamed'} maxWidth="150px" />
                                                </span>
                                                <span className="text-xs text-rose-400 bg-dark-800 px-2 py-0.5 rounded-full border border-rose-500/20 font-semibold">
                                                    Missing {missingCount} day{missingCount !== 1 ? 's' : ''}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="flex items-center justify-center gap-2 text-sm text-emerald-400 font-bold bg-emerald-500/10 px-3 py-2 rounded-lg border border-emerald-500/20">
                                    <PartyPopper size={18} /> Everyone can make it!
                                </p>
                            )}
                        </div>
                    </div>

                    {isLocked && (
                        <div className="pt-4 mt-auto border-t border-dark-700 space-y-3">
                            {renderSelectedAction && renderSelectedAction({
                                startDate: blockDetails.start,
                                endDate: blockDetails.end,
                                availableCount: blockDetails.available.length,
                                candidateId: activeCandidateId,
                            })}
                            <button
                                onClick={clearSelection}
                                className="w-full py-2.5 bg-dark-800 hover:bg-dark-700 text-gray-300 font-bold rounded-lg border border-dark-700 transition"
                            >
                                {votingMode?.active ? 'Deselect Period' : 'Clear Selection'}
                            </button>
                        </div>
                    )}

                    {!isLocked && (
                        <div className="pt-4 mt-auto">
                            <p className="text-xs text-center text-gray-500 font-medium">
                                {votingMode?.active
                                    ? 'Click a highlighted period to vote.'
                                    : 'Click on a date to lock this selection.'}
                            </p>
                        </div>
                    )}
                </div>
            ) : (

                /* State 2: No block is highlighted */
                <div className="h-full flex flex-col">
                    {votingMode?.active ? (
                        /* Voting mode: show candidates list */
                        <VotingCandidatePanel
                            votingMode={votingMode}
                            orderedCandidates={orderedCandidates}
                            onSelectCandidate={onSelectCandidate}
                        />
                    ) : (
                        /* Normal mode: existing Top Overlaps list */
                        <>
                            <h4 className="flex items-center gap-2 text-lg font-bold text-gray-50 mb-6 pb-4 border-b border-dark-700">
                                <TrendingUp size={20} className="text-brand-400" />
                                {singleDay ? 'Top Overlap Dates' : 'Top Overlap Periods'}
                            </h4>

                            {(() => {
                                const topFilteredOverlaps = getTopFilteredOverlaps(overlaps);

                                if (!topFilteredOverlaps || topFilteredOverlaps.length === 0) {
                                    return (
                                        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-dark-800 rounded-xl border border-dashed border-dark-700">
                                            <CalendarIcon size={48} className="text-gray-600 mb-4" />
                                            <p className="text-gray-300 font-medium mb-1">No matches &gt; 50% found</p>
                                            <p className="text-sm text-gray-500">Try lowering the duration or getting more participants to respond.</p>
                                        </div>
                                    );
                                }

                                return (
                                    <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                                        {topFilteredOverlaps.map((overlap, i) => (
                                            <button
                                                key={i}
                                                onClick={() => onSelectOverlap(overlap)}
                                                className={`w-full text-left bg-dark-800 border rounded-xl p-4 transition-all duration-200
                                            ${i === 0 ? 'border-2 border-brand-500/50 shadow-md hover:border-brand-400' : 'border-dark-700 hover:border-dark-700 hover:shadow-sm'}
                                        `}
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold
                                                    ${i === 0 ? 'bg-brand-500 text-white' : 'bg-dark-700 text-gray-300'}
                                                `}>
                                                            {i + 1}
                                                        </span>
                                                        <span className="font-bold text-gray-50">
                                                            {formatDateRange(overlap.startDate, overlap.endDate)}
                                                        </span>
                                                    </div>
                                                    <span className="text-sm font-bold text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded-full">
                                                        {overlap.availabilityPercent}%
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-4 text-xs text-gray-400 ml-8">
                                                    <span className="flex items-center gap-1"><Users size={12} /> {overlap.availableCount} of {overlap.totalParticipants} available</span>
                                                </div>
                                            </button>
                                        ))}

                                        <p className="text-xs text-center text-gray-500 mt-auto pt-4">
                                            Hover over the calendar to explore other options.
                                        </p>
                                    </div>
                                );
                            })()}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default DetailsPanel;
