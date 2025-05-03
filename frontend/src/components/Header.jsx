import React from 'react';

export default function Header() {
  return (
    <header className="w-full bg-blue-600 text-white px-6 py-3 flex justify-between items-center shadow-md">
      {/* Left - App Name */}
      <h1 className="text-xl font-bold tracking-wide">DoctR<span className="text-blue-200">.AI</span></h1>

      {/* Right - Action Buttons */}
      <div className="space-x-4">
        <button className="bg-blue-500 hover:bg-blue-700 px-3 py-1 rounded text-sm">Dashboard</button>
        <button className="bg-blue-500 hover:bg-blue-700 px-3 py-1 rounded text-sm">Settings</button>
        <button className="bg-red-500 hover:bg-red-700 px-3 py-1 rounded text-sm">Logout</button>
      </div>
    </header>
  );
}
