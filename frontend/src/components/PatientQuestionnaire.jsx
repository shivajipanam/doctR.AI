import React from 'react';

export default function PatientQuestionnaire() {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
      <h2 className="text-lg font-semibold mb-4 text-white">Patient Questionnaire</h2>

      <form className="space-y-4 text-sm">
        <div>
          <label className="block mb-1 text-gray-300">How are you feeling today?</label>
          <input
            type="text"
            className="w-full px-3 py-2 rounded bg-gray-700 text-gray-200 border border-gray-600 focus:outline-none"
          />
        </div>

        <div>
          <label className="block mb-1 text-gray-300">Any recent discomfort or pain?</label>
          <input
            type="text"
            className="w-full px-3 py-2 rounded bg-gray-700 text-gray-200 border border-gray-600 focus:outline-none"
          />
        </div>

        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm">
          Submit
        </button>
      </form>
    </div>
  );
}
