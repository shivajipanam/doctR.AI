import React, { useState } from 'react';

export default function DoctorAssistantChat({ patientNames }) {
  const qaPairs = [
    {
      question: "Has Angela Gislason’s blood pressure been stable over the last 6 hours?",
      answer: "Angela's systolic blood pressure has fluctuated between 132–148 mmHg in the last 6 hours, with a slight upward trend. Diastolic remained in the 82–88 mmHg range. Overall, there is mild instability, warranting observation but no immediate intervention."
    },
    {
      question: "Are there any abnormal lab results in the last 24 hours for Angela?",
      answer: "Yes. Her WBC count was elevated at 13,200 cells/mcL (normal: 4,500–11,000), indicating possible infection or inflammation. CRP is also high at 20 mg/L."
    },
    {
      question: "Is Angela’s insurance currently valid, and what procedures are covered?",
      answer: "Angela’s insurance is active under HealthSure Premium Plus. It covers hospitalization, diagnostics, and outpatient consultations. MRI scans are included with 10% co-pay. Coverage valid until Dec 31, 2025."
    },
    {
      question: "Has there been any change in Angela's mental status documented today?",
      answer: "Yes. Nursing notes indicate Angela was alert at 08:00 but became mildly disoriented around 13:30. A neurology consult was ordered at 14:00."
    }
  ];

  const [messages, setMessages] = useState([
    { text: "Hello Doctor, how can I assist you today?", sender: "bot" }
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { text: input, sender: "user" }];
    setMessages(newMessages);
    setInput("");

    setTimeout(() => {
      const mentionsAngela = input.toLowerCase().includes("angela");
      const angelaExists = patientNames.includes("Angela G.");

      if (mentionsAngela && !angelaExists) {
        setMessages((prev) => [
          ...prev,
          { text: "No record found for Angela Gislason.", sender: "bot" }
        ]);
        return;
      }

      const match = qaPairs.find(pair =>
        input.toLowerCase().includes(pair.question.toLowerCase().slice(0, 12))
      );

      setMessages((prev) => [
        ...prev,
        {
          text: match ? match.answer : "I'm sorry, I couldn't find data for that query.",
          sender: "bot"
        }
      ]);
    }, 800);
  };

  return (
    <div className="flex flex-col flex-1 bg-gray-900 border border-gray-700 rounded-lg p-4">
      <div className="flex-1 overflow-y-auto space-y-2 mb-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`max-w-[80%] px-4 py-2 text-sm rounded-lg ${
              msg.sender === 'user' ? 'bg-blue-600 text-white self-end' : 'bg-gray-700 text-gray-200 self-start'
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      <div className="flex">
        <input
          type="text"
          className="flex-1 bg-gray-800 text-white border border-gray-600 px-3 py-2 rounded-l-md text-sm focus:outline-none"
          placeholder="Ask the assistant..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button
          onClick={handleSend}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-r-md text-sm text-white"
        >
          Send
        </button>
      </div>
    </div>
  );
}
