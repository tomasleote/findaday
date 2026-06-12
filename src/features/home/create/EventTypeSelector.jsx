import React from 'react';
import { EVENT_TYPES } from '../../../utils/eventTypes';

export function EventTypeSelector({ eventType, onChange }) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-6 mb-3" role="radiogroup" aria-label="Event Type">
      {Object.values(EVENT_TYPES).map((type) => (
        <button
          key={type.key}
          type="button"
          role="radio"
          aria-checked={eventType === type.key}
          aria-label={type.label}
          onClick={() => onChange(type.key)}
          className={`p-2 flex flex-col items-center justify-center rounded-lg border text-center transition-colors ${eventType === type.key
            ? 'border-brand-500 bg-brand-500/10 text-brand-400'
            : 'border-dark-700 bg-dark-800 text-gray-400 hover:border-gray-500'
            }`}
        >
          <span className="mb-1" aria-hidden="true">{type.icon}</span>
          <span className="text-[10px] font-medium leading-tight">{type.label}</span>
        </button>
      ))}
    </div>
  );
}
