import React from "react";
import PatientList from "./components/PatientList";
import VitalsDisplay from "./components/VitalsDisplay";
import DoctorAssistantChat from "./components/DoctorAssistantChat";
import AlertsSection from "./components/AlertsSection";
import PatientQuestionnaire from "./components/PatientQuestionnaire";
import AudioRecorder from "./components/AudioRecorder";

export default function App() {
  return (
    <div className="h-screen flex bg-gray-50">
      {/* Left Panel - Patient List */}
      <div className="w-1/5 border-r border-gray-200 p-4">
        <PatientList />
      </div>

      {/* Center Panel - Vitals, Alerts, Forms */}
      <div className="w-3/5 p-4 space-y-4 overflow-y-auto">
        <VitalsDisplay />
        <AlertsSection />
        <PatientQuestionnaire />
        <AudioRecorder />
      </div>

      {/* Right Panel - AI Assistant */}
      <div className="w-1/4 border-l border-gray-200 p-4">
        <DoctorAssistantChat />
      </div>
    </div>
  );
}
