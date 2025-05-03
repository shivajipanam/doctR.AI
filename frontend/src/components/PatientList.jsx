import React, { useState } from 'react';

export default function PatientList({ patients, setPatients, onSelectPatient }) {
  const [page, setPage] = useState(1);
  const patientsPerPage = 5;
  const start = (page - 1) * patientsPerPage;
  const paginated = patients.slice(start, start + patientsPerPage);

  const handleDelete = (nameToDelete) => {
    const filtered = patients.filter(name => name !== nameToDelete);
    setPatients(filtered);

    const newPageCount = Math.ceil(filtered.length / patientsPerPage);
    if (page > newPageCount) setPage(newPageCount || 1);
  };

  return (
    <div className="text-white">
      <h2 className="text-lg font-semibold mb-3">Patients</h2>

      <input
        type="text"
        placeholder="Search patients..."
        className="w-full mb-4 px-3 py-2 rounded bg-gray-700 text-sm text-gray-200 placeholder-gray-400 focus:outline-none"
      />

      <ul className="space-y-2 mb-4">
        {paginated.map((name, i) => (
          <li
            key={i}
            className="bg-gray-700 flex justify-between items-center hover:bg-blue-600 px-4 py-2 rounded text-sm cursor-pointer"
          >
            <span onClick={() => onSelectPatient({ name })} className="flex-1">{name}</span>
            <button
              onClick={() => handleDelete(name)}
              className="text-red-400 hover:text-red-600 text-lg ml-2"
              title="Remove patient"
            >
              ✖
            </button>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between text-xs text-gray-400">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="hover:text-white disabled:text-gray-600"
          disabled={page === 1}
        >
          Prev
        </button>
        <span>Page {page} of {Math.max(1, Math.ceil(patients.length / patientsPerPage))}</span>
        <button
          onClick={() => setPage((p) => Math.min(Math.ceil(patients.length / patientsPerPage), p + 1))}
          className="hover:text-white disabled:text-gray-600"
          disabled={page >= Math.ceil(patients.length / patientsPerPage)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
