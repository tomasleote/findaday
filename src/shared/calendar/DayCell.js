import React from 'react';

const DayCell = React.memo(({ day, currentYear, currentMonth, monthName, isDateInRange, isDaySelected, isPendingStart, onDayClick }) => {
  if (!day) {
    return (
      <button
        type="button"
        disabled
        className="aspect-square p-2 text-sm md:text-base font-bold rounded-xl transition-all duration-200 bg-transparent"
      />
    );
  }

  const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const inRange = isDateInRange(dateStr);
  const selected = isDaySelected(day);
  const pendingStart = isPendingStart(dateStr);

  const ariaLabel = `${monthName}, day ${day}${selected ? ' (selected)' : ''}${pendingStart ? ' (range start)' : ''}`;
  const testId = `day-${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  let cellClass = 'aspect-square p-2 text-sm md:text-base font-bold rounded-xl transition-all duration-200';

  if (!inRange) {
    cellClass += ' bg-dark-950 text-gray-600 cursor-not-allowed opacity-50';
  } else if (pendingStart) {
    cellClass += ' bg-brand-500 text-white shadow-md shadow-brand-500/20 transform scale-[1.02] ring-2 ring-brand-400/40';
  } else if (selected) {
    cellClass += ' bg-brand-500 text-white shadow-md shadow-brand-500/20 transform scale-[1.02]';
  } else {
    cellClass += ' bg-dark-800 border border-dark-700 hover:border-brand-500/50 hover:bg-brand-500/5 text-gray-300';
  }

  return (
    <button
      type="button"
      onClick={() => onDayClick(day)}
      disabled={!inRange}
      aria-label={ariaLabel}
      data-testid={testId}
      className={cellClass}
    >
      {day}
    </button>
  );
});

export { DayCell };
