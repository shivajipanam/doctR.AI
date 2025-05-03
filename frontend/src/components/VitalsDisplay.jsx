import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function VitalsDisplay({ patient }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    if (!patient) return;

    const interval = setInterval(() => {
      setData((prev) => [
        ...prev.slice(-19),
        {
          time: new Date().toLocaleTimeString().slice(0, 8),
          heartRate: 60 + Math.floor(Math.random() * 40),
          systolic: 100 + Math.floor(Math.random() * 20),
          diastolic: 60 + Math.floor(Math.random() * 10)
        }
      ]);
    }, 1000);

    return () => clearInterval(interval);
  }, [patient]);

  if (!patient) {
    return (
      <div className="bg-white rounded-lg shadow p-4 text-gray-500">
        Select a patient to view real-time vitals.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-semibold mb-4">Real-Time Vitals for {patient.name}</h2>

      <div className="h-56 mb-6">
        <h3 className="font-medium mb-2">Heart Rate (bpm)</h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="time" />
            <YAxis domain={[50, 120]} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="heartRate" stroke="#f43f5e" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="h-56">
        <h3 className="font-medium mb-2">Blood Pressure (mmHg)</h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="time" />
            <YAxis domain={[50, 150]} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="systolic" stroke="#3b82f6" name="Systolic" />
            <Line type="monotone" dataKey="diastolic" stroke="#6366f1" name="Diastolic" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
