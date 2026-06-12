import React, { useState } from 'react';
import { ReadOnlyInput, CopyButton, TruncatedText } from '../../shared/ui';
import { isSingleDayEvent } from '../../utils/eventTypes';
import CalendarView from '../CalendarView';

function ParticipantDashboard({ groupId, participantId, participantName, participantEmail, participantDuration, savedDays, group, onSubmit }) {
  const baseUrl = window.location.origin;
  const personalLink = `${baseUrl}?group=${groupId}&p=${participantId}`;
  const [updating, setUpdating] = useState(false);

  return (
    <div className="space-y-4">
      <div className="bg-dark-900 rounded-xl border border-dark-700 p-6">
        <h2 className="text-xl font-bold text-gray-50 mb-1 flex items-center gap-1">
          Hi, <TruncatedText text={participantName} maxWidth="200px" />!
        </h2>
        <p className="text-gray-400 text-sm mb-4">Your availability is saved.</p>

        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-400 mb-1">
            Your personal link — save to edit later:
          </label>
          <div className="flex gap-2">
            <ReadOnlyInput value={personalLink} />
            <CopyButton value={personalLink} />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => setUpdating(u => !u)}
            className="text-brand-400 hover:text-brand-300 text-sm font-semibold text-left w-fit"
          >
            {updating ? '↑ Hide update form' : '✏ Update your dates'}
          </button>
          <button
            onClick={() => {
              if (window.confirm('This will remove your participant access to this group from this browser. You can still return using your personal link. Continue?')) {
                localStorage.removeItem(`fad_p_${groupId}`);
                window.location.href = '/';
              }
            }}
            className="text-gray-500 hover:text-rose-400 text-xs font-medium text-left w-fit transition-colors"
          >
            Clear local access for this group
          </button>
        </div>
      </div>

      <div className="bg-dark-900 rounded-xl border border-dark-700 p-6">
        <h3 className="text-base font-bold text-gray-300 mb-1">Your selected dates</h3>
        <p className="text-gray-500 text-xs mb-3">Changing your name, email, or duration below will update your info when you submit.</p>
        <CalendarView
          startDate={group.startDate}
          endDate={group.endDate}
          onSubmit={onSubmit}
          savedDays={savedDays}
          initialName={participantName}
          initialEmail={participantEmail}
          initialDuration={participantDuration}
          singleDay={isSingleDayEvent(group?.eventType)}
        />
      </div>
    </div>
  );
}

export { ParticipantDashboard };
