import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Calendar } from 'lucide-react';
import { Label } from './Input';
import {
  fromYMD, toYMD,
  getDaysInMonth, getFirstDayOfWeek,
  isSameDay, isBefore, isAfter, isToday,
  formatDisplayDate,
} from '../../utils/dateUtils';
import { CalendarDropdown } from '../calendar/CalendarDropdown';

function CalendarPicker({
  label,
  id,
  value = '',
  onChange,
  minDate = '',
  maxDate = '',
  required = false,
  placeholder = 'Select a date',
  className = '',
}) {
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    function onMouseDown(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    function onKeyDown(e) {
      if (e.key === 'Escape') setIsOpen(false);
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen]);

  const handleToggle = () => {
    if (!isOpen) {
      const jumpTo =
        (value ? fromYMD(value) : null) ||
        (minDate ? fromYMD(minDate) : null) ||
        new Date();
      setViewYear(jumpTo.getFullYear());
      setViewMonth(jumpTo.getMonth());
    }
    setIsOpen((o) => !o);
  };

  const handleSelect = useCallback(
    (day) => {
      onChange(toYMD(new Date(viewYear, viewMonth, day)));
      setIsOpen(false);
    },
    [viewYear, viewMonth, onChange]
  );

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const minDateObj = minDate ? fromYMD(minDate) : null;
  const maxDateObj = maxDate ? fromYMD(maxDate) : null;
  const selectedDate = value ? fromYMD(value) : null;

  const isPrevDisabled =
    !!minDateObj && isBefore(new Date(viewYear, viewMonth, 0), minDateObj);
  const isNextDisabled =
    !!maxDateObj && isAfter(new Date(viewYear, viewMonth + 1, 1), maxDateObj);

  const isDayDisabled = (day) => {
    const date = new Date(viewYear, viewMonth, day);
    if (minDateObj && isBefore(date, minDateObj)) return true;
    if (maxDateObj && isAfter(date, maxDateObj)) return true;
    return false;
  };

  const getDayAriaLabel = (day) => {
    const date = new Date(viewYear, viewMonth, day);
    let ariaLabel = date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
    if (isToday(date)) ariaLabel += ', today';
    if (selectedDate && isSameDay(date, selectedDate)) ariaLabel += ', selected';
    return ariaLabel;
  };

  return (
    <div ref={containerRef} className={`relative${className ? ` ${className}` : ''}`}>
      {label && <Label htmlFor={id}>{label}</Label>}

      <button
        type="button"
        id={id}
        onClick={handleToggle}
        aria-expanded={isOpen}
        aria-haspopup="grid"
        aria-label={value ? formatDisplayDate(value) : placeholder}
        className={
          'w-full px-3 py-2.5 bg-dark-800 border border-dark-700 rounded-lg text-left ' +
          'flex items-center justify-between gap-2 transition-colors ' +
          'focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 ' +
          'hover:border-gray-600'
        }
      >
        <span className={value ? 'text-gray-50 text-sm' : 'text-gray-500 text-sm'}>
          {value ? formatDisplayDate(value) : placeholder}
        </span>
        <Calendar size={15} className="text-gray-500 shrink-0" />
      </button>

      <input type="hidden" name={id} value={value} />

      {isOpen && (
        <CalendarDropdown
          viewYear={viewYear}
          viewMonth={viewMonth}
          daysInMonth={getDaysInMonth(viewYear, viewMonth)}
          firstDayOffset={getFirstDayOfWeek(viewYear, viewMonth)}
          selectedDate={selectedDate}
          onPrev={prevMonth}
          onNext={nextMonth}
          onSelect={handleSelect}
          isDayDisabled={isDayDisabled}
          getDayAriaLabel={getDayAriaLabel}
          isPrevDisabled={isPrevDisabled}
          isNextDisabled={isNextDisabled}
        />
      )}
    </div>
  );
}

export default CalendarPicker;
