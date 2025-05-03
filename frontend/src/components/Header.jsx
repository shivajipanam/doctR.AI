import React from 'react';

export default function Header() {
  return (
    <header className="w-full bg-gray-800 text-white px-6 py-3 flex justify-between items-center shadow">
      {/* App Name */}
      <h1 className="text-xl font-bold">
        Doct<span className="text-blue-400">R.AI</span>
      </h1>

      {/* Controls */}
      <div className="space-x-4">
        <button className="bg-blue-600 hover:bg-blue-700 px-4 py-1 rounded text-sm">Dashboard</button>
        <button className="bg-gray-700 hover:bg-gray-600 px-4 py-1 rounded text-sm">Settings</button>
        <button className="bg-red-600 hover:bg-red-700 px-4 py-1 rounded text-sm">Logout</button>
      </div>
    </header>
  );
}
