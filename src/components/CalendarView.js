import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getDatesBetween } from '../utils/overlap';
import { Calendar } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import { Link } from 'react-router-dom';
import { useRangeSelection } from '../hooks/useRangeSelection';
import { getDaysInMonth } from '../utils/dateUtils';
import { buildMonthCells } from '../shared/calendar/monthGrid';
import { DayCell } from '../shared/calendar/DayCell';
import { ParticipantDetailsForm } from '../shared/calendar/ParticipantDetailsForm';

function CalendarView({ startDate, endDate, onSubmit, savedDays = [], initialName = '', initialEmail = '', initialDuration = '3', singleDay = false }) {
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [duration, setDuration] = useState(initialDuration);
  const [currentMonth, setCurrentMonth] = useState(new Date(startDate).getMonth());
  const [currentYear, setCurrentYear] = useState(new Date(startDate).getFullYear());
  const [loading, setLoading] = useState(false);
  const { addNotification } = useNotification();
  const [isDirty, setIsDirty] = useState(false);
  const [localDuration, setLocalDuration] = useState(String(initialDuration));

  const start = new Date(startDate);
  const end = new Date(endDate);
  const dateRange = getDatesBetween(startDate, endDate);

  const {
    selectedDays,
    rangeStart,
    handleDayClick: rangeHandleDayClick,
    syncFromSaved,
  } = useRangeSelection(dateRange, savedDays || []);

  // Only sync if there are no unsaved local changes to avoid clobbering user edits
  useEffect(() => {
    if (savedDays && !isDirty) {
      syncFromSaved(savedDays);
    }
  }, [savedDays, isDirty, syncFromSaved]);

  const monthYear = new Date(currentYear, currentMonth);
  // CalendarView uses Sunday-based week (0=Sun), matching its 'Sun Mon … Sat' headers
  const firstDayOffset = new Date(currentYear, currentMonth, 1).getDay();
  const days = buildMonthCells(getDaysInMonth(currentYear, currentMonth), firstDayOffset);

  const isDateInRange = useCallback((dateStr) => dateRange.includes(dateStr), [dateRange]);
  const selectedSet = useMemo(() => new Set(selectedDays), [selectedDays]);

  const isDaySelected = useCallback((day) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return selectedSet.has(dateStr);
  }, [currentYear, currentMonth, selectedSet]);

  const isPendingStart = useCallback((dateStr) => rangeStart === dateStr, [rangeStart]);

  const handleDayClick = useCallback((day) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    if (!isDateInRange(dateStr)) return;
    setIsDirty(true);
    rangeHandleDayClick(dateStr);
  }, [currentYear, currentMonth, isDateInRange, rangeHandleDayClick]);

  const buildPayload = (days) => ({
    name,
    email,
    duration: singleDay ? 1 : parseInt(localDuration),
    blockType: 'flexible',
    selectedDays: days,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) { addNotification({ type: 'warning', message: 'Please enter your name' }); return; }
    if (selectedDays.length === 0) { addNotification({ type: 'warning', message: 'Please select at least one day' }); return; }
    setLoading(true);
    try {
      await onSubmit(buildPayload([...selectedDays].sort()));
      setIsDirty(false);
    } catch (err) {
      console.error('[Calendar Save Error] Save Details Only failed:', err);
      addNotification({ type: 'error', title: 'Error', message: err.message });
    } finally { setLoading(false); }
  };

  const handleSaveDetails = async (e) => {
    e.preventDefault();
    if (!name.trim()) { addNotification({ type: 'warning', message: 'Please enter your name' }); return; }
    setLoading(true);
    try {
      await onSubmit(buildPayload(savedDays));
    } catch (err) {
      console.error('[Calendar Submit Error] onSubmit failed:', err);
      addNotification({ type: 'error', title: 'Error', message: err.message });
    } finally { setLoading(false); }
  };

  const handlePrevMonth = () => {
    const newMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const newYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    if (new Date(newYear, newMonth) >= new Date(start.getFullYear(), start.getMonth())) {
      setCurrentMonth(newMonth);
      setCurrentYear(newYear);
    }
  };

  const handleNextMonth = () => {
    const newMonth = currentMonth === 11 ? 0 : currentMonth + 1;
    const newYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    if (new Date(newYear, newMonth) <= new Date(end.getFullYear(), end.getMonth())) {
      setCurrentMonth(newMonth);
      setCurrentYear(newYear);
    }
  };

  const monthName = monthYear.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col h-full relative">
      <ParticipantDetailsForm
        name={name} setName={setName}
        email={email} setEmail={setEmail}
        localDuration={localDuration} setLocalDuration={setLocalDuration}
        setDuration={setDuration}
        singleDay={singleDay}
        dateRange={dateRange}
        loading={loading}
        onSaveDetails={handleSaveDetails}
      />

      <div className="flex-1 bg-dark-900 rounded-2xl border border-dark-700 p-4 shrink-0">
        <div className="flex justify-between items-center mb-6">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="px-4 py-2 bg-dark-800 hover:bg-dark-700 border border-dark-700 rounded-xl text-sm font-bold text-gray-300 transition"
          >
            ← Prev
          </button>
          <h3 className="text-xl font-bold text-gray-50 tracking-tight">{monthName}</h3>
          <button
            type="button"
            onClick={handleNextMonth}
            className="px-4 py-2 bg-dark-800 hover:bg-dark-700 border border-dark-700 rounded-xl text-sm font-bold text-gray-300 transition"
          >
            Next →
          </button>
        </div>

        <div className="text-center text-xs text-gray-500 mb-3">
          {rangeStart
            ? 'Now click an end date to complete your range'
            : 'Click a date to start a range. Click a selected day to deselect it.'}
        </div>

        <div className="grid grid-cols-7 gap-1 md:gap-2 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center font-bold text-gray-500 text-xs py-2 uppercase tracking-wide">
              {day}
            </div>
          ))}
          {days.map((day, i) => (
            <DayCell
              key={i}
              day={day}
              currentYear={currentYear}
              currentMonth={currentMonth}
              monthName={monthName}
              isDateInRange={isDateInRange}
              isDaySelected={isDaySelected}
              isPendingStart={isPendingStart}
              onDayClick={handleDayClick}
            />
          ))}
        </div>

        {selectedDays.length > 0 && (
          <div className="bg-brand-500/10 text-brand-400 p-3 rounded-xl border border-brand-500/20 mt-6 flex justify-center items-center gap-2 font-medium">
            <span data-testid="day-count">
              <strong>{selectedDays.length}</strong> day{selectedDays.length !== 1 ? 's' : ''} selected
            </span>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={loading || selectedDays.length === 0}
            className="w-full sm:w-auto bg-brand-500 hover:bg-brand-400 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-md shadow-brand-500/20 hover:shadow-lg focus:ring-2 focus:ring-brand-500/30 disabled:opacity-50 flex items-center justify-center gap-2 transform active:scale-95"
          >
            <Calendar size={18} />
            {loading ? 'Submitting...' : 'Submit Availability'}
          </button>
        </div>
      </div>
    </form>
  );
}

export default CalendarView;
