import { useState, useEffect, useRef } from 'react';
import { subscribeToGroup } from '../../services/groupService';
import { addParticipant, updateParticipant, getParticipant, subscribeToParticipants } from '../../services/participantService';
import { calculateOverlap } from '../../utils/overlap';
import { useNotification } from '../../context/NotificationContext';
import { useGroupContext } from '../../shared/context';
import { subscribeToPoll, submitVote, closePoll } from '../../services/pollService';

function useParticipantViewData(initialParticipantId) {
  const { groupId } = useGroupContext();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { addNotification } = useNotification();
  const [participants, setParticipants] = useState([]);
  const participantsRef = useRef(0);
  const [currentParticipantId, setCurrentParticipantId] = useState(null);
  const [savedDays, setSavedDays] = useState([]);
  const [participantName, setParticipantName] = useState('');
  const [participantEmail, setParticipantEmail] = useState('');
  const [participantDuration, setParticipantDuration] = useState('3');
  const [heatmapDuration, setHeatmapDuration] = useState('3');
  const [overlaps, setOverlaps] = useState([]);
  const [poll, setPoll] = useState(null);

  useEffect(() => {
    if (!groupId) return;

    setLoading(true);
    let initialLoads = 2;
    const onLoad = () => {
      initialLoads--;
      if (initialLoads <= 0) setLoading(false);
    };

    const unsubGroup = subscribeToGroup(groupId, (data) => {
      setError('');
      if (data) {
        setGroup(data);
      } else {
        setGroup(null);
      }
      onLoad();
    }, (err) => {
      setError(err.message || 'Failed to load group data.');
      onLoad();
    });

    const unsubParts = subscribeToParticipants(groupId, (data) => {
      setError('');
      setParticipants(data || []);
      participantsRef.current = (data || []).length;
      onLoad();
    }, (err) => {
      setError(err.message || 'Failed to load participants.');
      onLoad();
    });

    return () => {
      unsubGroup();
      unsubParts();
    };
  }, [groupId]);

  useEffect(() => {
    if (!initialParticipantId) return;
    const restore = async () => {
      try {
        const participant = await getParticipant(groupId, initialParticipantId);
        if (participant) {
          setCurrentParticipantId(initialParticipantId);
          setSavedDays(participant.availableDays || []);
          setParticipantName(participant.name);
          setParticipantEmail(participant.email || '');
          setParticipantDuration(String(participant.duration || '3'));
          setHeatmapDuration(String(participant.duration || '3'));
        }
      } catch (err) {
        console.error('[ParticipantView] Failed to restore participant:', err);
        addNotification({
          type: 'error',
          title: 'Network Error',
          message: 'Could not load your saved dates. Please check your connection or try again later.'
        });
      }
    };
    restore();
  }, [groupId, initialParticipantId]);

  useEffect(() => {
    if (!groupId) return;
    const unsub = subscribeToPoll(
      groupId,
      (pollData) => {
        setPoll(pollData);

        // Auto-close: if all participants have voted, close the poll.
        // Read the count from a ref — this callback is created once on
        // subscribe, so reading the state variable would give a stale value.
        if (pollData?.status === 'active' && participantsRef.current > 0) {
          const voterCount = Object.keys(pollData.votes || {}).length;
          if (voterCount >= participantsRef.current) {
            closePoll(groupId).catch(err =>
              console.error('[ParticipantView] auto-close poll failed:', err)
            );
          }
        }
      },
      (err) => console.error('[ParticipantView] poll subscription error:', err)
    );
    return unsub;
  }, [groupId]);

  useEffect(() => {
    if (group && participants?.length > 0) {
      const results = calculateOverlap(
        participants,
        group.startDate,
        group.endDate,
        parseInt(heatmapDuration || '3')
      );
      setOverlaps(results);
    } else {
      setOverlaps([]);
    }
  }, [group, participants, heatmapDuration]);

  const handleVote = async ({ newCandidateIds }) => {
    if (!currentParticipantId || !poll) return;
    try {
      await submitVote(groupId, currentParticipantId, newCandidateIds);
    } catch (err) {
      addNotification({ type: 'error', title: 'Vote Error', message: err.message });
    }
  };

  const handleSubmit = async (formData) => {
    try {
      setLoading(true);

      // The participants state is already updated via a real-time listener (subscribeToParticipants).
      // This ensures the `participants` array is always current for checks like duplication.
      const normalizedName = formData.name.trim().toLowerCase();
      const isDuplicate = participants.some(
        p => p.name.trim().toLowerCase() === normalizedName && p.id !== currentParticipantId
      );
      if (isDuplicate) {
        throw new Error('A participant with this name already exists. Please choose another name.');
      }

      // The CalendarView now passes the entire desired array state.
      // E.g., if a user unselects a previously saved day, formData.selectedDays simply won't include it.
      const finalDays = formData.selectedDays || [];

      if (!currentParticipantId) {
        const participantId = await addParticipant(groupId, {
          name: formData.name,
          email: formData.email,
          duration: formData.duration,
          availableDays: finalDays,
          blockType: formData.blockType
        });
        setCurrentParticipantId(participantId);
        setParticipantName(formData.name);
        setParticipantEmail(formData.email || '');
        setParticipantDuration(String(formData.duration));
        setHeatmapDuration(String(formData.duration));

        try {
          localStorage.setItem(
            `fad_p_${groupId}`,
            JSON.stringify({ participantId, name: formData.name })
          );
        } catch { }

        window.history.replaceState({}, '', `?group=${groupId}&p=${participantId}`);
      } else {
        await updateParticipant(groupId, currentParticipantId, {
          name: formData.name,
          email: formData.email,
          availableDays: finalDays,
          duration: formData.duration,
          blockType: formData.blockType
        });
        setParticipantName(formData.name);
        setParticipantEmail(formData.email || '');
        setParticipantDuration(String(formData.duration));
      }

      setSavedDays(finalDays);
      addNotification({
        type: 'success',
        title: 'Success',
        message: 'Your response has been recorded. Thank you!'
      });
    } catch (err) {
      console.error('[Participant Submission Error] handleSubmit failed:', err);
      addNotification({
        type: 'error',
        title: 'Error',
        message: err.message
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    groupId,
    group,
    loading,
    error,
    participants,
    currentParticipantId,
    savedDays,
    participantName,
    participantEmail,
    participantDuration,
    heatmapDuration,
    setHeatmapDuration,
    overlaps,
    poll,
    handleVote,
    handleSubmit,
  };
}

export { useParticipantViewData };
