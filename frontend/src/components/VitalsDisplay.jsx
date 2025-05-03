import React, { useEffect, useState } from 'react';
import {
  LineChart, Line,
  BarChart, Bar,
  AreaChart, Area,
  PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

export default function VitalsDisplay({ patient }) {
  const [data, setData] = useState([]);
  const [latestTemp, setLatestTemp] = useState(98.6);

  useEffect(() => {
    if (!patient) return;

    setData([]);

    const interval = setInterval(() => {
      const newTemp = 97 + Math.random() * 4;
      setLatestTemp(newTemp);

      setData((prev) => [
        ...prev.slice(-19),
        {
          time: new Date().toLocaleTimeString().slice(0, 8),
          heartRate: 60 + Math.floor(Math.random() * 40),
          systolic: 100 + Math.floor(Math.random() * 20),
          diastolic: 60 + Math.floor(Math.random() * 10),
          spo2: 94 + Math.floor(Math.random() * 5),
          temperature: parseFloat(newTemp.toFixed(1))
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

  // Determine pie chart category
  const getTempCategory = (temp) => {
    if (temp > 99.5) return "Fever";
    if (temp < 97.0) return "Hypothermia";
    return "Normal";
  };

  const tempCategory = getTempCategory(latestTemp);
  const pieData = [
    { name: "Normal", value: tempCategory === "Normal" ? 1 : 0 },
    { name: "Fever", value: tempCategory === "Fever" ? 1 : 0 },
    { name: "Hypothermia", value: tempCategory === "Hypothermia" ? 1 : 0 }
  ];

  const COLORS = ["#10b981", "#f87171", "#60a5fa"];

  return (
    <div className="bg-white rounded-lg shadow p-4 space-y-8">
      <h2 className="text-lg font-semibold">Vitals for {patient.name}</h2>

      {/* Heart Rate - Line */}
      <div className="h-56">
        <h3 className="font-medium mb-2">Heart Rate (Line Chart)</h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="time" />
            <YAxis domain={[50, 130]} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="heartRate" stroke="#f43f5e" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Blood Pressure - Bar */}
      <div className="h-56">
        <h3 className="font-medium mb-2">Blood Pressure (Bar Chart)</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="systolic" fill="#3b82f6" />
            <Bar dataKey="diastolic" fill="#6366f1" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* SpO₂ - Area */}
      <div className="h-56">
        <h3 className="font-medium mb-2">SpO₂ (Area Chart)</h3>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <XAxis dataKey="time" />
            <YAxis domain={[90, 100]} />
            <Tooltip />
            <Area type="monotone" dataKey="spo2" stroke="#10b981" fill="#d1fae5" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Temperature - Pie */}
      <div className="h-56">
        <h3 className="font-medium mb-2">Temperature Status (Pie Chart)</h3>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        <p className="text-center mt-2 text-sm text-gray-600">
          Latest temperature: {latestTemp.toFixed(1)}°F → {tempCategory}
        </p>
      </div>
    </div>
  );
}
