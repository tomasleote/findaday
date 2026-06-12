import { useCallback } from 'react';
import { updateGroup, deleteGroup } from '../../../services/groupService';
import { addParticipant, updateParticipant } from '../../../services/participantService';
import { hashPhrase } from '../../../services/adminService';
import { apiCall } from '../../../services/apiService';
import { exportToCSV } from '../../../utils/export';
import { validateParticipantName } from '../../../utils/participantValidation';
import { createPoll, closePoll, deletePoll, submitVote } from '../../../services/pollService';
import { computeVoteWinner } from './adminPageHelpers';

export function useAdminPageActions({
  groupId,
  adminToken,
  group,
  setGroup,
  participants,
  overlaps,
  editData,
  setEditing,
  adminParticipantId,
  setAdminParticipantId,
  setAdminSavedDays,
  setAdminName,
  setAdminEmail,
  setAdminDuration,
  setPoll,
  setShowVotingSetup,
  setShowDeleteConfirm,
  setReminderSending,
  poll,
  onBack,
  addNotification,
}) {
  const handleSaveEdit = useCallback(async () => {
    try {
      const updates = { ...editData };
      const normalized = updates.newPassphrase?.trim();
      if (normalized) {
        updates.recoveryPasswordHash = await hashPhrase(normalized);
      }
      delete updates.newPassphrase;

      await updateGroup(groupId, updates);
      setGroup({ ...group, ...updates });
      setEditing(false);
      addNotification({ type: 'success', title: 'Group Updated', message: 'Group settings have been saved.' });
    } catch (err) {
      console.error('[Admin Panel Error] handleSaveEdit failed:', err);
      addNotification({ type: 'error', title: 'Update Failed', message: err.message });
    }
  }, [editData, groupId, group, setGroup, addNotification, setEditing]);

  const handleDelete = useCallback(async () => {
    try {
      await deleteGroup(groupId);
      onBack();
    } catch (err) {
      console.error('[Admin Panel Error] handleDelete failed:', err);
      addNotification({ type: 'error', title: 'Delete Failed', message: err.message });
    } finally {
      setShowDeleteConfirm(false);
    }
  }, [groupId, onBack, addNotification, setShowDeleteConfirm]);

  const handleExport = useCallback(() => {
    try {
      if (group && participants?.length > 0) {
        exportToCSV(group, participants, overlaps);
      }
    } catch (err) {
      console.error('[Admin Panel Error] handleExport failed:', err);
      addNotification({ type: 'error', title: 'Export Failed', message: err.message });
    }
  }, [group, participants, overlaps, addNotification]);

  const handleSendReminder = useCallback(async () => {
    setReminderSending(true);
    try {
      await apiCall('/api/send-reminder', {
        method: 'POST',
        body: JSON.stringify({
          groupId,
          groupName: group.name,
          startDate: group.startDate,
          participants: participants?.filter(p => p?.email && p.email.trim() !== '').map(p => ({ email: p.email })) || [],
          baseUrl: window.location.origin,
        })
      });
      addNotification({ type: 'success', title: 'Reminder Sent', message: 'Reminders have been sent to participants.' });
    } catch (err) {
      console.error('[Fetch Failure] handleSendReminder failed:', err);
      addNotification({ type: 'error', title: 'Error', message: err.message || 'Failed to send reminder.' });
    } finally {
      setReminderSending(false);
    }
  }, [groupId, group, participants, addNotification, setReminderSending]);

  const handleAdminAvailability = useCallback(async (formData) => {
    try {
      const finalDays = formData.selectedDays || [];

      const nameCheck = validateParticipantName(formData.name, participants, adminParticipantId);
      if (!nameCheck.valid) {
        throw new Error(nameCheck.error || 'Invalid participant name.');
      }

      if (!adminParticipantId) {
        const participantId = await addParticipant(groupId, {
          name: formData.name,
          email: formData.email,
          duration: formData.duration,
          availableDays: finalDays,
          blockType: formData.blockType
        });
        setAdminParticipantId(participantId);
        try {
          localStorage.setItem(
            `fad_admin_p_${groupId}`,
            JSON.stringify({ participantId, name: formData.name, email: formData.email, duration: formData.duration })
          );
        } catch { }
      } else {
        await updateParticipant(groupId, adminParticipantId, {
          name: formData.name,
          email: formData.email,
          availableDays: finalDays,
          duration: formData.duration,
          blockType: formData.blockType
        });
      }

      setAdminSavedDays(finalDays);
      setAdminName(formData.name);
      setAdminEmail(formData.email || '');
      setAdminDuration(String(formData.duration));
      addNotification({ type: 'success', title: 'Availability Saved', message: 'Your availability has been saved!' });
    } catch (err) {
      console.error('[Admin Auth Error] handleAdminAvailability failed:', err);
      addNotification({ type: 'error', title: 'Error', message: err.message });
    }
  }, [participants, adminParticipantId, groupId, setAdminParticipantId, setAdminSavedDays, setAdminName, setAdminEmail, setAdminDuration, addNotification]);

  const handleStartPoll = useCallback(async ({ mode, candidates }) => {
    try {
      await createPoll(groupId, { mode, candidates });
      setShowVotingSetup(false);
      addNotification({ type: 'success', title: 'Poll Started', message: 'Participants can now vote.' });
    } catch (err) {
      addNotification({ type: 'error', title: 'Error', message: err.message });
      throw err;
    }
  }, [groupId, addNotification, setShowVotingSetup]);

  const handleClosePoll = useCallback(async () => {
    try {
      await closePoll(groupId);
      addNotification({ type: 'success', title: 'Poll Closed', message: 'Results are now final.' });
    } catch (err) {
      addNotification({ type: 'error', title: 'Error', message: err.message });
    }
  }, [groupId, addNotification]);

  const handleDeletePoll = useCallback(async () => {
    try {
      await deletePoll(groupId);
      setPoll(null);
      addNotification({ type: 'success', title: 'Poll Removed', message: 'You can start a new vote.' });
    } catch (err) {
      addNotification({ type: 'error', title: 'Error', message: err.message });
    }
  }, [groupId, setPoll, addNotification]);

  const handleAdminVote = useCallback(async ({ newCandidateIds }) => {
    if (!adminParticipantId) return;
    try {
      await submitVote(groupId, adminParticipantId, newCandidateIds);
    } catch (err) {
      addNotification({ type: 'error', title: 'Vote Error', message: err.message });
    }
  }, [groupId, adminParticipantId, addNotification]);

  const handleSendVoteInvites = useCallback(async () => {
    try {
      await apiCall('/api/send-vote-invite', {
        method: 'POST',
        body: JSON.stringify({
          groupId,
          adminToken,
          groupName: group.name,
          participants: participants.filter(p => p?.email).map(p => ({ email: p.email, id: p.id })),
          baseUrl: window.location.origin,
        }),
      });
      addNotification({ type: 'success', title: 'Invites Sent', message: 'Voting invites delivered.' });
    } catch (err) {
      addNotification({ type: 'error', title: 'Error', message: err.message });
    }
  }, [groupId, group, participants, addNotification, adminToken]);

  const handleSendVoteResult = useCallback(async () => {
    try {
      const votes = poll?.votes || {};
      const candidates = poll?.candidates || {};
      const winner = computeVoteWinner(votes, candidates);

      await apiCall('/api/send-vote-result', {
        method: 'POST',
        body: JSON.stringify({
          groupId,
          adminToken,
          groupName: group.name,
          winnerStartDate: winner?.startDate,
          winnerEndDate: winner?.endDate,
          participants: participants.filter(p => p?.email).map(p => ({ email: p.email })),
          baseUrl: window.location.origin,
        }),
      });
      addNotification({ type: 'success', title: 'Result Sent', message: 'Calendar invites delivered.' });
    } catch (err) {
      addNotification({ type: 'error', title: 'Error', message: err.message });
    }
  }, [groupId, group, participants, poll, addNotification, adminToken]);

  return {
    handleSaveEdit,
    handleDelete,
    handleExport,
    handleSendReminder,
    handleAdminAvailability,
    handleStartPoll,
    handleClosePoll,
    handleDeletePoll,
    handleAdminVote,
    handleSendVoteInvites,
    handleSendVoteResult,
  };
}
