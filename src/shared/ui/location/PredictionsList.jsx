import React from 'react';

function PredictionsList({ predictions, inputValue, loading, onSelect }) {
  if (predictions.length > 0) {
    return (
      <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-dark-800 border border-dark-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
        {predictions.map((prediction, index) => (
          <button
            key={index}
            type="button"
            onClick={() => onSelect(prediction)}
            className="w-full text-left px-4 py-2.5 hover:bg-dark-700 transition-colors border-b border-dark-700 last:border-b-0"
          >
            <div className="text-sm text-gray-200">{prediction.main_text}</div>
            {prediction.secondary_text && (
              <div className="text-xs text-gray-500">{prediction.secondary_text}</div>
            )}
          </button>
        ))}
      </div>
    );
  }

  if (inputValue.length >= 2 && !loading) {
    return (
      <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-dark-800 border border-dark-700 rounded-lg shadow-lg p-3 text-sm text-gray-400">
        No results found
      </div>
    );
  }

  return null;
}

export default PredictionsList;
