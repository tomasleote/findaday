import React from 'react';
import { TruncatedText } from '../../shared/ui';
import { getBestOverlapPeriods } from '../../utils/overlap';
import { isSingleDayEvent } from '../../utils/eventTypes';
import SlidingOverlapCalendar from '../SlidingOverlapCalendar';
import VotePanel from '../VotePanel';
import CalendarEventButton from '../../features/admin/CalendarEventButton';

function ParticipantsSidebar({ participants }) {
  return (
    <div className="bg-dark-900 rounded-xl border border-dark-700 p-6 sticky top-4">
      <h3 className="text-lg font-bold text-gray-50 mb-4">Participants</h3>
      <div className="space-y-2 text-sm max-h-96 overflow-y-auto">
        {(!participants || participants.length === 0) ? (
          <p className="text-gray-500">Be the first to join!</p>
        ) : (
          participants?.map((p, i) => (
            <div key={i} className="bg-dark-800 rounded p-3 border-l-4 border-brand-500">
              <p className="font-semibold text-gray-50">
                <TruncatedText text={p.name || 'Anonymous'} maxWidth="100%" />
              </p>
              <p className="text-gray-400 text-xs">{p.duration}-day duration</p>
              <p className="text-gray-400 text-xs">{(p.availableDays || []).length} days available</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function PollBanner({ poll }) {
  if (!poll) return null;
  if (poll.status === 'active') {
    return (
      <div className="mt-6 bg-brand-500/10 border border-brand-500/30 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-500" />
          </span>
          <div>
            <p className="font-bold text-gray-50 text-sm">Vote on proposed dates!</p>
            <p className="text-xs text-gray-400">The organizer has opened a poll. Click a highlighted period below to vote.</p>
          </div>
        </div>
      </div>
    );
  }
  if (poll.status === 'closed') {
    return (
      <div className="mt-6 bg-dark-800 border border-dark-700 rounded-xl p-4">
        <p className="font-semibold text-gray-300 text-sm">Poll closed — results are below.</p>
      </div>
    );
  }
  return null;
}

function OverlapSection({ group, participants, heatmapDuration, setHeatmapDuration, overlaps, poll, handleVote, currentParticipantId, calendarRef }) {
  if (!overlaps?.length && !poll) return null;

  const renderSelectedAction = poll
    ? ({ candidateId }) => {
      const candidate = poll?.candidates?.[candidateId];
      return (
        <div className="space-y-3">
          <VotePanel
            poll={poll}
            candidateId={candidateId}
            currentParticipantId={currentParticipantId}
            onVote={handleVote}
            isReadOnly={poll.status === 'closed' || !currentParticipantId}
            participants={participants}
            onVoteComplete={() => calendarRef.current?.clearSelection()}
          />
          <CalendarEventButton
            group={group}
            overlap={{ startDate: candidate?.startDate, endDate: candidate?.endDate, availableCount: participants.length }}
            participantCount={participants.length}
          />
        </div>
      );
    }
    : undefined;

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold text-gray-50 mb-4">
        {poll ? (poll.status === 'active' ? 'Vote on Proposed Dates' : 'Poll Results') : 'Current Group Availability'}
      </h2>
      <SlidingOverlapCalendar
        ref={calendarRef}
        startDate={group.startDate}
        endDate={group.endDate}
        participants={participants}
        duration={heatmapDuration || '3'}
        overlaps={getBestOverlapPeriods(overlaps, 10)}
        onDurationChange={poll ? undefined : setHeatmapDuration}
        singleDay={isSingleDayEvent(group?.eventType)}
        votingMode={poll ? { active: true, poll, currentParticipantId } : undefined}
        renderSelectedAction={renderSelectedAction}
      />
    </div>
  );
}

export { ParticipantsSidebar, PollBanner, OverlapSection };
