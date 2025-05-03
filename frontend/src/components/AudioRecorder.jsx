import React, { useState } from 'react';

export default function AudioRecorder() {
  const [recording, setRecording] = useState(false);

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
      <h2 className="text-lg font-semibold mb-4 text-white">Voice Dictation</h2>

      <div className="flex items-center space-x-4">
        {!recording ? (
          <button
            onClick={() => setRecording(true)}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm"
          >
            Start Recording
          </button>
        ) : (
          <button
            onClick={() => setRecording(false)}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm"
          >
            Stop Recording
          </button>
        )}
        <span className="text-sm text-gray-300">
          Status: {recording ? "Recording..." : "Idle"}
        </span>
      </div>
    </div>
  );
}
