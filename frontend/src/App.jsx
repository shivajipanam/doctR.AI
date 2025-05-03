// App.jsx
import React, { useState } from "react";
import Header from "./components/Header";
import PatientList from "./components/PatientList";
import VitalsDisplay from "./components/VitalsDisplay";
import DoctorAssistantChat from "./components/DoctorAssistantChat";
import AlertsSection from "./components/AlertsSection";
import PatientQuestionnaire from "./components/PatientQuestionnaire";
import AudioRecorder from "./components/AudioRecorder";

export default function App() {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patients, setPatients] = useState([
    "Angela G.", "Mary R.", "John D.", "Robert T.", "Linda S.", "James K.",
    "Emily L.", "George M.", "Sophia P.", "Ethan C.", "Ava W."
  ]);

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/5 bg-gray-800 border-r border-gray-700 p-4 overflow-y-auto">
          <PatientList
            patients={patients}
            setPatients={setPatients}
            onSelectPatient={setSelectedPatient}
          />
        </div>

        <div className="w-3/5 p-4 space-y-4 overflow-y-auto">
          <AlertsSection />
          <VitalsDisplay patient={selectedPatient} />
          <PatientQuestionnaire />
          <AudioRecorder />
        </div>

        <div className="w-1/4 bg-gray-800 border-l border-gray-700 p-4 flex flex-col">
          <h2 className="text-lg font-semibold mb-2">Assistant</h2>
          <DoctorAssistantChat patientNames={patients} />
        </div>
      </div>
    </div>
  );
}
