import React from 'react';

export default function PatientList() {
  return (
    <div>
      <h2 className="font-semibold text-lg mb-2">Patients</h2>
      <ul className="space-y-2">
        <li className="bg-white p-2 rounded shadow hover:bg-blue-50 cursor-pointer">Mary R.</li>
        <li className="bg-white p-2 rounded shadow hover:bg-blue-50 cursor-pointer">John D.</li>
        <li className="bg-white p-2 rounded shadow hover:bg-blue-50 cursor-pointer">Robert T.</li>
      </ul>
    </div>
  );
}
