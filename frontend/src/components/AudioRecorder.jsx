import React from 'react';

export default function AudioRecorder() {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-semibold mb-2">Dictation / Voice Notes</h2>
      <div className="flex items-center space-x-3">
        <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
          Start Recording
        </button>
        <button className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400">
          Stop
        </button>
        <span className="text-sm text-gray-600">[Recording status]</span>
      </div>
    </div>
  );
}
