import React from 'react';

export default function AlertsSection() {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-semibold mb-2">Alerts</h2>
      <ul className="list-disc list-inside text-red-600">
        <li>BP spike detected at 10:42 AM</li>
        <li>Heart rate dropped below 60 bpm</li>
      </ul>
    </div>
  );
}
