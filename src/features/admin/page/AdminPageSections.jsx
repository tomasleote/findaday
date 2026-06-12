import React from 'react';
import { Download, Mail, Vote } from 'lucide-react';
import { Button } from '../../../shared/ui';
import VotingSetup from '../VotingSetup';
import VotingResults from '../VotingResults';
import OverlapResults from '../OverlapResults';

export function ActionsCard({
  participants, overlaps, poll, showVotingSetup, reminderSending,
  onExport, onStartVote, onSendReminder, onDeleteGroup,
}) {
  return (
    <div className="bg-dark-900 rounded-xl border border-dark-700 p-6 h-full">
      <h3 className="font-semibold text-gray-300 mb-4">Actions</h3>
      <div className="space-y-2">
        <Button
          variant="secondary"
          fullWidth
          onClick={onExport}
          disabled={!participants || participants.length === 0}
        >
          <Download size={16} className="inline mr-1.5" /> Export CSV
        </Button>
        <Button
          variant="secondary"
          fullWidth
          onClick={onStartVote}
          disabled={!!poll || showVotingSetup || !overlaps?.length}
          title={poll ? 'A poll is already active' : !overlaps?.length ? 'No overlap data yet' : ''}
        >
          <Vote size={16} className="inline mr-1.5" /> Start Vote
        </Button>
        <Button
          variant="primary"
          fullWidth
          onClick={onSendReminder}
          disabled={reminderSending || !participants?.some(p => p?.email && p.email.trim() !== '')}
          title={!participants?.some(p => p?.email && p.email.trim() !== '') ? 'No participants have an email address' : ''}
        >
          <Mail size={16} className="inline mr-1.5" />
          {reminderSending ? 'Sending...' : 'Send Reminder'}
        </Button>
        <Button variant="danger" fullWidth onClick={onDeleteGroup}>
          Delete Group
        </Button>
      </div>
    </div>
  );
}

export function StatisticsCard({ participants, overlaps }) {
  return (
    <div className="bg-dark-900 rounded-xl border border-dark-700 p-6 h-full">
      <h3 className="font-semibold text-gray-300 mb-4">Statistics</h3>
      <div className="space-y-2 text-sm text-gray-300">
        <p>Total participants: <span className="font-bold">{participants?.length || 0}</span></p>
        <p>Possible periods: <span className="font-bold">{overlaps?.length || 0}</span></p>
        {overlaps?.length > 0 && (
          <p>Best match: <span className="font-bold">{overlaps[0].availabilityPercent}%</span></p>
        )}
      </div>
    </div>
  );
}

export function VotingSection({
  heatmapRef, showVotingSetup, poll, group, participants, overlaps,
  durationFilter, setDurationFilter, adminParticipantId,
  onStartPoll, onCancelSetup,
  onClosePoll, onDeletePoll, onVote, onSendInvites, onSendResult,
}) {
  if (showVotingSetup && !poll) {
    return (
      <VotingSetup
        group={group}
        participants={participants}
        overlaps={overlaps}
        durationFilter={durationFilter}
        onDurationChange={setDurationFilter}
        onStartPoll={onStartPoll}
        onCancel={onCancelSetup}
      />
    );
  }
  if (poll) {
    return (
      <div ref={heatmapRef}>
        <VotingResults
          group={group}
          participants={participants}
          overlaps={overlaps}
          durationFilter={durationFilter}
          onDurationChange={setDurationFilter}
          poll={poll}
          adminParticipantId={adminParticipantId}
          onClosePoll={onClosePoll}
          onDeletePoll={onDeletePoll}
          onVote={onVote}
          onSendInvites={onSendInvites}
          onSendResult={onSendResult}
        />
      </div>
    );
  }
  return (
    <OverlapResults
      group={group}
      participants={participants}
      overlaps={overlaps}
      durationFilter={durationFilter}
      onDurationChange={setDurationFilter}
    />
  );
}
