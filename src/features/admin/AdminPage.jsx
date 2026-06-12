import React, { useState, useRef, useEffect } from 'react';
import { useNotification } from '../../context/NotificationContext';
import { useGroupContext } from '../../shared/context';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';
import { Button, LoadingSpinner, Card, TruncatedText, ConfirmDialog } from '../../shared/ui';
import { useGroupData } from './hooks/useGroupData';
import { useParticipantActions } from './hooks/useParticipantActions';
import GroupSettings from './GroupSettings';
import ParticipantTable from './ParticipantTable';
import AdminAvailability from './AdminAvailability';
import SchemaMarkup from '../landing/SchemaMarkup';
import { useAdminPageActions } from './page/useAdminPageActions';
import { ActionsCard, StatisticsCard, VotingSection } from './page/AdminPageSections';

function AdminPage({ onBack }) {
  const { groupId, adminToken } = useGroupContext();
  const { addNotification } = useNotification();
  const [editing, setEditing] = useState(false);
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [reminderSending, setReminderSending] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showVotingSetup, setShowVotingSetup] = useState(false);
  const heatmapRef = useRef(null);

  const baseUrl = window.location.origin;
  const participantLink = `${baseUrl}?group=${groupId}`;
  const adminLink = adminToken ? `${baseUrl}?group=${groupId}&admin=${adminToken}` : null;
  const { copy: copyPLink, copied: copiedPLink } = useCopyToClipboard();
  const { copy: copyALink, copied: copiedALink } = useCopyToClipboard();
  const { copy: copyGroupId, copied: copiedGroupId } = useCopyToClipboard();

  const {
    group, setGroup,
    participants, setParticipants,
    loading, error,
    editData, setEditData,
    durationFilter, setDurationFilter,
    overlaps,
    adminParticipantId, setAdminParticipantId,
    adminSavedDays, setAdminSavedDays,
    adminName, setAdminName,
    adminEmail, setAdminEmail,
    adminDuration, setAdminDuration,
    poll, setPoll,
  } = useGroupData(groupId, adminToken, onBack);

  const participantActions = useParticipantActions(groupId, group, participants, setParticipants);

  // Auto-scroll to heatmap when poll starts
  const prevPollIdRef = useRef(poll?.id);
  useEffect(() => {
    if (poll && heatmapRef.current && poll.id !== prevPollIdRef.current) {
      setTimeout(() => {
        heatmapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        addNotification({ type: 'info', title: 'Configure Poll', message: 'View live voting results below.' });
      }, 100);
      prevPollIdRef.current = poll.id;
    }
  }, [poll, addNotification]);

  const {
    handleSaveEdit, handleDelete, handleExport, handleSendReminder,
    handleAdminAvailability, handleStartPoll, handleClosePoll,
    handleDeletePoll, handleAdminVote, handleSendVoteInvites, handleSendVoteResult,
  } = useAdminPageActions({
    groupId, adminToken, group, setGroup, participants, overlaps,
    editData, setEditing, adminParticipantId, setAdminParticipantId,
    setAdminSavedDays, setAdminName, setAdminEmail, setAdminDuration,
    setPoll, setShowVotingSetup, setShowDeleteConfirm, setReminderSending,
    poll, onBack, addNotification,
  });

  if (loading) return <LoadingSpinner label="Loading..." />;

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card variant="danger" className="text-center max-w-md">
          <h2 className="text-xl font-bold text-rose-400 mb-2">Access Denied</h2>
          <p className="text-gray-300 mb-6 font-medium">{error}</p>
          <Button variant="secondary" fullWidth onClick={onBack}>Go Home</Button>
        </Card>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card variant="default" className="text-center max-w-md">
          <p className="text-rose-400 mb-6 font-medium">Group not found or could not be loaded.</p>
          <Button variant="primary" fullWidth onClick={onBack}>Go Home</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <SchemaMarkup group={group} content={{}} />
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-start mb-8">
          <button onClick={onBack} className="text-brand-400 hover:text-brand-300 font-semibold">
            ← Back to Home
          </button>
          <h1 className="text-3xl font-bold text-gray-50 flex-1 text-center truncate">
            <TruncatedText text={group.name} />
          </h1>
          <div className="w-20"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-2 md:row-span-2">
            <GroupSettings
              group={group} participants={participants}
              editing={editing} setEditing={setEditing}
              editData={editData} setEditData={setEditData}
              onSaveEdit={handleSaveEdit} onDelete={() => setShowDeleteConfirm(true)}
              participantLink={participantLink} adminLink={adminLink} groupId={groupId}
              copiedPLink={copiedPLink} copyPLink={copyPLink}
              copiedALink={copiedALink} copyALink={copyALink}
              copiedGroupId={copiedGroupId} copyGroupId={copyGroupId}
              showPassphrase={showPassphrase} setShowPassphrase={setShowPassphrase}
            />
          </div>
          <ActionsCard
            participants={participants} overlaps={overlaps}
            poll={poll} showVotingSetup={showVotingSetup} reminderSending={reminderSending}
            onExport={handleExport} onStartVote={() => setShowVotingSetup(true)}
            onSendReminder={handleSendReminder} onDeleteGroup={() => setShowDeleteConfirm(true)}
          />
          <StatisticsCard participants={participants} overlaps={overlaps} />
        </div>

        <ParticipantTable participants={participants} actions={participantActions} />

        <VotingSection
          heatmapRef={heatmapRef} showVotingSetup={showVotingSetup} poll={poll}
          group={group} participants={participants} overlaps={overlaps}
          durationFilter={durationFilter} setDurationFilter={setDurationFilter}
          adminParticipantId={adminParticipantId}
          onStartPoll={handleStartPoll} onCancelSetup={() => setShowVotingSetup(false)}
          onClosePoll={handleClosePoll} onDeletePoll={handleDeletePoll}
          onVote={handleAdminVote} onSendInvites={handleSendVoteInvites}
          onSendResult={handleSendVoteResult}
        />

        <AdminAvailability
          group={group} adminParticipantId={adminParticipantId}
          adminSavedDays={adminSavedDays} adminName={adminName}
          adminEmail={adminEmail} adminDuration={adminDuration}
          onSave={handleAdminAvailability}
        />

        <ConfirmDialog
          open={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)}
          onConfirm={handleDelete} title="Delete Group"
          message="Are you sure? This will delete the entire group and all data. This action cannot be undone."
          confirmLabel="Delete" cancelLabel="Cancel" variant="danger"
        />
      </div>
    </div>
  );
}

export default AdminPage;
