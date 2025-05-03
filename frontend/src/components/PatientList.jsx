import React from 'react';

const patients = [
  { id: 1, name: "Mary R." },
  { id: 2, name: "John D." },
  { id: 3, name: "Robert T." }
];

export default function PatientList({ onSelectPatient }) {
  return (
    <div>
      <h2 className="font-semibold text-lg mb-4">Patients</h2>
      <ul className="space-y-2">
        {patients.map((patient) => (
          <li
            key={patient.id}
            className="bg-white p-3 rounded shadow hover:bg-blue-100 cursor-pointer"
            onClick={() => onSelectPatient(patient)}
          >
            {patient.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
