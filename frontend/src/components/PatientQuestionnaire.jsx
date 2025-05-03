import React from 'react';

export default function PatientQuestionnaire() {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-semibold mb-2">Patient Questionnaire</h2>
      <form className="space-y-3">
        <div>
          <label className="block text-sm font-medium">How are you feeling today?</label>
          <input type="text" className="mt-1 w-full border rounded p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Any recent discomfort or pain?</label>
          <input type="text" className="mt-1 w-full border rounded p-2" />
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Submit
        </button>
      </form>
    </div>
  );
}
