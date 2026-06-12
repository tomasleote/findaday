import React from 'react';
import { CalendarRange, Users, Mail, Copy, CheckCircle2, KeyRound } from 'lucide-react';
import { CopyButton, ReadOnlyInput, TruncatedText, Label, LocationDisplay } from '../../../shared/ui';
import { getEventConfig } from '../../../utils/eventTypes';

function GroupSettingsView({
  group,
  participants,
  participantLink,
  adminLink,
  groupId,
  copiedPLink,
  copyPLink,
  copiedALink,
  copyALink,
  copiedGroupId,
  copyGroupId,
}) {
  return (
    <div className="space-y-3">
      <div>
        <Label size="small">
          Participant link (share this):
        </Label>
        <div className="flex gap-2">
          <ReadOnlyInput value={participantLink} />
          <CopyButton
            value={participantLink}
            copiedOverride={copiedPLink}
            onCopyOverride={(v) => copyPLink(v)}
          />
        </div>
      </div>
      {adminLink && (
        <div>
          <Label size="small">
            Your admin link (keep private):
          </Label>
          <div className="flex gap-2 mb-3">
            <ReadOnlyInput value={adminLink} />
            <CopyButton
              value={adminLink}
              variant="secondary"
              copiedOverride={copiedALink}
              onCopyOverride={(v) => copyALink(v)}
            />
          </div>
          <label className="block text-xs font-medium text-gray-400 mb-1">
            Group ID:
          </label>
          <div className="flex gap-2">
            <code className="flex-1 px-3 py-1.5 border border-dark-700 rounded-lg text-xs font-mono bg-dark-800 text-brand-400 flex items-center">
              {groupId}
            </code>
            <button
              onClick={() => copyGroupId(groupId)}
              className="px-3 py-1.5 bg-dark-700 hover:bg-dark-800 text-gray-300 rounded-lg text-xs font-semibold border border-dark-700 transition-colors flex items-center gap-1"
            >
              {copiedGroupId ? <CheckCircle2 size={14} className="text-brand-400" /> : <Copy size={14} />}
              {copiedGroupId ? 'Copied' : 'Copy ID'}
            </button>
          </div>
        </div>
      )}
      <div className="border-t border-dark-700/50 mt-4 pt-3 flex flex-col gap-2">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Recovery Options</span>
        <div className="flex items-center gap-1.5 text-sm">
          <Mail size={16} className={group.adminEmail ? "text-brand-400" : "text-gray-600"} />
          <span className={group.adminEmail ? "text-gray-300" : "text-gray-500 italic"}>
            {group.adminEmail || "No admin email set"}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-sm">
          <KeyRound size={16} className={group.recoveryPasswordHash ? "text-brand-400" : "text-gray-600"} />
          <span className={group.recoveryPasswordHash ? "text-gray-300" : "text-gray-500 italic"}>
            {group.recoveryPasswordHash ? "Passphrase is set" : "No passphrase set"}
          </span>
        </div>
      </div>
      {group.location && (
        <div className="mt-3 pt-3 border-t border-dark-700/50">
          <LocationDisplay location={group.location} />
        </div>
      )}
    </div>
  );
}

export default GroupSettingsView;
