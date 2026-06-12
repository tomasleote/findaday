import React from 'react';
import { Edit, X } from 'lucide-react';
import { TruncatedText } from '../../shared/ui';
import { CalendarRange, Users } from 'lucide-react';
import { getEventConfig } from '../../utils/eventTypes';
import GroupSettingsView from './settings/GroupSettingsView';
import GroupSettingsEdit from './settings/GroupSettingsEdit';

function GroupSettings({
  group,
  participants,
  editing,
  setEditing,
  editData,
  setEditData,
  onSaveEdit,
  onDelete,
  participantLink,
  adminLink,
  groupId,
  copiedPLink,
  copyPLink,
  copiedALink,
  copyALink,
  copiedGroupId,
  copyGroupId,
  showPassphrase,
  setShowPassphrase,
}) {
  return (
    <div className="bg-dark-900 rounded-xl border border-dark-700 p-6 h-full">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-50 mb-2">
            <TruncatedText text={group.name} />
          </h2>
          <div className="mb-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-400 border border-brand-500/20 [&>svg]:w-3.5 [&>svg]:h-3.5">
              {getEventConfig(group.eventType).icon}
              {getEventConfig(group.eventType).label}
            </span>
          </div>
          {group.description && (
            <p className="text-gray-400 text-sm mb-3">{group.description}</p>
          )}
          <div className="flex gap-4 text-sm text-gray-400 flex-wrap mt-1">
            <span className="flex items-center gap-1.5"><CalendarRange size={16} className="text-gray-500" /> {group.startDate} to {group.endDate}</span>
            <span className="flex items-center gap-1.5"><Users size={16} className="text-gray-500" /> {participants?.length || 0} participants</span>
          </div>
        </div>
        <button
          onClick={() => setEditing(!editing)}
          className="text-brand-400 hover:text-brand-300"
        >
          {editing ? <X size={24} /> : <Edit size={24} />}
        </button>
      </div>

      {!editing && (
        <GroupSettingsView
          group={group}
          participants={participants}
          participantLink={participantLink}
          adminLink={adminLink}
          groupId={groupId}
          copiedPLink={copiedPLink}
          copyPLink={copyPLink}
          copiedALink={copiedALink}
          copyALink={copyALink}
          copiedGroupId={copiedGroupId}
          copyGroupId={copyGroupId}
        />
      )}

      {editing && (
        <GroupSettingsEdit
          group={group}
          editData={editData}
          setEditData={setEditData}
          onSaveEdit={onSaveEdit}
          setEditing={setEditing}
          showPassphrase={showPassphrase}
          setShowPassphrase={setShowPassphrase}
        />
      )}
    </div>
  );
}

export default GroupSettings;
