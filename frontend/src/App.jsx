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

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <Header />

      {/* Main Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left - Patient List */}
        <div className="w-1/5 border-r border-gray-200 p-4 overflow-y-auto">
          <PatientList onSelectPatient={setSelectedPatient} />
        </div>

        {/* Middle - Vitals + Alerts + Forms */}
        <div className="w-3/5 p-4 space-y-4 overflow-y-auto">
          <VitalsDisplay patient={selectedPatient} />
          <AlertsSection />
          <PatientQuestionnaire />
          <AudioRecorder />
        </div>

        {/* Right - AI Assistant */}
        <div className="w-1/4 border-l border-gray-200 p-4 overflow-y-auto">
          <DoctorAssistantChat />
        </div>
      </div>
    </div>
  );
}
