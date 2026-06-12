import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatMonthYear, isToday, isSameDay } from '../../utils/dateUtils';
import { buildMonthCells } from './monthGrid';

const DAY_NAMES = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

function CalendarDropdown({
  viewYear,
  viewMonth,
  daysInMonth,
  firstDayOffset,
  selectedDate,
  onPrev,
  onNext,
  onSelect,
  isDayDisabled,
  getDayAriaLabel,
  isPrevDisabled,
  isNextDisabled,
}) {
  const cells = buildMonthCells(daysInMonth, firstDayOffset);

  return (
    <div
      className="absolute top-full left-0 right-0 mt-1 bg-dark-900 border border-dark-700 rounded-xl p-3 animate-fade-in z-50 shadow-lg"
      role="grid"
      aria-label={formatMonthYear(viewYear, viewMonth)}
    >
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={onPrev}
          disabled={isPrevDisabled}
          aria-label="Previous month"
          className="p-1 rounded-md text-gray-400 hover:text-gray-100 hover:bg-dark-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-sm font-semibold text-gray-200">
          {formatMonthYear(viewYear, viewMonth)}
        </span>
        <button
          type="button"
          onClick={onNext}
          disabled={isNextDisabled}
          aria-label="Next month"
          className="p-1 rounded-md text-gray-400 hover:text-gray-100 hover:bg-dark-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="grid grid-cols-7 mb-1" role="row">
        {DAY_NAMES.map((d) => (
          <div
            key={d}
            role="columnheader"
            className="text-center text-[11px] font-medium text-gray-500 py-1"
          >
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-0.5" role="rowgroup">
        {cells.map((day, i) => {
          if (day === null) {
            return <div key={`empty-${i}`} role="gridcell" />;
          }

          const disabled = isDayDisabled(day);
          const dayDate = new Date(viewYear, viewMonth, day);
          const selected = selectedDate && isSameDay(dayDate, selectedDate);
          const todayMark = isToday(dayDate);
          const ariaLabel = getDayAriaLabel(day);

          let cellClass =
            'w-full aspect-square text-sm rounded-lg flex items-center justify-center transition-colors ';

          if (disabled) {
            cellClass += 'text-gray-700 cursor-not-allowed opacity-30';
          } else if (selected) {
            cellClass += 'bg-brand-500 text-white font-semibold';
          } else if (todayMark) {
            cellClass += 'ring-1 ring-brand-400/60 text-brand-400 hover:bg-dark-700';
          } else {
            cellClass += 'text-gray-300 hover:bg-dark-700 hover:text-gray-100';
          }

          return (
            <button
              key={day}
              type="button"
              role="gridcell"
              aria-label={ariaLabel}
              aria-disabled={disabled}
              disabled={disabled}
              onClick={() => onSelect(day)}
              className={cellClass}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export { CalendarDropdown };
