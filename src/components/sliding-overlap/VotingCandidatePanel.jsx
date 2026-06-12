import React from 'react';
import { formatDateRange } from '../../utils/overlap';
import { Vote } from 'lucide-react';

const VotingCandidatePanel = ({ votingMode, orderedCandidates, onSelectCandidate }) => {
    return (
        <>
            <h4 className="flex items-center gap-2 text-lg font-bold text-gray-50 mb-6 pb-4 border-b border-dark-700">
                <Vote size={20} className="text-brand-400" />
                {votingMode.poll?.status === 'closed' ? 'Poll Results' : 'Vote on a Period'}
            </h4>
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {orderedCandidates.map((candidate) => {
                    const votes = votingMode.poll?.votes || {};
                    const voteCount = Object.values(votes).filter(v =>
                        v.candidateIds?.includes(candidate.id)
                    ).length;
                    const totalVoters = Object.keys(votes).length;
                    const myVote = votes[votingMode.currentParticipantId];
                    const hasVoted = myVote?.candidateIds?.includes(candidate.id);
                    const isWinner = votingMode.poll?.status === 'closed' && voteCount === Math.max(
                        ...Object.entries(votingMode.poll.candidates).map(([id]) =>
                            Object.values(votes).filter(v => v.candidateIds?.includes(id)).length
                        )
                    ) && voteCount > 0;

                    return (
                        <button
                            key={candidate.id}
                            onClick={() => onSelectCandidate(candidate)}
                            className={`w-full text-left rounded-xl p-4 transition-all duration-200 border ${isWinner
                                    ? 'border-2 border-brand-500/70 bg-brand-500/10'
                                    : hasVoted
                                        ? 'border-emerald-500/40 bg-emerald-500/5'
                                        : 'border-dark-700 bg-dark-800 hover:border-dark-600'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${isWinner ? 'bg-brand-500 text-white' : 'bg-dark-700 text-gray-300'
                                        }`}>
                                        {candidate.label}
                                    </span>
                                    <span className="font-bold text-gray-50 text-sm">
                                        {formatDateRange(candidate.startDate, candidate.endDate)}
                                    </span>
                                </div>
                                {hasVoted && <span className="text-emerald-400 text-xs font-bold">✓ Voted</span>}
                                {isWinner && <span className="text-brand-400 text-xs font-bold">Winner</span>}
                            </div>
                            <div className="ml-8">
                                <div className="flex justify-between text-xs text-gray-400 mb-1">
                                    <span>{voteCount} vote{voteCount !== 1 ? 's' : ''}</span>
                                    <span>{totalVoters > 0 ? Math.round(voteCount / totalVoters * 100) : 0}%</span>
                                </div>
                                <div className="h-1.5 bg-dark-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-brand-500 transition-all duration-500"
                                        style={{ width: `${totalVoters > 0 ? (voteCount / totalVoters) * 100 : 0}%` }}
                                    />
                                </div>
                            </div>
                        </button>
                    );
                })}
                {orderedCandidates.length === 0 && (
                    <p className="text-sm text-gray-500 text-center">No candidates yet.</p>
                )}
            </div>
        </>
    );
};

export default VotingCandidatePanel;
