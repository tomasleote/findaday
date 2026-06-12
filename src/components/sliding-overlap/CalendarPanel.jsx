import React from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import DayCell from './DayCell';

const CalendarPanel = ({
    monthName,
    handlePrevMonth,
    handleNextMonth,
    votingMode,
    onDurationChange,
    singleDay,
    duration,
    localDuration,
    setLocalDuration,
    dateRange,
    days,
    currentYear,
    currentMonth,
    dailyAvailability,
    participants,
    activeBlock,
    highlightedCandidates,
    candidateDateMap,
    selectedCandidateId,
    lockedDate,
    onDayCellMouseEnter,
    onDayCellMouseLeave,
    onDayClick,
}) => {
    return (
        <div className="w-full md:w-[60%] p-6 border-b md:border-b-0 md:border-r border-dark-700 bg-dark-900">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <CalendarIcon size={24} className="text-brand-400" />
                    <h3 className="text-xl font-bold text-gray-50">Availability Heatmap</h3>
                </div>
                {!votingMode?.active && onDurationChange && !singleDay ? (
                    <div className="flex items-center gap-1 bg-dark-800 pl-3 pr-1 py-1 rounded-full border border-dark-700 focus-within:ring-2 focus-within:ring-brand-500/30 focus-within:border-brand-500">
                        <input
                            type="number"
                            min="1"
                            max={dateRange.length}
                            value={localDuration}
                            onChange={(e) => {
                                const valStr = e.target.value;
                                // State is updated; debounced effect handles the callback
                                setLocalDuration(valStr);
                            }}
                            onBlur={() => {
                                let val = parseInt(localDuration);
                                if (isNaN(val) || val < 1) val = 1;
                                if (val > dateRange.length) val = dateRange.length;
                                setLocalDuration(String(val));
                                onDurationChange(String(val));
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.target.blur();
                                }
                            }}
                            className="w-10 text-center text-sm text-brand-400 font-bold bg-transparent outline-none p-0"
                        />
                        <span className="text-sm text-gray-400 font-medium whitespace-nowrap pr-2">
                            -Day Period
                        </span>
                    </div>
                ) : !votingMode?.active ? (
                    <div className="text-sm text-gray-400 font-medium bg-dark-800 px-3 py-1 rounded-full border border-dark-700">
                        {singleDay ? 'Single Day' : `${duration}-Day Period`}
                    </div>
                ) : null}
            </div>

            <div className="bg-dark-800 rounded-xl border border-dark-700 p-4">
                <div className="flex justify-between items-center mb-4">
                    <button
                        onClick={handlePrevMonth}
                        className="px-3 py-1.5 bg-dark-700 hover:bg-dark-800 rounded-md text-sm font-semibold text-gray-300 transition"
                    >
                        ← Prev
                    </button>
                    <h4 className="text-lg font-bold text-gray-50">{monthName}</h4>
                    <button
                        onClick={handleNextMonth}
                        className="px-3 py-1.5 bg-dark-700 hover:bg-dark-800 rounded-md text-sm font-semibold text-gray-300 transition"
                    >
                        Next →
                    </button>
                </div>

                <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="text-center font-bold text-gray-500 text-xs py-2 uppercase tracking-wider">
                            {day}
                        </div>
                    ))}
                    {days.map((day, i) => (
                        <DayCell
                            key={i}
                            day={day}
                            index={i}
                            currentYear={currentYear}
                            currentMonth={currentMonth}
                            dateRange={dateRange}
                            dailyAvailability={dailyAvailability}
                            participants={participants}
                            activeBlock={activeBlock}
                            votingMode={votingMode}
                            highlightedCandidates={highlightedCandidates}
                            candidateDateMap={candidateDateMap}
                            selectedCandidateId={selectedCandidateId}
                            lockedDate={lockedDate}
                            duration={duration}
                            onMouseEnter={onDayCellMouseEnter}
                            onMouseLeave={onDayCellMouseLeave}
                            onClick={onDayClick}
                        />
                    ))}
                </div>

                {/* Heatmap Legend */}
                <div className="mt-6 flex items-center justify-center gap-2 text-xs md:text-sm text-gray-400">
                    <span>Least Available</span>
                    <div className="flex gap-1">
                        <div className="w-4 h-4 rounded bg-dark-800"></div>
                        <div className="w-4 h-4 rounded bg-brand-900/60"></div>
                        <div className="w-4 h-4 rounded bg-amber-500"></div>
                        <div className="w-4 h-4 rounded bg-brand-600"></div>
                        <div className="w-4 h-4 rounded bg-brand-500"></div>
                    </div>
                    <span>Most Available</span>
                </div>

            </div>
        </div>
    );
};

export default CalendarPanel;
