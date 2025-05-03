import React from 'react';

export default function AlertsSection() {
  const alerts = [
    { time: "10:42 AM", message: "BP spike detected", type: "danger" },
    { time: "10:45 AM", message: "Heart rate dropped below 60 bpm", type: "danger" },
  ];

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
      <h2 className="text-lg font-semibold mb-2 text-white">Alerts</h2>
      <ul className="space-y-2 list-disc list-inside text-red-400 text-sm">
        {alerts.map((alert, idx) => (
          <li key={idx}>
            <span className="font-medium text-red-500">{alert.time}</span>: {alert.message}
          </li>
        ))}
      </ul>
    </div>
  );
}
