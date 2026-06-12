import React from 'react';
import { User, Mail, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MAX_PARTICIPANT_NAME_LENGTH } from '../../utils/constants/validation';

function ParticipantDetailsForm({ name, setName, email, setEmail, localDuration, setLocalDuration, setDuration, singleDay, dateRange, loading, onSaveDetails }) {
  return (
    <div className="bg-dark-900 p-4 md:p-5 rounded-2xl border border-dark-700 mb-6 shrink-0">
      <div className="flex flex-wrap items-center gap-3">

        <div className="relative group flex-1 min-w-[180px]">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <User size={16} className="text-gray-500 group-hover:text-brand-400 transition-colors" />
          </div>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value.slice(0, MAX_PARTICIPANT_NAME_LENGTH))}
            required
            className="w-full bg-dark-800 hover:bg-dark-700 text-gray-50 font-medium pl-10 pr-4 py-2.5 rounded-full border border-dark-700 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all"
            placeholder="Your Name *"
            maxLength={MAX_PARTICIPANT_NAME_LENGTH}
          />
        </div>

        <div className="relative group flex-1 min-w-[180px]">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail size={16} className="text-gray-500 group-hover:text-brand-400 transition-colors" />
          </div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            maxLength="254"
            className="w-full bg-dark-800 hover:bg-dark-700 text-gray-50 font-medium pl-10 pr-4 py-2.5 rounded-full border border-dark-700 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all"
            placeholder="Email (optional)"
          />
        </div>

        <p className="w-full text-[10px] text-gray-500 mt-1 px-2 leading-tight">
          Your details are stored to identify you within this group. See our <Link to="/privacy" className="text-brand-500 hover:underline">Privacy Policy</Link>.
        </p>

        {!singleDay && (
          <div className="flex items-center gap-1.5 bg-dark-800 px-3 py-1.5 rounded-full border border-dark-700 focus-within:ring-2 focus-within:ring-brand-500/30 focus-within:border-brand-500 transition-all shrink-0">
            <Clock size={16} className="text-gray-500" />
            <input
              type="number"
              min="1"
              max={dateRange.length}
              value={localDuration}
              onChange={(e) => setLocalDuration(e.target.value)}
              onBlur={() => {
                let val = parseInt(localDuration);
                if (isNaN(val) || val < 1) val = 1;
                if (val > dateRange.length) val = dateRange.length;
                const strVal = String(val);
                setLocalDuration(strVal);
                setDuration(strVal);
              }}
              className="w-8 text-center bg-transparent font-bold text-gray-50 focus:outline-none p-0"
            />
            <span className="text-gray-400 font-medium pr-2 text-sm">days</span>
          </div>
        )}

        <button
          type="button"
          onClick={onSaveDetails}
          disabled={loading}
          className="flex items-center justify-center shrink-0 bg-dark-800 hover:bg-dark-700 text-gray-300 font-bold px-4 py-2 rounded-full transition-all border border-dark-700 focus:outline-none focus:ring-2 focus:ring-brand-500/30 disabled:opacity-50 h-[38px] my-auto"
        >
          {loading ? 'Saving...' : 'Save Details'}
        </button>

      </div>
    </div>
  );
}

export { ParticipantDetailsForm };
