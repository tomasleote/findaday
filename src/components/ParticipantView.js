import React, { useState, useRef } from 'react';
import { Button, LoadingSpinner, Card, TruncatedText, LocationDisplay } from '../shared/ui';
import { isSingleDayEvent } from '../utils/eventTypes';
import { ChevronDown, ChevronUp, CalendarRange, Users } from 'lucide-react';

import CalendarView from './CalendarView';
import SchemaMarkup from '../features/landing/SchemaMarkup';

import { useParticipantViewData } from './participant-view/useParticipantViewData';
import { ParticipantDashboard } from './participant-view/ParticipantDashboard';
import { ParticipantsSidebar, PollBanner, OverlapSection } from './participant-view/participantViewHelpers';

function ParticipantView({ participantId: initialParticipantId, onBack }) {
  const calendarRef = useRef(null);
  const [expandedSection, setExpandedSection] = useState('form');
  const {
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
  } = useParticipantViewData(initialParticipantId);

  if (loading) {
    return <LoadingSpinner label="Loading..." />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card variant="danger" className="text-center max-w-md">
          <h2 className="text-xl font-bold text-rose-400 mb-2">Access Denied</h2>
          <p className="text-gray-300 mb-6 font-medium">{error}</p>
          <Button variant="secondary" fullWidth onClick={onBack}>
            Go Home
          </Button>
        </Card>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-dark-900 rounded-xl border border-dark-700 p-8 max-w-md text-center">
          <p className="text-rose-400 mb-6 font-medium">Group not found or could not be loaded.</p>
          <button
            onClick={onBack}
            className="w-full bg-brand-500 hover:bg-brand-400 text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <SchemaMarkup group={group} content={{}} />
      <div className="max-w-4xl mx-auto">
        <button
          onClick={onBack}
          className="text-brand-400 hover:text-brand-300 font-semibold mb-8"
        >
          ← Back to Home
        </button>

        <div className="bg-dark-900 rounded-xl border border-dark-700 p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-50 mb-2">
            <TruncatedText text={group.name} />
          </h1>
          {group.description && (
            <p className="text-gray-400 mb-4 italic">{group.description}</p>
          )}
          <p className="text-gray-400 mb-4">
            {isSingleDayEvent(group?.eventType) ? 'Which days work for you?' : 'Select the dates you\'re available'}
          </p>
          <div className="flex gap-4 text-sm text-gray-400 flex-wrap">
            <span className="flex items-center gap-1.5"><CalendarRange size={16} className="text-gray-500" /> {group.startDate} to {group.endDate}</span>
            <span className="flex items-center gap-1.5"><Users size={16} className="text-gray-500" /> {participants?.length || 0} people attending</span>
          </div>
          {group.location && (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <LocationDisplay location={group.location} />
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            {currentParticipantId ? (
              <ParticipantDashboard
                groupId={groupId}
                participantId={currentParticipantId}
                participantName={participantName}
                participantEmail={participantEmail}
                participantDuration={participantDuration}
                savedDays={savedDays}
                group={group}
                onSubmit={handleSubmit}
              />
            ) : (
              <div className="bg-dark-900 rounded-xl border border-dark-700 p-6">
                <h2 className="text-xl font-bold text-gray-50 mb-4">Select Your Availability</h2>
                <CalendarView
                  startDate={group.startDate}
                  endDate={group.endDate}
                  onSubmit={handleSubmit}
                  savedDays={savedDays}
                  singleDay={isSingleDayEvent(group?.eventType)}
                />
              </div>
            )}
          </div>

          <div className="md:col-span-1">
            <ParticipantsSidebar participants={participants} />
          </div>
        </div>

        <PollBanner poll={poll} />

        <OverlapSection
          group={group}
          participants={participants}
          heatmapDuration={heatmapDuration}
          setHeatmapDuration={setHeatmapDuration}
          overlaps={overlaps}
          poll={poll}
          handleVote={handleVote}
          currentParticipantId={currentParticipantId}
          calendarRef={calendarRef}
        />
      </div>
    </div>
  );
}

export default ParticipantView;
